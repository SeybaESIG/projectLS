import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import paysRoutes from '../routes/paysRoutes.js';
import { Pays } from '../models/index.js';

const app: Application = express();
app.use(express.json());
app.use('/api/pays', paysRoutes);

// Middleware d'erreur simple pour les tests
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Pays Routes - Integration Tests', () => {
  describe('GET /api/pays', () => {
    it('devrait retourner tous les pays', async () => {
      const response = await request(app)
        .get('/api/pays')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/pays')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait retourner des pays avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/pays')
        .expect(200);

      const firstPays = response.body[0];
      expect(firstPays).toHaveProperty('id_pays');
      expect(firstPays).toHaveProperty('nom_pays');
      expect(firstPays).toHaveProperty('code_iso_pays');
    });
  });

  describe('GET /api/pays/:id', () => {
    it('devrait retourner un pays par son ID', async () => {
      // Récupérer le premier pays pour avoir un ID valide
      const allPays = await Pays.findAll({ limit: 1 });
      const paysId = allPays[0].get('id_pays');

      const response = await request(app)
        .get(`/api/pays/${paysId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_pays', paysId);
      expect(response.body).toHaveProperty('nom_pays');
      expect(response.body).toHaveProperty('code_iso_pays');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/pays/99999')
        .expect(404);
    });

    it('devrait gérer un ID invalide', async () => {
      await request(app)
        .get('/api/pays/invalid')
        .expect(500);
    });
  });

  describe('Vérification des données', () => {
    it('devrait avoir France dans les pays', async () => {
      const response = await request(app)
        .get('/api/pays')
        .expect(200);

      const france = response.body.find((p: any) => p.code_iso_pays === 'FR');
      expect(france).toBeDefined();
      expect(france.nom_pays).toBe('France');
    });

    it('devrait avoir au moins 200 pays', async () => {
      const response = await request(app)
        .get('/api/pays')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(200);
    });
  });
});



