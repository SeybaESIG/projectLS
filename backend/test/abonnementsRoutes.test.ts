import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import abonnementsRoutes from '../routes/abonnementsRoutes.js';
import { Abonnement, Utilisateur, TypeAbonnement } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/abonnements', abonnementsRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Abonnements Routes - Integration Tests', () => {
  let testAbonnementId: number;
  let testUserId: number;
  let testTypeAbonnementId: number;

  // Setup: Créer des données de test
  beforeAll(async () => {
    // Récupérer un utilisateur valide sans abonnement
    const users = await Utilisateur.findAll();
    for (const user of users) {
      const userId = user.get('id_util') as number;
      const existingAbo = await Abonnement.findOne({ where: { id_util: userId } });
      if (!existingAbo) {
        testUserId = userId;
        break;
      }
    }

    // Si tous les utilisateurs ont un abonnement, en supprimer un
    if (!testUserId && users.length > 0) {
      testUserId = users[0].get('id_util') as number;
      await Abonnement.destroy({ where: { id_util: testUserId } });
    }

    // Récupérer un type d'abonnement valide
    const type = await TypeAbonnement.findOne();
    if (type) {
      testTypeAbonnementId = type.get('id_type_abonnement') as number;
    }
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    if (testAbonnementId) {
      await Abonnement.destroy({ where: { id_abonnement: testAbonnementId } });
    }
  });

  describe('GET /api/abonnements', () => {
    it('devrait retourner tous les abonnements avec pagination', async () => {
      const response = await request(app)
        .get('/api/abonnements')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/abonnements?page=1&limit=5')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('devrait retourner des abonnements avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/abonnements')
        .expect(200);

      if (response.body.data.length > 0) {
        const firstAbo = response.body.data[0];
        expect(firstAbo).toHaveProperty('id_abonnement');
        expect(firstAbo).toHaveProperty('id_util');
        expect(firstAbo).toHaveProperty('id_type_abonnement');
        expect(firstAbo).toHaveProperty('date_debut');
        expect(firstAbo).toHaveProperty('date_fin');
      }
    });
  });

  describe('POST /api/abonnements', () => {
    it('devrait créer un nouvel abonnement', async () => {
      if (!testUserId || !testTypeAbonnementId) {
        return;
      }

      const newAbonnement = {
        id_util: testUserId,
        id_type_abonnement: testTypeAbonnementId,
        date_debut: new Date('2025-01-01T00:00:00Z').toISOString(),
        date_fin: new Date('2025-12-31T23:59:59Z').toISOString()
      };

      const response = await request(app)
        .post('/api/abonnements')
        .send(newAbonnement)
        .expect(201);

      expect(response.body).toHaveProperty('id_abonnement');
      expect(response.body.id_util).toBe(testUserId);

      testAbonnementId = response.body.id_abonnement;
    });

    it('devrait rejeter si date_fin <= date_debut', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const invalidAbonnement = {
        id_util: testUserId + 1000,
        id_type_abonnement: testTypeAbonnementId,
        date_debut: new Date('2025-12-31').toISOString(),
        date_fin: new Date('2025-01-01').toISOString()
      };

      await request(app)
        .post('/api/abonnements')
        .send(invalidAbonnement)
        .expect(400);
    });

    it('devrait rejeter si champs requis manquants', async () => {
      const invalidAbonnement = {
        id_util: testUserId
      };

      await request(app)
        .post('/api/abonnements')
        .send(invalidAbonnement)
        .expect(400);
    });

    it('devrait rejeter un ID utilisateur négatif', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const invalidAbonnement = {
        id_util: -1,
        id_type_abonnement: testTypeAbonnementId,
        date_debut: new Date('2025-01-01').toISOString(),
        date_fin: new Date('2025-12-31').toISOString()
      };

      await request(app)
        .post('/api/abonnements')
        .send(invalidAbonnement)
        .expect(400);
    });
  });

  describe('GET /api/abonnements/:id', () => {
    it('devrait retourner un abonnement par ID', async () => {
      if (!testAbonnementId) {
        return;
      }

      const response = await request(app)
        .get(`/api/abonnements/${testAbonnementId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_abonnement', testAbonnementId);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/abonnements/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/abonnements/invalid')
        .expect(400);
    });
  });

  describe('GET /api/abonnements/user/:id_util', () => {
    it('devrait retourner l\'abonnement d\'un utilisateur', async () => {
      if (!testAbonnementId || !testUserId) {
        return;
      }

      const response = await request(app)
        .get(`/api/abonnements/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_util', testUserId);
    });

    it('devrait retourner 404 si utilisateur n\'a pas d\'abonnement', async () => {
      await request(app)
        .get('/api/abonnements/user/999999')
        .expect(404);
    });

    it('devrait rejeter un id_util invalide', async () => {
      await request(app)
        .get('/api/abonnements/user/invalid')
        .expect(400);
    });
  });

  describe('PATCH /api/abonnements/:id', () => {
    it('devrait mettre à jour un abonnement existant', async () => {
      if (!testAbonnementId) {
        return;
      }

      const updateData = {
        date_fin: new Date('2026-06-30T23:59:59Z').toISOString()
      };

      const response = await request(app)
        .patch(`/api/abonnements/${testAbonnementId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id_abonnement', testAbonnementId);
    });

    it('devrait rejeter une mise à jour vide', async () => {
      if (!testAbonnementId) {
        return;
      }

      await request(app)
        .patch(`/api/abonnements/${testAbonnementId}`)
        .send({})
        .expect(400);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const updateData = { date_fin: new Date('2026-01-01').toISOString() };

      await request(app)
        .patch('/api/abonnements/999999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('GET /api/abonnements/search', () => {
    it('devrait rechercher par type', async () => {
      const response = await request(app)
        .get('/api/abonnements/search?type=Premium')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par status "actif"', async () => {
      const response = await request(app)
        .get('/api/abonnements/search?status=actif')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rechercher par status "expiré"', async () => {
      const response = await request(app)
        .get('/api/abonnements/search?status=expiré')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter status invalide', async () => {
      await request(app)
        .get('/api/abonnements/search?status=invalid')
        .expect(400);
    });

    it('devrait rejeter date_debut_min > date_debut_max', async () => {
      await request(app)
        .get('/api/abonnements/search?date_debut_min=2025-12-31&date_debut_max=2025-01-01')
        .expect(400);
    });
  });

  describe('DELETE /api/abonnements/:id', () => {
    it('devrait supprimer un abonnement existant', async () => {
      if (!testUserId || !testTypeAbonnementId) {
        return;
      }

      // Créer un abonnement à supprimer
      const aboToDelete = await Abonnement.create({
        id_util: testUserId + 1,
        id_type_abonnement: testTypeAbonnementId,
        date_debut: new Date('2025-01-01'),
        date_fin: new Date('2025-12-31')
      });

      const aboId = aboToDelete.get('id_abonnement') as number;

      const response = await request(app)
        .delete(`/api/abonnements/${aboId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Abonnement supprimé');

      // Vérifier que l'abonnement n'existe plus
      await request(app)
        .get(`/api/abonnements/${aboId}`)
        .expect(404);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .delete('/api/abonnements/999999')
        .expect(404);
    });
  });

  describe('Contraintes de la base de données', () => {
    it('devrait être bloqué par la DB si date_fin <= date_debut', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const abonnement = await Abonnement.build({
        id_util: testUserId + 2000,
        id_type_abonnement: testTypeAbonnementId,
        date_debut: new Date('2025-12-31'),
        date_fin: new Date('2025-01-01')
      });

      await expect(abonnement.save()).rejects.toThrow();
    });
  });
});

