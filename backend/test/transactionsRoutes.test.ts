import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import transactionsRoutes from '../routes/transactionsRoutes.js';
import { Transaction, Utilisateur, Role, Ville, Pays } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { Op } from 'sequelize';

initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/transactions', transactionsRoutes);
app.use(errorHandler);

describe('Transactions Routes - Integration Tests', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testTransactionId: number;
  let testRoleId: number;
  let testVilleId: number;

  beforeAll(async () => {
    // Créer un pays
    const pays = await Pays.create({
      nom_pays: 'Test Country Trans',
      code_pays: 'TCT'
    });

    // Créer une ville
    const ville = await Ville.create({
      id_pays: pays.id_pays,
      nom_ville: 'Test City Trans'
    });
    testVilleId = ville.id_ville;

    // Créer un rôle
    const role = await Role.create({
      nom_role: 'utilisateur_trans'
    });
    testRoleId = role.id_role;

    // Créer deux utilisateurs de test
    const user1 = await Utilisateur.create({
      id_ville: testVilleId,
      id_role: testRoleId,
      username: `testuser_trans1_${Date.now()}`,
      nom: 'TestNom1',
      prenom: 'TestPrenom1',
      email: `testuser_trans1_${Date.now()}@test.com`,
      tel: `+33600${Date.now().toString().slice(-6)}`,
      mot_de_passe: 'password123'
    });
    testUserId1 = user1.id_util;

    const user2 = await Utilisateur.create({
      id_ville: testVilleId,
      id_role: testRoleId,
      username: `testuser_trans2_${Date.now()}`,
      nom: 'TestNom2',
      prenom: 'TestPrenom2',
      email: `testuser_trans2_${Date.now()}@test.com`,
      tel: `+33600${Date.now().toString().slice(-6) + '2'}`,
      mot_de_passe: 'password123'
    });
    testUserId2 = user2.id_util;
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testTransactionId) {
      await Transaction.destroy({
        where: { id_transa: testTransactionId }
      });
    }
    
    await Transaction.destroy({
      where: {
        [Op.or]: [
          { id_payeur: testUserId1 },
          { id_payeur: testUserId2 },
          { id_receveur: testUserId1 },
          { id_receveur: testUserId2 }
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
    
    await Pays.destroy({ where: { nom_pays: 'Test Country Trans' } });
  });

  describe('POST /api/transactions', () => {
    it('devrait créer une nouvelle transaction', async () => {
      const newTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: 100.50,
        statut: 'attente'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201);

      expect(response.body).toHaveProperty('id_transa');
      expect(parseFloat(response.body.montant)).toBe(100.50);
      expect(response.body.statut).toBe('attente');
      expect(response.body.id_payeur).toBe(testUserId1);
      expect(response.body.id_receveur).toBe(testUserId2);

      testTransactionId = response.body.id_transa;
    });

    it('devrait utiliser "attente" comme statut par défaut', async () => {
      const newTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: 50.00
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(newTransaction)
        .expect(201);

      expect(response.body.statut).toBe('attente');
      
      // Nettoyer
      await Transaction.destroy({ where: { id_transa: response.body.id_transa } });
    });

    it('devrait rejeter si payeur et receveur sont identiques', async () => {
      const invalidTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId1,
        montant: 100.50
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction)
        .expect(400);

      expect(response.body.message).toBe('Erreur de validation');
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('devrait rejeter un montant négatif', async () => {
      const invalidTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: -50
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction)
        .expect(400);

      expect(response.body.message).toMatch(/validation/i);
    });

    it('devrait rejeter un statut invalide', async () => {
      const invalidTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: 100.50,
        statut: 'pending'
      };

      const response = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction)
        .expect(400);

      expect(response.body.message).toMatch(/validation/i);
    });
  });

  describe('GET /api/transactions', () => {
    it('devrait récupérer toutes les transactions avec pagination', async () => {
      const response = await request(app)
        .get('/api/transactions')
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

    it('devrait filtrer par payeur', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ payeur: testUserId1 })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((trans: any) => {
        expect(trans.id_payeur).toBe(testUserId1);
      });
    });

    it('devrait filtrer par statut', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .query({ statut: 'attente' })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((trans: any) => {
        expect(trans.statut).toBe('attente');
      });
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('devrait récupérer une transaction par ID', async () => {
      if (!testTransactionId) {
        return;
      }

      const response = await request(app)
        .get(`/api/transactions/${testTransactionId}`)
        .expect(200);

      expect(response.body.id_transa).toBe(testTransactionId);
      expect(response.body).toHaveProperty('montant');
      expect(response.body).toHaveProperty('statut');
    });

    it('devrait retourner 404 si transaction non trouvée', async () => {
      await request(app)
        .get('/api/transactions/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/transactions/invalid')
        .expect(400);
    });
  });

  describe('PATCH /api/transactions/:id', () => {
    it('devrait mettre à jour le statut d\'une transaction', async () => {
      if (!testTransactionId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/transactions/${testTransactionId}`)
        .send({ statut: 'validée' })
        .expect(200);

      expect(response.body.statut).toBe('validée');
    });

    it('devrait mettre à jour le montant d\'une transaction', async () => {
      if (!testTransactionId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/transactions/${testTransactionId}`)
        .send({ montant: 150.75 })
        .expect(200);

      expect(parseFloat(response.body.montant)).toBe(150.75);
    });

    it('devrait rejeter un objet de mise à jour vide', async () => {
      if (!testTransactionId) {
        return;
      }

      await request(app)
        .patch(`/api/transactions/${testTransactionId}`)
        .send({})
        .expect(400);
    });

    it('devrait retourner 404 si transaction non trouvée', async () => {
      await request(app)
        .patch('/api/transactions/999999')
        .send({ statut: 'validée' })
        .expect(404);
    });
  });

  describe('GET /api/transactions/search', () => {
    it('devrait rechercher des transactions par plage de montants', async () => {
      const response = await request(app)
        .get('/api/transactions/search')
        .query({ minAmount: 50, maxAmount: 200 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('devrait rechercher des transactions par plage de dates', async () => {
      const response = await request(app)
        .get('/api/transactions/search')
        .query({ 
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter une plage de dates invalide', async () => {
      await request(app)
        .get('/api/transactions/search')
        .query({ 
          dateFrom: '2025-12-31',
          dateTo: '2025-01-01'
        })
        .expect(400);
    });

    it('devrait rejeter une plage de montants invalide', async () => {
      await request(app)
        .get('/api/transactions/search')
        .query({ 
          minAmount: 500,
          maxAmount: 100
        })
        .expect(400);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('devrait supprimer une transaction', async () => {
      // Créer une transaction temporaire
      const tempTransaction = await Transaction.create({
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: 50.00,
        statut: 'attente'
      });

      await request(app)
        .delete(`/api/transactions/${tempTransaction.id_transa}`)
        .expect(204);

      // Vérifier que la transaction a été supprimée
      const deleted = await Transaction.findByPk(tempTransaction.id_transa);
      expect(deleted).toBeNull();
    });

    it('devrait retourner 404 si transaction non trouvée', async () => {
      await request(app)
        .delete('/api/transactions/999999')
        .expect(404);
    });
  });

  describe('Contraintes de base de données', () => {
    it('devrait respecter la contrainte CHECK montant > 0 (via validation Joi)', async () => {
      const invalidTransaction = {
        id_payeur: testUserId1,
        id_receveur: testUserId2,
        montant: 0
      };

      await request(app)
        .post('/api/transactions')
        .send(invalidTransaction)
        .expect(400);
    });

    it('devrait stocker la date comme timestamp', async () => {
      if (!testTransactionId) {
        return;
      }

      const response = await request(app)
        .get(`/api/transactions/${testTransactionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('date');
      // Vérifier que la date est au format ISO (timestamp)
      expect(new Date(response.body.date).toISOString()).toBeTruthy();
    });
  });
});

