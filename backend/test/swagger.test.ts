import request from 'supertest';
import app from '../app.js';

/**
 * Tests pour la documentation Swagger/OpenAPI
 */

describe('Swagger Documentation Tests', () => {
    
    describe('GET /api-docs', () => {
        it('devrait retourner la page Swagger UI (HTML)', async () => {
            const response = await request(app).get('/api-docs/');
            
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/html/);
            // Vérifier que c'est bien une page Swagger (contient swagger-ui ou API Documentation)
            expect(response.text).toMatch(/swagger|API Documentation|openapi/i);
        });
    });

    describe('GET /api-docs.json', () => {
        it('devrait retourner la spec OpenAPI en JSON', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toHaveProperty('openapi');
            expect(response.body).toHaveProperty('info');
            expect(response.body).toHaveProperty('paths');
        });

        it('devrait avoir la bonne version OpenAPI', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.body.openapi).toBe('3.0.0');
        });

        it('devrait contenir les informations de l\'API', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.body.info).toHaveProperty('title');
            expect(response.body.info).toHaveProperty('version');
            expect(response.body.info).toHaveProperty('description');
        });

        it('devrait contenir les schémas de sécurité', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.body.components).toHaveProperty('securitySchemes');
            expect(response.body.components.securitySchemes).toHaveProperty('bearerAuth');
        });

        it('devrait contenir les schémas des modèles', async () => {
            const response = await request(app).get('/api-docs.json');
            
            const schemas = response.body.components.schemas;
            expect(schemas).toHaveProperty('Pays');
            expect(schemas).toHaveProperty('Ville');
            expect(schemas).toHaveProperty('Aeroport');
            expect(schemas).toHaveProperty('Utilisateur');
            expect(schemas).toHaveProperty('Annonce');
        });

        it('devrait contenir les paths documentés', async () => {
            const response = await request(app).get('/api-docs.json');
            
            const paths = response.body.paths;
            
            // Routes publiques
            expect(paths).toHaveProperty('/api/pays');
            expect(paths).toHaveProperty('/api/villes');
            expect(paths).toHaveProperty('/api/aeroports');
            expect(paths).toHaveProperty('/api/annonces');
            
            // Routes authentifiées
            expect(paths).toHaveProperty('/api/me');
        });

        it('devrait avoir des tags définis', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.body.tags).toBeDefined();
            expect(Array.isArray(response.body.tags)).toBe(true);
            expect(response.body.tags.length).toBeGreaterThan(0);
        });

        it('devrait avoir des serveurs définis', async () => {
            const response = await request(app).get('/api-docs.json');
            
            expect(response.body.servers).toBeDefined();
            expect(Array.isArray(response.body.servers)).toBe(true);
            expect(response.body.servers[0]).toHaveProperty('url');
        });
    });

    describe('Documentation quality', () => {
        it('les routes documentées devraient avoir une description', async () => {
            const response = await request(app).get('/api-docs.json');
            
            const paths = response.body.paths;
            const paysGet = paths['/api/pays']?.get;
            
            expect(paysGet).toBeDefined();
            expect(paysGet).toHaveProperty('summary');
            expect(paysGet).toHaveProperty('description');
            expect(paysGet).toHaveProperty('tags');
            expect(paysGet).toHaveProperty('responses');
        });

        it('les routes protégées devraient avoir security défini', async () => {
            const response = await request(app).get('/api-docs.json');
            
            const paths = response.body.paths;
            const meGet = paths['/api/me']?.get;
            
            expect(meGet).toBeDefined();
            expect(meGet.security).toBeDefined();
            expect(Array.isArray(meGet.security)).toBe(true);
            expect(meGet.security[0]).toHaveProperty('bearerAuth');
        });

        it('les routes devraient avoir des exemples de réponses', async () => {
            const response = await request(app).get('/api-docs.json');
            
            const paths = response.body.paths;
            const paysGet = paths['/api/pays']?.get;
            
            expect(paysGet.responses).toHaveProperty('200');
            expect(paysGet.responses['200']).toHaveProperty('description');
        });
    });
});

