import type { Request, Response, NextFunction } from 'express';
import { redisGet, redisSet, isRedisConnected } from '../config/redis.js';

/**
 * Middleware de cache Redis générique
 * 
 * Utilisation :
 * app.get('/api/pays', cacheMiddleware('pays', 86400), getAllPays);
 * 
 * @param cacheKey - Clé de cache (peut être une fonction pour clés dynamiques)
 * @param ttlSeconds - Durée de vie du cache en secondes
 */
export function cacheMiddleware(
    cacheKey: string | ((req: Request) => string),
    ttlSeconds: number = 3600 // 1 heure par défaut
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Si Redis n'est pas connecté, skip le cache
        if (!isRedisConnected()) {
            return next();
        }

        try {
            // Générer la clé de cache
            const key = typeof cacheKey === 'function' ? cacheKey(req) : cacheKey;
            const fullKey = `cache:${key}`;

            // Chercher dans le cache
            const cachedData = await redisGet(fullKey);

            if (cachedData) {
                // Cache HIT - Retourner les données cachées
                console.log(`✅ Cache HIT: ${fullKey}`);
                return res.json(JSON.parse(cachedData));
            }

            // Cache MISS - Continuer vers le controller
            console.log(`❌ Cache MISS: ${fullKey}`);

            // Intercepter la réponse pour mettre en cache
            const originalJson = res.json.bind(res);
            
            res.json = function(body: any) {
                // Mettre en cache avant d'envoyer
                redisSet(fullKey, JSON.stringify(body), ttlSeconds)
                    .then(() => console.log(`💾 Mise en cache: ${fullKey} (TTL: ${ttlSeconds}s)`))
                    .catch(err => console.error(`Erreur mise en cache ${fullKey}:`, err));
                
                // Envoyer la réponse normalement
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error('Erreur dans le middleware de cache:', error);
            // En cas d'erreur, continuer sans cache
            next();
        }
    };
}

/**
 * Middleware pour invalider le cache après une modification
 * 
 * Utilisation :
 * app.post('/api/pays', invalidateCacheMiddleware('pays:*'), createPays);
 * 
 * @param pattern - Pattern de clés à supprimer (ex: 'pays:*', 'villes:*')
 */
export function invalidateCacheMiddleware(pattern: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Hook sur la réponse pour invalider après succès
        const originalJson = res.json.bind(res);
        
        res.json = function(body: any) {
            // Invalider le cache après une réponse réussie (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                import('../config/redis.js').then(({ redisDelPattern }) => {
                    redisDelPattern(`cache:${pattern}`)
                        .then(count => {
                            if (count > 0) {
                                console.log(`🗑️  Cache invalidé: ${pattern} (${count} clés supprimées)`);
                            }
                        })
                        .catch(err => console.error('Erreur invalidation cache:', err));
                });
            }
            
            return originalJson(body);
        };
        
        next();
    };
}

/**
 * Helper pour générer des clés de cache dynamiques
 */
export const cacheKeys = {
    // Liste complète
    pays: () => 'pays:all',
    villes: () => 'villes:all',
    aeroports: () => 'aeroports:all',
    typesAbonnement: () => 'types_abonnement:all',
    
    // Par ID
    paysById: (id: string) => `pays:${id}`,
    villeById: (id: string) => `ville:${id}`,
    aeroportById: (id: string) => `aeroport:${id}`,
    
    // Avec filtres
    villesByPays: (idPays: string) => `villes:pays:${idPays}`,
    aeroportsByVille: (idVille: string) => `aeroports:ville:${idVille}`,
};







