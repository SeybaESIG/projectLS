import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import villesRoutes from '../routes/villesRoutes.js';
import { Ville } from '../models/index.js';
import { initAssociations } from '../models/associations.js';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/villes', villesRoutes);

// Middleware d'erreur pour les tests
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Villes Routes - Integration Tests', () => {
  describe('GET /api/villes', () => {
    it('devrait retourner toutes les villes', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/villes')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait retourner des villes avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      const firstVille = response.body[0];
      expect(firstVille).toHaveProperty('id_ville');
      expect(firstVille).toHaveProperty('nom_ville');
      expect(firstVille).toHaveProperty('id_pays');
    });

    it('devrait avoir au moins 2940 villes', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2940);
    });
  });

  describe('GET /api/villes/:id', () => {
    it('devrait retourner une ville par son ID', async () => {
      // Récupérer la première ville pour avoir un ID valide
      const allVilles = await Ville.findAll({ limit: 1 });
      const villeId = allVilles[0].get('id_ville');

      const response = await request(app)
        .get(`/api/villes/${villeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_ville', villeId);
      expect(response.body).toHaveProperty('nom_ville');
      expect(response.body).toHaveProperty('id_pays');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/villes/99999')
        .expect(404);
    });

    it('devrait gérer un ID invalide', async () => {
      await request(app)
        .get('/api/villes/invalid')
        .expect(500);
    });
  });

  describe('Vérification des villes', () => {
    it('devrait retourner Paris dans la base', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      const paris = response.body.find((v: any) => v.nom_ville && v.nom_ville.includes('Paris'));
      expect(paris).toBeDefined();
      expect(paris.nom_ville).toContain('Paris');
    });

    it('devrait retourner Singapore dans la base', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      const singapore = response.body.find((v: any) => v.nom_ville === 'Singapore');
      expect(singapore).toBeDefined();
      expect(singapore.nom_ville).toBe('Singapore');
    });

    it('toutes les villes devraient avoir un nom', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      const villesWithoutName = response.body.filter((v: any) => !v.nom_ville || v.nom_ville.trim() === '');
      // Maintenant qu'on a nettoyé, il ne devrait plus y avoir de villes sans nom
      expect(villesWithoutName.length).toBe(0);
    });

    it('toutes les villes devraient avoir un pays valide', async () => {
      const response = await request(app)
        .get('/api/villes')
        .expect(200);

      const villesWithoutPays = response.body.filter((v: any) => !v.id_pays || v.id_pays <= 0);
      expect(villesWithoutPays.length).toBe(0);
    });
  });

  describe('GET /api/villes/search', () => {
    it('devrait chercher des villes par nom', async () => {
      const response = await request(app)
        .get('/api/villes/search?name=Paris')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('nom_ville');
      expect(response.body[0].nom_ville).toMatch(/Paris/i);
    });

    it('devrait chercher des villes par pays', async () => {
      const response = await request(app)
        .get('/api/villes/search?pays=Mali')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      // Vérifier que les résultats incluent les données du pays
      if (response.body[0].tb_pay) {
        expect(response.body[0].tb_pay.nom_pays).toMatch(/Mali/i);
      }
    });

    it('devrait combiner nom et pays dans la recherche', async () => {
      const response = await request(app)
        .get('/api/villes/search?name=Bamako&pays=Mali')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('devrait retourner une erreur 400 sans paramètres', async () => {
      const response = await request(app)
        .get('/api/villes/search')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const response = await request(app)
        .get('/api/villes/search?name=XXXYYYZZZ999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('devrait faire une recherche insensible à la casse', async () => {
      const response = await request(app)
        .get('/api/villes/search?name=bamako')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

