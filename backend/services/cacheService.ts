import { redisGet, redisSet, redisDel, redisDelPattern, isRedisConnected } from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Service de cache Redis avec helpers pour les routes communes
 */

// TTL constants (en secondes)
const TTL = {
    ONE_HOUR: 3600,
    SIX_HOURS: 21600,
    ONE_DAY: 86400,
    ONE_WEEK: 604800
};

/**
 * Cache générique avec try/catch
 */
export async function getCached<T>(key: string): Promise<T | null> {
    try {
        const cached = await redisGet(key);
        if (cached) {
            return JSON.parse(cached) as T;
        }
        return null;
    } catch (error) {
        logger.error(`Erreur getCached ${key}:`, error);
        return null;
    }
}

export async function setCache(key: string, data: any, ttlSeconds: number): Promise<void> {
    try {
        await redisSet(key, JSON.stringify(data), ttlSeconds);
    } catch (error) {
        logger.error(`Erreur setCache ${key}:`, error);
    }
}

/**
 * Helper pour cache avec fallback automatique vers la DB
 * 
 * Usage:
 * const pays = await cacheOrFetch('pays:all', () => Pays.findAll(), TTL.ONE_DAY);
 */
export async function cacheOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
): Promise<T> {
    // Si Redis n'est pas connecté, aller directement en DB
    if (!isRedisConnected()) {
        return await fetchFn();
    }

    // Chercher dans le cache
    const cached = await getCached<T>(key);
    if (cached) {
        logger.debug(`✅ Cache HIT: ${key}`);
        return cached;
    }

    // Cache MISS - Aller en DB
    logger.debug(`❌ Cache MISS: ${key}`);
    const data = await fetchFn();

    // Mettre en cache
    await setCache(key, data, ttlSeconds);
    logger.debug(`💾 Cached: ${key} (TTL: ${ttlSeconds}s)`);

    return data;
}

/**
 * Helpers spécifiques pour chaque type de données
 */

// PAYS - Cache 24h
export async function getPaysCache(fetchFn: () => Promise<any>) {
    return cacheOrFetch('pays:all', fetchFn, TTL.ONE_DAY);
}

export async function invalidatePaysCache() {
    await redisDel('pays:all');
    logger.info('🗑️  Cache pays invalidé');
}

// VILLES - Cache 24h
export async function getVillesCache(fetchFn: () => Promise<any>) {
    return cacheOrFetch('villes:all', fetchFn, TTL.ONE_DAY);
}

export async function getVillesByPaysCache(idPays: number, fetchFn: () => Promise<any>) {
    return cacheOrFetch(`villes:pays:${idPays}`, fetchFn, TTL.ONE_DAY);
}

export async function invalidateVillesCache() {
    const count = await redisDelPattern('villes:*');
    logger.info(`🗑️  Cache villes invalidé (${count} clés)`);
}

// AÉROPORTS - Cache 24h
export async function getAeroportsCache(fetchFn: () => Promise<any>) {
    return cacheOrFetch('aeroports:all', fetchFn, TTL.ONE_DAY);
}

export async function getAeroportsByVilleCache(idVille: number, fetchFn: () => Promise<any>) {
    return cacheOrFetch(`aeroports:ville:${idVille}`, fetchFn, TTL.ONE_DAY);
}

export async function invalidateAeroportsCache() {
    const count = await redisDelPattern('aeroports:*');
    logger.info(`🗑️  Cache aéroports invalidé (${count} clés)`);
}

// TYPES ABONNEMENTS - Cache 1h
export async function getTypesAbonnementCache(fetchFn: () => Promise<any>) {
    return cacheOrFetch('types_abonnement:all', fetchFn, TTL.ONE_HOUR);
}

export async function invalidateTypesAbonnementCache() {
    await redisDel('types_abonnement:all');
    logger.info('🗑️  Cache types abonnement invalidé');
}

export { TTL };

