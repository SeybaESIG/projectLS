import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import paiementsRoutes from '../routes/paiementsRoutes.js';
import { Paiement, Transaction, Utilisateur, Role, Ville, Pays } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { mockAdminAuthMiddleware } from './helpers/mockAuth.js';
import { Op } from 'sequelize';

initAssociations();

const app: Application = express();
app.use(express.json());

// Mock de l'authentification ADMIN pour les tests (route admin only)
app.use(mockAdminAuthMiddleware);

app.use('/api/paiements', paiementsRoutes);
app.use(errorHandler);

describe('Paiements Routes - Integration Tests', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testTransactionId: number;
  let testPaiementId: number;
  let testRoleId: number;
  let testVilleId: number;

  beforeAll(async () => {
    // Créer un pays
    const pays = await Pays.create({
      nom_pays: 'Test Country Paie',
      code_iso_pays: 'TCP'
    });

    // Créer une ville
    const ville = await Ville.create({
      id_pays: pays.id_pays,
      nom_ville: 'Test City Paie'
    });
    testVilleId = ville.id_ville;

    // Créer un rôle
    const role = await Role.create({
      nom_role: 'utilisateur_paie'
    });
    testRoleId = role.id_role;

    // Créer deux utilisateurs de test
    const user1 = await Utilisateur.create({
      id_ville: testVilleId,
      id_role: testRoleId,
      username: `testuser_paie1_${Date.now()}`,
      nom: 'TestNom1',
      prenom: 'TestPrenom1',
      email: `testuser_paie1_${Date.now()}@test.com`,
      tel: `+33600${Date.now().toString().slice(-6)}`,
      mot_de_passe: 'password123'
    });
    testUserId1 = user1.id_util;

    const user2 = await Utilisateur.create({
      id_ville: testVilleId,
      id_role: testRoleId,
      username: `testuser_paie2_${Date.now()}`,
      nom: 'TestNom2',
      prenom: 'TestPrenom2',
      email: `testuser_paie2_${Date.now()}@test.com`,
      tel: `+33600${Date.now().toString().slice(-6) + '2'}`,
      mot_de_passe: 'password123'
    });
    testUserId2 = user2.id_util;

    // Créer une transaction de test
    const transaction = await Transaction.create({
      id_payeur: testUserId1,
      id_receveur: testUserId2,
      montant: 200.00,
      statut: 'attente'
    });
    testTransactionId = transaction.id_transa;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testPaiementId) {
      await Paiement.destroy({
        where: { id_paie: testPaiementId }
      });
    }
    
    await Paiement.destroy({
      where: { id_transa: testTransactionId }
    });

    if (testTransactionId) {
      await Transaction.destroy({
        where: { id_transa: testTransactionId }
      });
    }
    
    await Transaction.destroy({
      where: {
        [Op.or]: [
          { id_payeur: testUserId1 },
          { id_payeur: testUserId2 }
        ]
      }
    });

    if (testUserId1) {
      await Utilisateur.destroy({ where: { id_util: testUserId1 } });
    }
    if (testUserId2) {
      await Utilisateur.destroy({ where: { id_util: testUserId2 } });
    }
    if (testRoleId) {
      await Role.destroy({ where: { id_role: testRoleId } });
    }
    if (testVilleId) {
      await Ville.destroy({ where: { id_ville: testVilleId } });
    }
    
    await Pays.destroy({ where: { nom_pays: 'Test Country Paie' } });
  });

  describe('POST /api/paiements', () => {
    it('devrait créer un nouveau paiement', async () => {
      const newPaiement = {
        id_transa: testTransactionId,
        montant: 100.50,
        type: 'carte',
        statut: 'attente'
      };

      const response = await request(app)
        .post('/api/paiements')
        .send(newPaiement)
        .expect(201);

      expect(response.body).toHaveProperty('id_paie');
      expect(parseFloat(response.body.montant)).toBe(100.50);
      expect(response.body.type).toBe('carte');
      expect(response.body.statut).toBe('attente');
      expect(response.body.id_transa).toBe(testTransactionId);

      testPaiementId = response.body.id_paie;
    });

    it('devrait utiliser "attente" comme statut par défaut', async () => {
      const newPaiement = {
        id_transa: testTransactionId,
        montant: 50.00,
        type: 'virement'
      };

      const response = await request(app)
        .post('/api/paiements')
        .send(newPaiement)
        .expect(201);

      expect(response.body.statut).toBe('attente');
      
      // Nettoyer
      await Paiement.destroy({ where: { id_paie: response.body.id_paie } });
    });

    it('devrait rejeter un montant négatif', async () => {
      const invalidPaiement = {
        id_transa: testTransactionId,
        montant: -50,
        type: 'carte'
      };

      await request(app)
        .post('/api/paiements')
        .send(invalidPaiement)
        .expect(400);
    });

    it('devrait rejeter un type invalide', async () => {
      const invalidPaiement = {
        id_transa: testTransactionId,
        montant: 100.50,
        type: 'bitcoin'
      };

      await request(app)
        .post('/api/paiements')
        .send(invalidPaiement)
        .expect(400);
    });
  });

  describe('GET /api/paiements', () => {
    it('devrait récupérer tous les paiements avec pagination', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ limit: 10, page: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait filtrer par transaction', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ id_transa: testTransactionId })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((paie: any) => {
        expect(paie.id_transa).toBe(testTransactionId);
      });
    });

    it('devrait filtrer par type', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ type: 'carte' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((paie: any) => {
        expect(paie.type).toBe('carte');
      });
    });

    it('devrait filtrer par statut', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ statut: 'attente' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((paie: any) => {
        expect(paie.statut).toBe('attente');
      });
    });
  });

  describe('GET /api/paiements/:id', () => {
    it('devrait récupérer un paiement par ID', async () => {
      if (!testPaiementId) {
        return;
      }

      const response = await request(app)
        .get(`/api/paiements/${testPaiementId}`)
        .expect(200);

      expect(response.body.id_paie).toBe(testPaiementId);
      expect(response.body).toHaveProperty('montant');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('statut');
    });

    it('devrait retourner 404 si paiement non trouvé', async () => {
      await request(app)
        .get('/api/paiements/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/paiements/invalid')
        .expect(400);
    });
  });

  describe('PATCH /api/paiements/:id', () => {
    it('devrait mettre à jour le statut d\'un paiement', async () => {
      if (!testPaiementId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/paiements/${testPaiementId}`)
        .send({ statut: 'validé' })
        .expect(200);

      expect(response.body.statut).toBe('validé');
    });

    it('devrait mettre à jour le montant d\'un paiement', async () => {
      if (!testPaiementId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/paiements/${testPaiementId}`)
        .send({ montant: 150.75 })
        .expect(200);

      expect(parseFloat(response.body.montant)).toBe(150.75);
    });

    it('devrait rejeter un objet de mise à jour vide', async () => {
      if (!testPaiementId) {
        return;
      }

      await request(app)
        .patch(`/api/paiements/${testPaiementId}`)
        .send({})
        .expect(400);
    });

    it('devrait retourner 404 si paiement non trouvé', async () => {
      await request(app)
        .patch('/api/paiements/999999')
        .send({ statut: 'validé' })
        .expect(404);
    });
  });

  describe('GET /api/paiements (avec recherche)', () => {
    it('devrait rechercher des paiements par plage de montants', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ minAmount: 50, maxAmount: 200 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait rechercher des paiements par plage de dates', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .query({ 
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter une plage de dates invalide', async () => {
      await request(app)
        .get('/api/paiements')
        .query({ 
          dateFrom: '2025-12-31',
          dateTo: '2025-01-01'
        })
        .expect(400);
    });

    it('devrait rejeter une plage de montants invalide', async () => {
      await request(app)
        .get('/api/paiements')
        .query({ 
          minAmount: 500,
          maxAmount: 100
        })
        .expect(400);
    });
  });

  describe('POST /api/paiements/create-payment-intent', () => {
    it.skip('devrait créer un PaymentIntent Stripe (requires Stripe API key)', async () => {
      // Ce test nécessite une clé API Stripe valide
      // À tester manuellement ou dans un environnement de staging
    });

    it('devrait retourner 404 pour une transaction inexistante', async () => {
      const paymentRequest = {
        id_transa: 999999,
        montant: 100.00
      };

      await request(app)
        .post('/api/paiements/create-payment-intent')
        .send(paymentRequest)
        .expect(404);
    });
  });

  describe('DELETE /api/paiements/:id', () => {
    it('devrait supprimer un paiement', async () => {
      // Créer un paiement temporaire
      const tempPaiement = await Paiement.create({
        id_transa: testTransactionId,
        montant: 50.00,
        type: 'especes',
        statut: 'attente'
      });

      await request(app)
        .delete(`/api/paiements/${tempPaiement.id_paie}`)
        .expect(204);

      // Vérifier que le paiement a été supprimé
      const deleted = await Paiement.findByPk(tempPaiement.id_paie);
      expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si paiement non trouvé', async () => {
      await request(app)
        .delete('/api/paiements/999999')
        .expect(404);
    });
  });

  describe('Contraintes de base de données', () => {
    it('devrait respecter la contrainte CHECK montant > 0 (via validation Joi)', async () => {
      const invalidPaiement = {
        id_transa: testTransactionId,
        montant: 0,
        type: 'carte'
      };

      await request(app)
        .post('/api/paiements')
        .send(invalidPaiement)
        .expect(400);
    });

    it('devrait stocker la date comme timestamp', async () => {
      if (!testPaiementId) {
        return;
      }

      const response = await request(app)
        .get(`/api/paiements/${testPaiementId}`)
        .expect(200);

      expect(response.body).toHaveProperty('date');
      // Vérifier que la date est au format ISO (timestamp)
      expect(new Date(response.body.date).toISOString()).toBeTruthy();
    });
  });
});

