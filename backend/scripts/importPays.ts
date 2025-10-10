import cron from 'node-cron';
import axios from 'axios';
import winston from 'winston';
import { Pays } from '../models/index.js';

// Configuration du logger Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
    })
  ),
  transports: [
    // Console pour le développement
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    // Fichier pour les erreurs
    new winston.transports.File({ 
      filename: 'logs/import-pays-error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Fichier pour tous les logs
    new winston.transports.File({ 
      filename: 'logs/import-pays.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Définitions de types pour l'API AirLabs
interface CountryData {
  code: string;      // Code ISO alpha-2 (ex: "FR")
  code3: string;     // Code ISO alpha-3 (ex: "FRA")
  name: string;      // Nom du pays (ex: "France")
}

interface AirLabsResponse {
  request: any;
  response: CountryData[];
  terms: string;
}

interface PaysImportResult {
  success: boolean;
  imported: number;
  failed: number;
  error?: string;
}

/**
 * Importe les pays depuis l'API AirLabs
 * @returns Résultat de l'opération d'importation
 */
export async function importPays(): Promise<PaysImportResult> {
  try {
    logger.info('Début de l\'importation des pays...');
    
    // Clé API AirLabs
    const API_KEY = process.env.AIRLABS_API_KEY;
      if (!API_KEY) {
          throw new Error('AIRLABS_API_KEY manquante dans le fichier .env');
      }

    // Récupération des données depuis l'API AirLabs avec timeout
    const response = await axios.get<AirLabsResponse>(
      'https://airlabs.co/api/v9/countries',
      {
        params: {
          api_key: API_KEY,
          _fields: 'name,code'
        },
        timeout: 10000, // Timeout de 10 secondes
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.response || !Array.isArray(response.data.response)) {
      throw new Error('Réponse invalide de l\'API AirLabs');
    }

    const countries = response.data.response;
    logger.info(`${countries.length} pays récupérés depuis l'API AirLabs`);

    // Validation et mapping des données de pays
    const paysData = countries
      .filter((country: CountryData) => {
        // Filtrer les entrées invalides
        return country.name && country.code;
      })
      .map((country: CountryData) => ({
        nom_pays: country.name,
        code_iso_pays: country.code,
      }));

    if (paysData.length === 0) {
      throw new Error('Aucune donnée de pays valide à importer');
    }

    logger.info(`${paysData.length} pays validés pour l'importation`);

    // Création en masse avec gestion des doublons
    const result = await Pays.bulkCreate(paysData, { 
      ignoreDuplicates: true,
      validate: true,
    });

    const importedCount = result.length;
    logger.info(`✅ ${importedCount} pays importés avec succès`);
    logger.info(`⏭️  ${paysData.length - importedCount} doublons ignorés`);

    return {
      success: true,
      imported: importedCount,
      failed: 0,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    logger.error('❌ Erreur lors de l\'importation des pays:', { error: errorMessage });
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error('Timeout de la requête - L\'API a mis trop de temps à répondre');
      } else if (error.response) {
        logger.error(`L'API AirLabs a répondu avec le statut ${error.response.status}`);
        if (error.response.status === 401) {
          logger.error('Clé API invalide ou expirée - Vérifiez votre clé API AirLabs');
        } else if (error.response.status === 429) {
          logger.error('Limite de requêtes dépassée - Attendez avant de réessayer');
        }
      } else if (error.request) {
        logger.error('Aucune réponse reçue de l\'API - problème réseau');
      }
    }

    return {
      success: false,
      imported: 0,
      failed: 1,
      error: errorMessage,
    };
  }
}

// Variable globale pour gérer le cron job
let cronJob: cron.ScheduledTask | null = null;

/**
 * Démarre la tâche cron pour l'importation quotidienne des pays
 * S'exécute tous les jours à minuit (00:00)
 */
export function startCronJob(): void {
  logger.info('📅 Démarrage de la tâche cron d\'importation des pays (exécution quotidienne à minuit)');
  
  cronJob = cron.schedule('0 0 * * *', async () => {
    logger.info('🕐 Tâche cron déclenchée - importation des pays...');
    const result = await importPays();
    
    if (result.success) {
      logger.info(`✅ Tâche cron terminée : ${result.imported} pays importés`);
    } else {
      logger.error(`❌ Échec de la tâche cron : ${result.error}`);
    }
  });
}

/**
 * Arrête la tâche cron proprement
 */
export function stopCronJob(): void {
  if (cronJob) {
    cronJob.stop();
    logger.info('🛑 Tâche cron arrêtée');
  }
}

/**
 * Exécute l'importation immédiatement (pour exécution manuelle)
 */
export async function runImportNow(): Promise<void> {
  logger.info('🚀 Importation manuelle déclenchée');
  const result = await importPays();
  
  if (!result.success) {
    process.exit(1);
  }
}

/**
 * Gestion de l'arrêt gracieux (Graceful Shutdown)
 * Gère les signaux SIGINT (Ctrl+C) et SIGTERM (kill)
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    logger.info(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
    
    // Arrêter le cron job s'il est actif
    stopCronJob();
    
    // Fermer la connexion à la base de données si nécessaire
    try {
      // Sequelize se ferme automatiquement, mais on peut le forcer
      logger.info('Fermeture des connexions...');
      // await sequelize.close(); // Si vous voulez forcer la fermeture
      logger.info('✅ Arrêt gracieux terminé');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Erreur lors de l\'arrêt gracieux', { error });
      process.exit(1);
    }
  };

  // Écouter les signaux d'arrêt
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  // Gérer les erreurs non capturées
  process.on('uncaughtException', (error) => {
    logger.error('❌ Exception non capturée:', { error });
    shutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Promesse rejetée non gérée:', { reason, promise });
    shutdown('unhandledRejection');
  });
}

// Démarre la tâche cron uniquement si ce fichier est exécuté directement (pas importé)
if (import.meta.url === `file://${process.argv[1]}`) {
  // Configurer le graceful shutdown
  setupGracefulShutdown();
  
  logger.info('Exécution directe du script d\'importation...');
  runImportNow().then(() => {
    logger.info('Importation terminée. Arrêt...');
    process.exit(0);
  }).catch((error) => {
    logger.error('Échec de l\'importation:', { error });
    process.exit(1);
  });
}




