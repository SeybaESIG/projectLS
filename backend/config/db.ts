import 'dotenv/config';
import { Sequelize } from 'sequelize';
import logger from './logger.js';

/**
 * Configuration Sequelize avec optimisations
 * 
 * Logging SQL :
 * - En développement : Toutes les queries dans la console
 * - En production : Queries lentes (> 1s) dans les logs
 * - En test : Désactivé
 */

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Configuration du logging SQL
const sqlLogging = isTest 
    ? false 
    : (sql: string, timing?: number) => {
        // En production, logger seulement les queries lentes
        if (isProduction && timing && timing < 1000) {
            return; // Skip les queries rapides
        }

        const duration = timing ? `(${timing}ms)` : '';
        
        if (timing && timing > 1000) {
            // Query lente : WARNING
            logger.warn(`🐌 Slow SQL Query ${duration}`, { sql, duration: timing });
        } else if (isDevelopment) {
            // En dev : log toutes les queries en debug
            logger.debug(`SQL ${duration}:`, { sql });
        } else {
            // En prod : log queries normales en info
            logger.info(`SQL ${duration}`, { sql });
        }
    };

const sequelize = new Sequelize(
    process.env.DB_NAME || 'nom_de_la_base',
    process.env.DB_USER || 'utilisateur',
    process.env.DB_PASSWORD || 'mot_de_passe',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: Number(process.env.DB_PORT) || 5432,
        logging: sqlLogging,
        
        // Optimisations Sequelize
        benchmark: true, // Mesure le temps d'exécution
        
        pool: {
            max: 20, // 20 connexions max
            min: 5,  // 5 connexions min
            acquire: 30000, // 30s timeout pour acquérir connexion
            idle: 10000, // Ferme connexion après 10s d'inactivité
        },
        
        // Options de performance
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true,
        },
        
        // Retry automatique sur erreurs réseau
        retry: {
            max: 3,
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
            ],
        },
    }
);

// Log de la connexion
sequelize.authenticate()
    .then(() => {
        logger.info('✅ Connexion PostgreSQL établie', {
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            pool: { min: 5, max: 20 }
        });
    })
    .catch((error) => {
        logger.error('❌ Impossible de se connecter à PostgreSQL:', {
            message: error.message,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
        });
    });

export default sequelize;
