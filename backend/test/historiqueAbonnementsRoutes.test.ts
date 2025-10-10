import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import historiqueAbonnementsRoutes from '../routes/historiqueAbonnementsRoutes.js';
import { HistoriqueAbonnement, TypeAbonnement } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/historique_abonnements', historiqueAbonnementsRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Historique Abonnements Routes - Integration Tests', () => {
  let testTypeAbonnementId: number;

  // Setup: Créer des données de test
  beforeAll(async () => {
    // Créer un type d'abonnement de test si nécessaire
    let type = await TypeAbonnement.findOne();
    if (!type) {
      type = await TypeAbonnement.create({
        nom_type: 'Test Type Histo',
        prix: 19.99,
        duree_mois: 6,
      });
    }
    testTypeAbonnementId = type.get('id_type_abonnement') as number;

    // Nettoyer les historiques de test existants
    await HistoriqueAbonnement.destroy({
      where: {
        nom_type: {
          [Op.like]: 'Test%'
        }
      }
    });
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    await HistoriqueAbonnement.destroy({
      where: {
        nom_type: {
          [Op.like]: 'Test%'
        }
      }
    });

    // Nettoyer le type d'abonnement de test s'il a été créé
    await TypeAbonnement.destroy({
      where: {
        nom_type: 'Test Type Histo'
      }
    });
  });

  describe('GET /api/historique_abonnements', () => {
    it('devrait retourner tous les historiques avec pagination', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/historique_abonnements')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements?page=1&limit=5')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('devrait retourner des historiques avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements')
        .expect(200);

      if (response.body.data.length > 0) {
        const firstHistorique = response.body.data[0];
        expect(firstHistorique).toHaveProperty('id_histo_abo');
        expect(firstHistorique).toHaveProperty('id_type_abonnement');
        expect(firstHistorique).toHaveProperty('action_histo');
        expect(firstHistorique).toHaveProperty('nom_type');
        expect(firstHistorique).toHaveProperty('prix');
        expect(firstHistorique).toHaveProperty('duree_mois');
      }
    });
  });

  describe('GET /api/historique_abonnements/:id', () => {
    it('devrait retourner un historique par ID', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      // Créer un historique temporaire
      const historique = await HistoriqueAbonnement.create({
        id_type_abonnement: testTypeAbonnementId,
        nom_type: 'Test Type',
        prix: '29.99',
        duree_mois: 12,
        description: null,
        action_histo: 'insert',
      });
      const historiqueId = historique.get('id_histo_abo') as number;

      const response = await request(app)
        .get(`/api/historique_abonnements/${historiqueId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_histo_abo', historiqueId);

      // Nettoyer
      await historique.destroy();
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/historique_abonnements/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/historique_abonnements/invalid')
        .expect(400);
    });

    it('devrait rejeter un ID négatif', async () => {
      await request(app)
        .get('/api/historique_abonnements/-1')
        .expect(400);
    });
  });

  describe('GET /api/historique_abonnements/type/:id_type_abonnement', () => {
    it('devrait retourner l\'historique d\'un type d\'abonnement', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      // Créer quelques historiques pour le type
      await HistoriqueAbonnement.create({
        id_type_abonnement: testTypeAbonnementId,
        nom_type: 'Test Premium',
        prix: '29.99',
        duree_mois: 12,
        description: null,
        action_histo: 'insert',
      });

      const response = await request(app)
        .get(`/api/historique_abonnements/type/${testTypeAbonnementId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id_type_abonnement', testTypeAbonnementId);
      }

      // Nettoyer
      await HistoriqueAbonnement.destroy({ where: { id_type_abonnement: testTypeAbonnementId } });
    });

    it('devrait retourner un tableau vide si aucun historique', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/type/999999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('devrait rejeter un id_type_abonnement invalide', async () => {
      await request(app)
        .get('/api/historique_abonnements/type/invalid')
        .expect(400);
    });
  });

  describe('GET /api/historique_abonnements/search', () => {
    beforeAll(async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      // Créer des historiques de test
      await HistoriqueAbonnement.bulkCreate([
        {
          id_type_abonnement: testTypeAbonnementId,
          nom_type: 'Test Search Insert',
          prix: '9.99',
          duree_mois: 1,
          description: null,
          action_histo: 'insert',
        },
        {
          id_type_abonnement: testTypeAbonnementId,
          nom_type: 'Test Search Update',
          prix: '29.99',
          duree_mois: 6,
          description: null,
          action_histo: 'update',
        },
        {
          id_type_abonnement: testTypeAbonnementId,
          nom_type: 'Test Search Delete',
          prix: '49.99',
          duree_mois: 12,
          description: null,
          action_histo: 'delete',
        },
      ]);
    });

    afterAll(async () => {
      await HistoriqueAbonnement.destroy({
        where: {
          nom_type: {
            [Op.like]: 'Test Search%'
          }
        }
      });
    });

    it('devrait rechercher par id_type_abonnement', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?id_type_abonnement=1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par action_histo', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?action_histo=insert')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par nom_type', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?nom_type=Search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?prix_min=10&prix_max=50')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par fourchette de durée', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?duree_min=1&duree_max=12')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait accepter plusieurs filtres combinés', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?action_histo=update&prix_min=20&duree_min=6')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait respecter le tri', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements/search?sortBy=prix&sort=asc')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter action_histo invalide', async () => {
      await request(app)
        .get('/api/historique_abonnements/search?action_histo=invalid')
        .expect(400);
    });

    it('devrait rejeter prix_min > prix_max', async () => {
      await request(app)
        .get('/api/historique_abonnements/search?prix_min=50&prix_max=10')
        .expect(400);
    });

    it('devrait rejeter duree_min > duree_max', async () => {
      await request(app)
        .get('/api/historique_abonnements/search?duree_min=12&duree_max=1')
        .expect(400);
    });
  });

  describe('Routes non autorisées', () => {
    it('ne devrait PAS avoir de route POST (historique en lecture seule)', async () => {
      await request(app)
        .post('/api/historique_abonnements')
        .send({})
        .expect(404);
    });

    it('ne devrait PAS avoir de route PATCH (historique en lecture seule)', async () => {
      await request(app)
        .patch('/api/historique_abonnements/1')
        .send({})
        .expect(404);
    });

    it('ne devrait PAS avoir de route PUT (historique en lecture seule)', async () => {
      await request(app)
        .put('/api/historique_abonnements/1')
        .send({})
        .expect(404);
    });

    it('ne devrait PAS avoir de route DELETE (historique en lecture seule)', async () => {
      await request(app)
        .delete('/api/historique_abonnements/1')
        .expect(404);
    });
  });

  describe('Contraintes de la base de données', () => {
    it('devrait être bloqué par la DB si prix négatif', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const historique = await HistoriqueAbonnement.build({
        id_type_abonnement: testTypeAbonnementId,
        nom_type: 'Test Invalid',
        prix: '-10',
        duree_mois: 12,
        description: null,
        action_histo: 'insert',
      });

      await expect(historique.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si duree_mois <= 0', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const historique = await HistoriqueAbonnement.build({
        id_type_abonnement: testTypeAbonnementId,
        nom_type: 'Test Invalid',
        prix: '29.99',
        duree_mois: 0,
        description: null,
        action_histo: 'insert',
      });

      await expect(historique.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si action_histo invalide', async () => {
      if (!testTypeAbonnementId) {
        return;
      }

      const historique = await HistoriqueAbonnement.build({
        id_type_abonnement: testTypeAbonnementId,
        nom_type: 'Test Invalid',
        prix: '29.99',
        duree_mois: 12,
        description: null,
        action_histo: 'invalid',
      });

      await expect(historique.save()).rejects.toThrow();
    });
  });
});

