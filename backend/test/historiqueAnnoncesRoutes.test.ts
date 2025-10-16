import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import historiqueAnnoncesRoutes from '../routes/historiqueAnnoncesRoutes.js';
import { HistoriqueAnnonce, Annonce, Utilisateur, Ville, Aeroport } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { mockAdminAuthMiddleware } from './helpers/mockAuth.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());

// Mock de l'authentification ADMIN pour les tests (route admin only)
app.use(mockAdminAuthMiddleware);

app.use('/api/historique_annonces', historiqueAnnoncesRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Historique Annonces Routes - Integration Tests', () => {
  let testAnnonceId: number;
  let testUserId: number;
  let testAeroDepId: number;
  let testAeroArrId: number;

  // Setup: Créer des données de test
  beforeAll(async () => {
    // Récupérer un utilisateur valide
    const user = await Utilisateur.findOne();
    if (user) {
      testUserId = user.get('id_util') as number;
    }

    // Récupérer deux aéroports différents
    const aeroports = await Aeroport.findAll({ limit: 2 });
    if (aeroports.length >= 2) {
      testAeroDepId = aeroports[0].get('id_aeroport') as number;
      testAeroArrId = aeroports[1].get('id_aeroport') as number;
    }

    // Créer une annonce de test pour avoir un historique
    const annonce = await Annonce.create({
      id_util: testUserId,
      id_aerodep: testAeroDepId,
      id_aeroarr: testAeroArrId,
      titre: 'Test Annonce Historique',
      description: 'Annonce pour tester l\'historique',
      prix: 100,
      datedepart: new Date('2025-12-01T10:00:00Z'),
      datearrivee: new Date('2025-12-01T18:00:00Z'),
      statut: 'active',
    });
    testAnnonceId = annonce.get('id_annon') as number;
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    if (testAnnonceId) {
      await Annonce.destroy({ where: { id_annon: testAnnonceId } });
    }
  });

  describe('GET /api/historique_annonces', () => {
    it('devrait retourner tous les historiques avec pagination', async () => {
      const response = await request(app)
        .get('/api/historique_annonces')
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
        .get('/api/historique_annonces')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/historique_annonces?page=1&limit=5')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('devrait retourner des historiques avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/historique_annonces')
        .expect(200);

      if (response.body.data.length > 0) {
        const firstHistorique = response.body.data[0];
        expect(firstHistorique).toHaveProperty('id_histo_annon');
        expect(firstHistorique).toHaveProperty('id_annon');
        expect(firstHistorique).toHaveProperty('action_histo');
        expect(firstHistorique).toHaveProperty('prix');
      }
    });
  });

  describe('GET /api/historique_annonces/:id', () => {
    it('devrait retourner un historique par ID', async () => {
      // Créer un historique temporaire
      const historique = await HistoriqueAnnonce.create({
        id_annon: testAnnonceId,
        id_util: testUserId,
        id_aerodep: testAeroDepId,
        id_aeroarr: testAeroArrId,
        prix: '100.00',
        action_histo: 'insert',
        datedepart: new Date('2025-12-01T10:00:00Z'),
        datearrivee: new Date('2025-12-01T18:00:00Z'),
      });
      const historiqueId = historique.get('id_histo_annon') as number;

      const response = await request(app)
        .get(`/api/historique_annonces/${historiqueId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_histo_annon', historiqueId);

      // Nettoyer
      await historique.destroy();
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/historique_annonces/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/historique_annonces/invalid')
        .expect(400);
    });

    it('devrait rejeter un ID négatif', async () => {
      await request(app)
        .get('/api/historique_annonces/-1')
        .expect(400);
    });
  });

  describe('GET /api/historique_annonces/annonce/:id_annon', () => {
    it('devrait retourner l\'historique d\'une annonce spécifique', async () => {
      // Créer quelques historiques pour l'annonce
      await HistoriqueAnnonce.create({
        id_annon: testAnnonceId,
        id_util: testUserId,
        id_aerodep: testAeroDepId,
        id_aeroarr: testAeroArrId,
        prix: '100.00',
        action_histo: 'insert',
        datedepart: new Date('2025-12-01T10:00:00Z'),
        datearrivee: new Date('2025-12-01T18:00:00Z'),
      });

      const response = await request(app)
        .get(`/api/historique_annonces/annonce/${testAnnonceId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id_annon', testAnnonceId);
      }

      // Nettoyer
      await HistoriqueAnnonce.destroy({ where: { id_annon: testAnnonceId } });
    });

    it('devrait retourner un tableau vide si aucun historique', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/annonce/999999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('devrait rejeter un id_annon invalide', async () => {
      await request(app)
        .get('/api/historique_annonces/annonce/invalid')
        .expect(400);
    });
  });

  describe('GET /api/historique_annonces/search', () => {
    beforeAll(async () => {
      // Créer des historiques de test
      await HistoriqueAnnonce.bulkCreate([
        {
          id_annon: testAnnonceId,
          id_util: testUserId,
          id_aerodep: testAeroDepId,
          id_aeroarr: testAeroArrId,
          titre: 'Test Search Insert',
          prix: '50.00',
          action_histo: 'insert',
          statut: 'active',
          datedepart: new Date('2025-12-01T10:00:00Z'),
          datearrivee: new Date('2025-12-01T18:00:00Z'),
        },
        {
          id_annon: testAnnonceId,
          id_util: testUserId,
          id_aerodep: testAeroDepId,
          id_aeroarr: testAeroArrId,
          titre: 'Test Search Update',
          prix: '150.00',
          action_histo: 'update',
          statut: 'active',
          datedepart: new Date('2025-12-05T10:00:00Z'),
          datearrivee: new Date('2025-12-05T18:00:00Z'),
        },
        {
          id_annon: testAnnonceId,
          id_util: testUserId,
          id_aerodep: testAeroDepId,
          id_aeroarr: testAeroArrId,
          titre: 'Test Search Delete',
          prix: '200.00',
          action_histo: 'delete',
          statut: 'vendue',
          datedepart: new Date('2025-12-10T10:00:00Z'),
          datearrivee: new Date('2025-12-10T18:00:00Z'),
        },
      ]);
    });

    afterAll(async () => {
      await HistoriqueAnnonce.destroy({ where: { id_annon: testAnnonceId } });
    });

    it('devrait rechercher par id_annon', async () => {
      const response = await request(app)
        .get(`/api/historique_annonces/search?id_annon=${testAnnonceId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].id_annon).toBe(testAnnonceId);
      }
    });

    it('devrait rechercher par action_histo', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/search?action_histo=insert')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((hist: any) => {
        expect(hist.action_histo).toBe('insert');
      });
    });

    it('devrait rechercher par statut', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/search?statut=active')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/search?prix_min=100&prix_max=200')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par plage de dates', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/search?dateFrom=2025-12-01&dateTo=2025-12-31')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait accepter plusieurs filtres combinés', async () => {
      const response = await request(app)
        .get(`/api/historique_annonces/search?id_annon=${testAnnonceId}&action_histo=update&prix_min=100`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait respecter le tri', async () => {
      const response = await request(app)
        .get('/api/historique_annonces/search?sortBy=prix&sort=asc')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter action_histo invalide', async () => {
      await request(app)
        .get('/api/historique_annonces/search?action_histo=invalid')
        .expect(400);
    });

    it('devrait rejeter statut invalide', async () => {
      await request(app)
        .get('/api/historique_annonces/search?statut=completed')
        .expect(400);
    });
  });

  describe('Routes non autorisées', () => {
    it('ne devrait PAS avoir de route POST (historique en lecture seule)', async () => {
      const response = await request(app)
        .post('/api/historique_annonces')
        .send({})
        .expect(404);
    });

    it('ne devrait PAS avoir de route PUT (historique en lecture seule)', async () => {
      const response = await request(app)
        .put('/api/historique_annonces/1')
        .send({})
        .expect(404);
    });

    it('ne devrait PAS avoir de route DELETE (historique en lecture seule)', async () => {
      const response = await request(app)
        .delete('/api/historique_annonces/1')
        .expect(404);
    });
  });
});




