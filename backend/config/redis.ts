import { createClient } from 'redis';
import logger from './logger.js';

/**
 * Configuration et connexion Redis
 * Utilisé pour :
 * - Cache (pays, villes, aéroports, types abonnements)
 * - Rate limiting (store distribué)
 */

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger.error('❌ Redis: Trop de tentatives de reconnexion');
                return new Error('Trop de tentatives de reconnexion à Redis');
            }
            return retries * 100; // Retry après 100ms, 200ms, 300ms, etc.
        }
    }
});

// Variable pour tracker si Redis est vraiment prêt
let redisReady = false;

// Gestion des événements Redis
redisClient.on('connect', () => {
    logger.info('✅ Redis: Connexion établie');
});

redisClient.on('ready', () => {
    redisReady = true;
    logger.info('✅ Redis: Prêt à recevoir des commandes');
});

redisClient.on('error', (err) => {
    logger.error('❌ Redis Error:', { message: err.message });
});

redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis: Reconnexion en cours...');
});

// Connexion initiale
(async () => {
    try {
        await redisClient.connect();
    } catch (error: any) {
        logger.error('❌ Erreur de connexion à Redis:', { message: error.message });
        logger.warn('⚠️  L\'application continuera sans cache Redis');
    }
})();

// Helper pour vérifier si Redis est connecté
export function isRedisConnected(): boolean {
    return redisClient.isOpen;
}

// Helper pour vérifier si Redis est vraiment prêt (pas juste connecté)
export function isRedisReady(): boolean {
    return redisReady && redisClient.isOpen;
}

// Helper pour gérer les erreurs gracieusement
export async function redisGet(key: string): Promise<string | null> {
    try {
        if (!isRedisConnected()) return null;
        return await redisClient.get(key);
    } catch (error) {
        logger.error(`Erreur Redis GET ${key}:`, error);
        return null;
    }
}

export async function redisSet(key: string, value: string, expirationSeconds?: number): Promise<boolean> {
    try {
        if (!isRedisConnected()) return false;
        
        if (expirationSeconds) {
            await redisClient.setEx(key, expirationSeconds, value);
        } else {
            await redisClient.set(key, value);
        }
        return true;
    } catch (error) {
        logger.error(`Erreur Redis SET ${key}:`, error);
        return false;
    }
}

export async function redisDel(key: string): Promise<boolean> {
    try {
        if (!isRedisConnected()) return false;
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error(`Erreur Redis DEL ${key}:`, error);
        return false;
    }
}

export async function redisDelPattern(pattern: string): Promise<number> {
    try {
        if (!isRedisConnected()) return 0;
        
        // Rechercher toutes les clés correspondant au pattern
        const keys = await redisClient.keys(pattern);
        
        if (keys.length === 0) return 0;
        
        // Supprimer toutes les clés trouvées
        await redisClient.del(keys);
        return keys.length;
    } catch (error) {
        logger.error(`Erreur Redis DEL pattern ${pattern}:`, error);
        return 0;
    }
}

export default redisClient;

