import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient, { isRedisReady } from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Configuration des Rate Limiters pour différents types de routes
 * 
 * Rate limiting = limitation du nombre de requêtes par IP sur une période donnée
 * Protection contre : Brute-force, DDoS, spam
 * 
 * Store Redis: Si Redis est connecté, utilise RedisStore (distribué)
 *              Sinon, utilise le store en mémoire (fallback)
 */

// Helper pour créer un rate limiter avec store Redis si disponible
function createRateLimiter(options: any) {
    const opts = { ...options };
    
    // Ajouter le store Redis SEULEMENT si vraiment prêt ET pas en mode test
    // En mode test, utiliser MemoryStore pour éviter les problèmes de compatibilité
    if (isRedisReady() && process.env.NODE_ENV !== 'test') {
        try {
            opts.store = new RedisStore({
                // @ts-ignore - RedisStore attend un client v4
                client: redisClient,
                prefix: 'rl:', // Prefix pour les clés Redis
            });
            logger.info('✅ Rate Limiter: Redis Store activé');
        } catch (error: any) {
            logger.warn('⚠️  Rate Limiter: Erreur création Redis Store, fallback MemoryStore', {
                error: error.message
            });
            // Fallback sur MemoryStore (par défaut)
        }
    } else if (process.env.NODE_ENV !== 'test') {
        logger.warn('⚠️  Rate Limiter: Redis pas encore prêt, utilisation MemoryStore temporaire');
    }
    
    return rateLimit(opts);
}

// ========================================
// RATE LIMITER POUR ROUTES PUBLIQUES
// ========================================
// Limite: 100 requêtes par 15 minutes par IP
export const rateLimitPublic = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes max
    message: {
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite de 100 requêtes par 15 minutes. Veuillez réessayer plus tard.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Retourne `RateLimit-*` headers
    legacyHeaders: false, // Désactive `X-RateLimit-*` headers
    handler: (req: any, res: any) => {
        res.status(429).json({
            error: 'Trop de requêtes',
            message: 'Vous avez dépassé la limite de 100 requêtes par 15 minutes. Veuillez réessayer plus tard.',
            retryAfter: '15 minutes'
        });
    }
});

// ========================================
// RATE LIMITER POUR ROUTES AUTHENTIFIÉES
// ========================================
// Limite: 300 requêtes par 15 minutes par IP
export const rateLimitAuth = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requêtes max
    message: {
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite de 300 requêtes par 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => {
        // Skip pour les webhooks (ils ont leurs propres limites)
        return req.path.includes('/webhook');
    }
});

// ========================================
// RATE LIMITER POUR ROUTES ADMIN
// ========================================
// Limite: 1000 requêtes par 15 minutes par IP
export const rateLimitAdmin = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requêtes max
    message: {
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite de 1000 requêtes par 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ========================================
// RATE LIMITER STRICT POUR LOGIN
// ========================================
// Limite: 5 tentatives par 15 minutes par IP
// Protection contre brute-force attacks
export const rateLimitLogin = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: {
        error: 'Trop de tentatives de connexion',
        message: 'Vous avez dépassé la limite de 5 tentatives de connexion. Veuillez réessayer dans 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne compte que les échecs
    handler: (req: any, res: any) => {
        logger.warn(`⚠️  Brute-force détecté : ${req.ip} sur ${req.path}`);
        res.status(429).json({
            error: 'Trop de tentatives de connexion',
            message: 'Trop de tentatives échouées. Veuillez réessayer dans 15 minutes.',
            retryAfter: '15 minutes'
        });
    }
});

// ========================================
// RATE LIMITER POUR UPLOAD
// ========================================
// Limite: 10 uploads par 15 minutes par IP
// Protection contre spam d'images
export const rateLimitUpload = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads max
    message: {
        error: 'Trop d\'uploads',
        message: 'Vous avez dépassé la limite de 10 uploads par 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ========================================
// RATE LIMITER GLOBAL (fallback)
// ========================================
// Limite très large pour toutes les routes non spécifiées
export const rateLimitGlobal = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requêtes max
    message: {
        error: 'Trop de requêtes',
        message: 'Vous avez dépassé la limite globale de requêtes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

