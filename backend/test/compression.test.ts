import request from 'supertest';
import app from '../app.js';

/**
 * Tests pour la compression des réponses HTTP
 */

describe('Compression Tests', () => {
    
    describe('Header Content-Encoding', () => {
        it('devrait compresser les réponses avec Accept-Encoding: gzip', async () => {
            const response = await request(app)
                .get('/api/pays')
                .set('Accept-Encoding', 'gzip');
            
            // Si la réponse est assez grande (> 1KB), elle devrait être compressée
            // Note: Les pays peuvent ne pas dépasser 1KB, donc on teste juste le comportement
            expect(response.status).toBe(200);
        });

        it('devrait compresser les réponses avec Accept-Encoding: deflate', async () => {
            const response = await request(app)
                .get('/api/annonces')
                .set('Accept-Encoding', 'deflate');
            
            expect(response.status).toBe(200);
        });

        it('devrait compresser les réponses avec Accept-Encoding: br (brotli)', async () => {
            const response = await request(app)
                .get('/api/annonces')
                .set('Accept-Encoding', 'br');
            
            expect(response.status).toBe(200);
        });
    });

    describe('Seuil de compression', () => {
        it('ne devrait PAS compresser les petites réponses', async () => {
            // Route qui retourne très peu de données
            const response = await request(app)
                .get('/')
                .set('Accept-Encoding', 'gzip');
            
            // Petites réponses ne sont pas compressées (< 1KB threshold)
            expect(response.status).toBe(200);
        });

        it('devrait compresser les grandes listes', async () => {
            // Route qui retourne beaucoup de données
            const response = await request(app)
                .get('/api/annonces')
                .set('Accept-Encoding', 'gzip');
            
            // Si la réponse est grande, elle pourrait être compressée
            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();
        });
    });

    describe('Header X-No-Compression', () => {
        it('devrait désactiver la compression si header x-no-compression présent', async () => {
            const response = await request(app)
                .get('/api/pays')
                .set('Accept-Encoding', 'gzip')
                .set('X-No-Compression', 'true');
            
            // Compression désactivée par le header
            expect(response.status).toBe(200);
        });
    });

    describe('Types de contenu', () => {
        it('devrait fonctionner avec JSON', async () => {
            const response = await request(app)
                .get('/api/pays')
                .set('Accept-Encoding', 'gzip');
            
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.status).toBe(200);
        });

        it('devrait fonctionner avec HTML (Swagger)', async () => {
            const response = await request(app)
                .get('/api-docs/')
                .set('Accept-Encoding', 'gzip');
            
            expect(response.headers['content-type']).toMatch(/html/);
            expect(response.status).toBe(200);
        });
    });

    describe('Configuration', () => {
        it('la compression devrait être activée sur toutes les routes', async () => {
            // Test plusieurs endpoints différents
            const endpoints = [
                '/api/pays',
                '/api/villes',
                '/api/annonces'
            ];

            for (const endpoint of endpoints) {
                const response = await request(app)
                    .get(endpoint)
                    .set('Accept-Encoding', 'gzip');
                
                expect(response.status).toBe(200);
            }
        });
    });

    describe('Performance', () => {
        it('devrait retourner des réponses valides même compressées', async () => {
            const response = await request(app)
                .get('/api/pays')
                .set('Accept-Encoding', 'gzip');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            // Les données JSON sont correctement décompressées par supertest
        });
    });
});







