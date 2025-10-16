import { jest } from '@jest/globals';

/**
 * Tests pour le service de cache Redis
 */

// Mock Redis avec des fonctions simulées
const mockRedisGet = jest.fn();
const mockRedisSet = jest.fn();
const mockRedisDel = jest.fn();
const mockRedisDelPattern = jest.fn();
const mockIsRedisConnected = jest.fn();

jest.unstable_mockModule('../config/redis.js', () => ({
    redisGet: mockRedisGet,
    redisSet: mockRedisSet,
    redisDel: mockRedisDel,
    redisDelPattern: mockRedisDelPattern,
    isRedisConnected: mockIsRedisConnected,
    default: {} // Mock du client Redis
}));

const cacheService = await import('../services/cacheService.js');

describe('Cache Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsRedisConnected.mockReturnValue(true); // Par défaut, Redis est connecté
    });

    describe('getCached', () => {
        it('devrait retourner les données du cache si elles existent', async () => {
            const mockData = { id: 1, name: 'Test' };
            mockRedisGet.mockResolvedValue(JSON.stringify(mockData));

            const result = await cacheService.getCached('test:key');

            expect(mockRedisGet).toHaveBeenCalledWith('test:key');
            expect(result).toEqual(mockData);
        });

        it('devrait retourner null si les données ne sont pas en cache', async () => {
            mockRedisGet.mockResolvedValue(null);

            const result = await cacheService.getCached('test:key');

            expect(mockRedisGet).toHaveBeenCalledWith('test:key');
            expect(result).toBeNull();
        });

        it('devrait gérer les erreurs gracieusement', async () => {
            mockRedisGet.mockRejectedValue(new Error('Redis error'));

            const result = await cacheService.getCached('test:key');

            expect(result).toBeNull();
        });
    });

    describe('setCache', () => {
        it('devrait mettre des données en cache avec un TTL', async () => {
            const mockData = { id: 1, name: 'Test' };
            mockRedisSet.mockResolvedValue(true);

            await cacheService.setCache('test:key', mockData, 3600);

            expect(mockRedisSet).toHaveBeenCalledWith(
                'test:key',
                JSON.stringify(mockData),
                3600
            );
        });

        it('devrait gérer les erreurs lors de la mise en cache', async () => {
            mockRedisSet.mockRejectedValue(new Error('Redis error'));

            // Ne devrait pas lancer d'erreur
            await expect(
                cacheService.setCache('test:key', { data: 'test' }, 3600)
            ).resolves.not.toThrow();
        });
    });

    describe('cacheOrFetch', () => {
        it('devrait retourner les données du cache si elles existent (Cache HIT)', async () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            mockRedisGet.mockResolvedValue(JSON.stringify(mockData));
            const fetchFn = jest.fn();

            const result = await cacheService.cacheOrFetch('test:key', fetchFn, 3600);

            expect(mockRedisGet).toHaveBeenCalledWith('test:key');
            expect(fetchFn).not.toHaveBeenCalled(); // Ne devrait pas fetcher
            expect(result).toEqual(mockData);
        });

        it('devrait fetcher et mettre en cache si absent (Cache MISS)', async () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            mockRedisGet.mockResolvedValue(null); // Cache MISS
            mockRedisSet.mockResolvedValue(true);
            const fetchFn = jest.fn().mockResolvedValue(mockData);

            const result = await cacheService.cacheOrFetch('test:key', fetchFn, 3600);

            expect(mockRedisGet).toHaveBeenCalledWith('test:key');
            expect(fetchFn).toHaveBeenCalled(); // Devrait fetcher
            expect(mockRedisSet).toHaveBeenCalledWith(
                'test:key',
                JSON.stringify(mockData),
                3600
            );
            expect(result).toEqual(mockData);
        });

        it('devrait bypasser le cache si Redis non connecté', async () => {
            mockIsRedisConnected.mockReturnValue(false);
            const mockData = [{ id: 1 }];
            const fetchFn = jest.fn().mockResolvedValue(mockData);

            const result = await cacheService.cacheOrFetch('test:key', fetchFn, 3600);

            expect(mockRedisGet).not.toHaveBeenCalled();
            expect(fetchFn).toHaveBeenCalled();
            expect(mockRedisSet).not.toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });
    });

    describe('Helpers spécifiques', () => {
        it('getPaysCache devrait utiliser le bon TTL (24h)', async () => {
            const mockData = [{ id_pays: 1, nom_pays: 'France' }];
            mockRedisGet.mockResolvedValue(null);
            mockRedisSet.mockResolvedValue(true);
            const fetchFn = jest.fn().mockResolvedValue(mockData);

            await cacheService.getPaysCache(fetchFn);

            expect(mockRedisSet).toHaveBeenCalledWith(
                'pays:all',
                JSON.stringify(mockData),
                86400 // 24h = 86400 secondes
            );
        });

        it('getVillesCache devrait utiliser le bon TTL (24h)', async () => {
            const mockData = [{ id_ville: 1, nom_ville: 'Paris' }];
            mockRedisGet.mockResolvedValue(null);
            mockRedisSet.mockResolvedValue(true);
            const fetchFn = jest.fn().mockResolvedValue(mockData);

            await cacheService.getVillesCache(fetchFn);

            expect(mockRedisSet).toHaveBeenCalledWith(
                'villes:all',
                JSON.stringify(mockData),
                86400
            );
        });

        it('getTypesAbonnementCache devrait utiliser le bon TTL (1h)', async () => {
            const mockData = [{ id_type: 1, nom_type: 'Premium' }];
            mockRedisGet.mockResolvedValue(null);
            mockRedisSet.mockResolvedValue(true);
            const fetchFn = jest.fn().mockResolvedValue(mockData);

            await cacheService.getTypesAbonnementCache(fetchFn);

            expect(mockRedisSet).toHaveBeenCalledWith(
                'types_abonnement:all',
                JSON.stringify(mockData),
                3600 // 1h = 3600 secondes
            );
        });
    });

    describe('Invalidation du cache', () => {
        it('invalidatePaysCache devrait supprimer la clé pays', async () => {
            mockRedisDel.mockResolvedValue(true);

            await cacheService.invalidatePaysCache();

            expect(mockRedisDel).toHaveBeenCalledWith('pays:all');
        });

        it('invalidateVillesCache devrait supprimer toutes les clés villes', async () => {
            mockRedisDelPattern.mockResolvedValue(3);

            await cacheService.invalidateVillesCache();

            expect(mockRedisDelPattern).toHaveBeenCalledWith('villes:*');
        });

        it('invalidateAeroportsCache devrait supprimer toutes les clés aéroports', async () => {
            mockRedisDelPattern.mockResolvedValue(5);

            await cacheService.invalidateAeroportsCache();

            expect(mockRedisDelPattern).toHaveBeenCalledWith('aeroports:*');
        });
    });

    describe('TTL Constants', () => {
        it('devrait exporter les bonnes constantes TTL', () => {
            expect(cacheService.TTL.ONE_HOUR).toBe(3600);
            expect(cacheService.TTL.SIX_HOURS).toBe(21600);
            expect(cacheService.TTL.ONE_DAY).toBe(86400);
            expect(cacheService.TTL.ONE_WEEK).toBe(604800);
        });
    });
});



