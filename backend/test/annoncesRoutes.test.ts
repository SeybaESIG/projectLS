import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import annoncesRoutes from '../routes/annoncesRoutes.js';
import { Annonce, Utilisateur, Ville, Aeroport } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/annonces', annoncesRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Annonces Routes - Integration Tests', () => {
  let testAnnonceId: number;
  let testUserId: number;
  let testVilleDepId: number;
  let testVilleArrId: number;
  let testAeroDepId: number;
  let testAeroArrId: number;

  // Setup: Créer des données de test
  beforeAll(async () => {
    // Nettoyage avant de commencer
    await Annonce.destroy({
      where: {
        titre: {
          [Op.like]: 'Test%'
        }
      }
    });

    // Récupérer un utilisateur valide
    const user = await Utilisateur.findOne();
    if (user) {
      testUserId = user.get('id_util') as number;
    }

    // Récupérer deux villes différentes
    const villes = await Ville.findAll({ limit: 2 });
    if (villes.length >= 2) {
      testVilleDepId = villes[0].get('id_ville') as number;
      testVilleArrId = villes[1].get('id_ville') as number;
    }

    // Récupérer deux aéroports différents
    const aeroports = await Aeroport.findAll({ limit: 2 });
    if (aeroports.length >= 2) {
      testAeroDepId = aeroports[0].get('id_aeroport') as number;
      testAeroArrId = aeroports[1].get('id_aeroport') as number;
    }
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    await Annonce.destroy({
      where: {
        titre: {
          [Op.like]: 'Test%'
        }
      }
    });
  });

  describe('GET /api/annonces', () => {
    it('devrait retourner toutes les annonces', async () => {
      const response = await request(app)
        .get('/api/annonces')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/annonces')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait retourner des annonces avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/annonces')
        .expect(200);

      if (response.body.length > 0) {
        const firstAnnonce = response.body[0];
        expect(firstAnnonce).toHaveProperty('id_annon');
        expect(firstAnnonce).toHaveProperty('id_util');
        expect(firstAnnonce).toHaveProperty('prix');
        expect(firstAnnonce).toHaveProperty('statut');
      }
    });
  });

  describe('POST /api/annonces', () => {
    it('devrait créer une nouvelle annonce avec toutes les données', async () => {
      const newAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        titre: 'Test Annonce 1',
        description: 'Description de test pour annonce',
        prix: 150.50,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
        statut: 'active',
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(newAnnonce)
        .expect(201);

      expect(response.body).toHaveProperty('id_annon');
      expect(response.body.titre).toBe(newAnnonce.titre);
      expect(parseFloat(response.body.prix)).toBe(newAnnonce.prix);
      expect(response.body.statut).toBe('active');

      testAnnonceId = response.body.id_annon;
    });

    it('devrait créer une annonce avec statut par défaut "active"', async () => {
      const newAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        titre: 'Test Annonce Default Status',
        description: 'Test avec statut par défaut',
        prix: 100,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(newAnnonce)
        .expect(201);

      expect(response.body.statut).toBe('active');
    });

    it('devrait créer une annonce sans description ni titre', async () => {
      const newAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        prix: 200,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(newAnnonce)
        .expect(201);

      expect(response.body).toHaveProperty('id_annon');
    });

    it('devrait rejeter une annonce avec prix négatif', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        prix: -50,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);
    });

    it('devrait rejeter une annonce avec prix zéro', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        prix: 0,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);
    });

    it('devrait rejeter une annonce avec statut invalide', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        prix: 150,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
        statut: 'completed',
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('devrait rejeter si datearrivee avant datedepart', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        prix: 150,
        datedepart: new Date('2025-12-01T18:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T10:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);

      expect(response.body.message).toBe('Erreur de validation');
      // Vérifier qu'il y a une erreur dans le tableau errors
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('devrait rejeter si ville_dep et ville_arr identiques', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleDepId, // Même ville!
        id_aeroarr: testAeroArrId,
        prix: 150,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      const response = await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);

      expect(response.body.message).toBe('Erreur de validation');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('devrait rejeter si champs requis manquants', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        prix: 150,
      };

      await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);
    });

    it('devrait rejeter une description trop courte', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        description: 'Court',
        prix: 150,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);
    });

    it('devrait rejeter un titre trop court', async () => {
      const invalidAnnonce = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        titre: 'AB',
        prix: 150,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      await request(app)
        .post('/api/annonces')
        .send(invalidAnnonce)
        .expect(400);
    });
  });

  describe('GET /api/annonces/:id', () => {
    it('devrait retourner une annonce par ID', async () => {
      if (!testAnnonceId) {
        // Skip if no test annonce was created
        return;
      }

      const response = await request(app)
        .get(`/api/annonces/${testAnnonceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_annon', testAnnonceId);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/annonces/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/annonces/invalid')
        .expect(400);
    });

    it('devrait rejeter un ID négatif', async () => {
      await request(app)
        .get('/api/annonces/-1')
        .expect(400);
    });
  });

  describe('PUT /api/annonces/:id', () => {
    it('devrait mettre à jour une annonce existante', async () => {
      if (!testAnnonceId) {
        return;
      }

      const updateData = {
        prix: 200,
        titre: 'Test Annonce Updated',
      };

      const response = await request(app)
        .patch(`/api/annonces/${testAnnonceId}`)
        .send(updateData)
        .expect(200);

      expect(parseFloat(response.body.prix)).toBe(200);
      expect(response.body.titre).toBe('Test Annonce Updated');
    });

    it('devrait mettre à jour le statut en "vendue"', async () => {
      if (!testAnnonceId) {
        return;
      }

      const updateData = {
        statut: 'vendue',
      };

      const response = await request(app)
        .patch(`/api/annonces/${testAnnonceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.statut).toBe('vendue');
    });

    it('devrait rejeter un statut invalide', async () => {
      if (!testAnnonceId) {
        return;
      }

      const updateData = {
        statut: 'completed',
      };

      await request(app)
        .patch(`/api/annonces/${testAnnonceId}`)
        .send(updateData)
        .expect(400);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const updateData = { prix: 200 };

      await request(app)
        .patch('/api/annonces/999999')
        .send(updateData)
        .expect(404);
    });

    it('devrait rejeter une mise à jour vide', async () => {
      if (!testAnnonceId) {
        return;
      }

      await request(app)
        .patch(`/api/annonces/${testAnnonceId}`)
        .send({})
        .expect(400);
    });

    it('devrait rejeter un prix négatif', async () => {
      if (!testAnnonceId) {
        return;
      }

      const updateData = { prix: -50 };

      await request(app)
        .patch(`/api/annonces/${testAnnonceId}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/annonces/:id', () => {
    it('devrait supprimer une annonce existante', async () => {
      // Créer une annonce à supprimer
      const annonceToDelete = {
        id_util: testUserId,
        id_ville_dep: testVilleDepId,
        id_aerodep: testAeroDepId,
        id_ville_arr: testVilleArrId,
        id_aeroarr: testAeroArrId,
        titre: 'Test Annonce To Delete',
        prix: 100,
        datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
        datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
      };

      const createResponse = await request(app)
        .post('/api/annonces')
        .send(annonceToDelete)
        .expect(201);

      const annonceId = createResponse.body.id_annon;

      // Supprimer l'annonce
      const response = await request(app)
        .delete(`/api/annonces/${annonceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Annonce supprimée');

      // Vérifier que l'annonce n'existe plus
      await request(app)
        .get(`/api/annonces/${annonceId}`)
        .expect(404);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .delete('/api/annonces/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .delete('/api/annonces/invalid')
        .expect(400);
    });
  });

  describe('GET /api/annonces/search', () => {
    beforeAll(async () => {
      // Créer des annonces de test pour la recherche
      const testAnnonces = [
        {
          id_util: testUserId,
          id_ville_dep: testVilleDepId,
          id_aerodep: testAeroDepId,
          id_ville_arr: testVilleArrId,
          id_aeroarr: testAeroArrId,
          titre: 'Test Search Paris',
          description: 'Voyage vers Paris avec bagages',
          prix: 100,
          statut: 'active',
          datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
          datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
        },
        {
          id_util: testUserId,
          id_ville_dep: testVilleDepId,
          id_aerodep: testAeroDepId,
          id_ville_arr: testVilleArrId,
          id_aeroarr: testAeroArrId,
          titre: 'Test Search Tokyo',
          description: 'Voyage vers Tokyo avec valises',
          prix: 300,
          statut: 'vendue',
          datedepart: new Date('2025-12-01T10:00:00Z').toISOString(),
          datearrivee: new Date('2025-12-01T18:00:00Z').toISOString(),
        },
      ];

      for (const annonce of testAnnonces) {
        await request(app).post('/api/annonces').send(annonce);
      }
    });

    it('devrait rechercher par titre', async () => {
      const response = await request(app)
        .get('/api/annonces/search?titre=Paris')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].titre).toMatch(/Paris/i);
    });

    it('devrait rechercher par description', async () => {
      const response = await request(app)
        .get('/api/annonces/search?description=bagages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait rechercher par statut', async () => {
      const response = await request(app)
        .get('/api/annonces/search?statut=active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((annonce: any) => {
        expect(annonce.statut).toMatch(/active/i);
      });
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const response = await request(app)
        .get('/api/annonces/search?prix_min=50&prix_max=150')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner 400 sans paramètre de recherche', async () => {
      await request(app)
        .get('/api/annonces/search')
        .expect(400);
    });
  });

  describe('Contraintes de la base de données', () => {
    it('devrait être bloqué par la DB si prix négatif contourne Joi', async () => {
      // Ce test vérifie que la contrainte CHECK de la DB fonctionne
      // même si Joi est contourné (ne devrait pas arriver en production)
      const annonce = await Annonce.build({
        id_util: testUserId,
        id_aerodep: testAeroDepId,
        id_aeroarr: testAeroArrId,
        prix: '-50',
        datedepart: new Date('2025-12-01T10:00:00Z'),
        datearrivee: new Date('2025-12-01T18:00:00Z'),
      });

      await expect(annonce.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si datedepart > datearrivee', async () => {
      const annonce = await Annonce.build({
        id_util: testUserId,
        id_aerodep: testAeroDepId,
        id_aeroarr: testAeroArrId,
        prix: '100',
        datedepart: new Date('2025-12-01T18:00:00Z'),
        datearrivee: new Date('2025-12-01T10:00:00Z'),
      });

      await expect(annonce.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si statut invalide', async () => {
      const annonce = await Annonce.build({
        id_util: testUserId,
        id_aerodep: testAeroDepId,
        id_aeroarr: testAeroArrId,
        prix: '100',
        datedepart: new Date('2025-12-01T10:00:00Z'),
        datearrivee: new Date('2025-12-01T18:00:00Z'),
        statut: 'completed', // Statut invalide
      });

      await expect(annonce.save()).rejects.toThrow();
    });
  });
});

