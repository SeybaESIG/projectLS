import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import evaluationsRoutes from '../routes/evaluationsRoutes.js';
import { Evaluation, Utilisateur, Transaction } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { mockAuthMiddleware } from './helpers/mockAuth.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());

// Mock de l'authentification pour les tests
app.use(mockAuthMiddleware);

app.use('/api/evaluations', evaluationsRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Evaluations Routes - Integration Tests', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testTransactionId: number;
  let aliceUserId: number;  // ID de l'utilisateur alice.martin (mocké dans l'auth)

  // Setup
  beforeAll(async () => {
    // Récupérer l'utilisateur alice.martin (celui qui est mocké dans l'authentification)
    const aliceUser = await Utilisateur.findOne({ where: { email: 'alice.martin@example.com' } });
    if (aliceUser) {
      aliceUserId = aliceUser.get('id_util') as number;
      testUserId1 = aliceUserId;  // Pour compatibilité avec les tests existants
    }

    // Récupérer un deuxième utilisateur
    const users = await Utilisateur.findAll({ 
      where: { email: { [Op.ne]: 'alice.martin@example.com' } }, 
      limit: 1 
    });
    if (users.length >= 1) {
      testUserId2 = users[0].get('id_util') as number;
    }

    // Récupérer une transaction
    const transaction = await Transaction.findOne();
    if (transaction) {
      testTransactionId = transaction.get('id_transa') as number;
    }

    // Nettoyer les évaluations de test
    await Evaluation.destroy({
      where: {
        [Op.or]: [
          { id_util_donne: testUserId1, id_util_recoit: testUserId2 },
          { id_util_donne: testUserId2, id_util_recoit: testUserId1 }
        ]
      }
    });

    // Réinitialiser la note_moyenne des utilisateurs de test
    await Utilisateur.update(
      { note_moyenne: '0' },
      { where: { id_util: [testUserId1, testUserId2] } }
    );
  });

  // Nettoyage
  afterAll(async () => {
    await Evaluation.destroy({
      where: {
        [Op.or]: [
          { id_util_donne: testUserId1, id_util_recoit: testUserId2 },
          { id_util_donne: testUserId2, id_util_recoit: testUserId1 }
        ]
      }
    });

    // Réinitialiser la note_moyenne
    await Utilisateur.update(
      { note_moyenne: '0' },
      { where: { id_util: [testUserId1, testUserId2] } }
    );
  });

  describe('GET /api/evaluations', () => {
    it('devrait retourner toutes les évaluations avec pagination', async () => {
      const response = await request(app)
        .get('/api/evaluations')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/evaluations?page=1&limit=5')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/evaluations', () => {
    it('devrait créer une nouvelle évaluation', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // NE PLUS envoyer id_util_donne car le controller le force automatiquement
      const newEvaluation = {
        id_util_recoit: testUserId2,
        id_transa: testTransactionId,
        note: 4.5,
        commentaire: 'Excellent utilisateur!'
      };

      const response = await request(app)
        .post('/api/evaluations')
        .send(newEvaluation)
        .expect(201);

      // L'id_util_donne est celui de l'utilisateur connecté (alice.martin)
      expect(response.body.id_util_donne).toBe(aliceUserId);
      expect(response.body.id_util_recoit).toBe(testUserId2);
      expect(parseFloat(response.body.note)).toBe(4.5);
    });

    it('devrait rejeter une note < 0', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      const invalidEvaluation = {
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 1000,
        note: -1
      };

      await request(app)
        .post('/api/evaluations')
        .send(invalidEvaluation)
        .expect(400);
    });

    it('devrait rejeter une note > 5', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      const invalidEvaluation = {
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 1001,
        note: 5.1
      };

      await request(app)
        .post('/api/evaluations')
        .send(invalidEvaluation)
        .expect(400);
    });

    it('devrait rejeter si util_donne = util_recoit', async () => {
      if (!testUserId1 || !testTransactionId) {
        return;
      }

      const invalidEvaluation = {
        id_util_donne: testUserId1,
        id_util_recoit: testUserId1,
        id_transa: testTransactionId + 1002,
        note: 4.5
      };

      await request(app)
        .post('/api/evaluations')
        .send(invalidEvaluation)
        .expect(400);
    });
  });

  describe('GET /api/evaluations/:id_util_donne/:id_util_recoit/:id_transa', () => {
    it('devrait retourner une évaluation par clé composite', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      const response = await request(app)
        .get(`/api/evaluations/${testUserId1}/${testUserId2}/${testTransactionId}`)
        .expect(200);

      expect(response.body.id_util_donne).toBe(testUserId1);
      expect(response.body.id_util_recoit).toBe(testUserId2);
    });

    it('devrait retourner 404 pour une évaluation inexistante', async () => {
      await request(app)
        .get('/api/evaluations/999/998/997')
        .expect(404);
    });

    it('devrait rejeter des IDs invalides', async () => {
      await request(app)
        .get('/api/evaluations/invalid/2/3')
        .expect(400);
    });
  });

  describe('GET /api/evaluations/recues/:id_util', () => {
    it('devrait retourner les évaluations reçues par un utilisateur', async () => {
      if (!testUserId1) {
        return;
      }

      // L'utilisateur doit demander SES propres évaluations (alice = testUserId1)
      const response = await request(app)
        .get(`/api/evaluations/recues/${testUserId1}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].id_util_recoit).toBe(testUserId1);
      }
    });

    it('devrait rejeter un id_util invalide', async () => {
      await request(app)
        .get('/api/evaluations/recues/invalid')
        .expect(400);
    });
  });

  describe('GET /api/evaluations/donnees/:id_util', () => {
    it('devrait retourner les évaluations données par un utilisateur', async () => {
      if (!testUserId1) {
        return;
      }

      const response = await request(app)
        .get(`/api/evaluations/donnees/${testUserId1}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].id_util_donne).toBe(testUserId1);
      }
    });
  });

  describe('Routes non autorisées', () => {
    it('ne devrait PAS avoir de route PATCH (évaluations immuables)', async () => {
      await request(app)
        .patch('/api/evaluations/1/2/3')
        .send({ note: 5 })
        .expect(404);
    });

    it('ne devrait PAS avoir de route PUT (évaluations immuables)', async () => {
      await request(app)
        .put('/api/evaluations/1/2/3')
        .send({ note: 5 })
        .expect(404);
    });
  });

  describe('DELETE /api/evaluations/:id_util_donne/:id_util_recoit/:id_transa', () => {
    it('devrait supprimer une évaluation', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // Créer une évaluation à supprimer
      await Evaluation.create({
        id_util_donne: testUserId2,
        id_util_recoit: testUserId1,
        id_transa: testTransactionId + 5000,
        note: '3.5',
        commentaire: 'A supprimer'
      });

      const response = await request(app)
        .delete(`/api/evaluations/${testUserId2}/${testUserId1}/${testTransactionId + 5000}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Évaluation supprimée');

      // Vérifier la suppression
      await request(app)
        .get(`/api/evaluations/${testUserId2}/${testUserId1}/${testTransactionId + 5000}`)
        .expect(404);
    });
  });

  describe('Trigger note_moyenne', () => {
    it('devrait mettre à jour la note_moyenne automatiquement après INSERT', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // Récupérer la note_moyenne avant
      const userBefore = await Utilisateur.findByPk(testUserId2);
      const noteMoyenneAvant = parseFloat(userBefore?.note_moyenne || '0');

      // Créer une évaluation
      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 6000,
        note: '4.5'
      });

      // Récupérer la note_moyenne après
      const userAfter = await Utilisateur.findByPk(testUserId2);
      const noteMoyenneApres = parseFloat(userAfter?.note_moyenne || '0');

      // La note_moyenne devrait avoir changé
      expect(noteMoyenneApres).not.toBe(noteMoyenneAvant);
      expect(noteMoyenneApres).toBeGreaterThan(0);

      // Nettoyer
      await Evaluation.destroy({
        where: {
          id_util_donne: testUserId1,
          id_util_recoit: testUserId2,
          id_transa: testTransactionId + 6000
        }
      });
    });

    it('devrait avoir une note_moyenne avec 1 décimale', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // Créer des évaluations qui donnent une moyenne avec potentiellement 2 décimales
      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 7000,
        note: '4.3'
      });

      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 7001,
        note: '3.7'
      });

      // Moyenne = (4.3 + 3.7) / 2 = 4.0 → arrondi à 1 décimale = 4.0
      const user = await Utilisateur.findByPk(testUserId2);
      const moyenne = user?.note_moyenne || '0';
      
      // Vérifier qu'il y a au maximum 1 décimale
      const decimalPlaces = (moyenne.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
      expect(parseFloat(moyenne)).toBe(4.0);

      // Nettoyer
      await Evaluation.destroy({
        where: {
          id_util_donne: testUserId1,
          id_util_recoit: testUserId2,
          id_transa: { [Op.in]: [testTransactionId + 7000, testTransactionId + 7001] }
        }
      });
    });

    it('devrait recalculer la note_moyenne après DELETE', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // Créer deux évaluations : 5.0 et 3.0 → moyenne = 4.0
      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 8000,
        note: '5.0'
      });

      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 8001,
        note: '3.0'
      });

      // Vérifier la moyenne (devrait être 4.0)
      const user1 = await Utilisateur.findByPk(testUserId2);
      const moyenne1 = parseFloat(user1?.note_moyenne || '0');

      // Supprimer une évaluation (garde seulement 3.0)
      await request(app)
        .delete(`/api/evaluations/${testUserId1}/${testUserId2}/${testTransactionId + 8000}`)
        .expect(200);

      // Vérifier que la moyenne a changé (devrait être 3.0 maintenant)
      const user2 = await Utilisateur.findByPk(testUserId2);
      const moyenne2 = parseFloat(user2?.note_moyenne || '0');

      expect(moyenne2).toBeLessThan(moyenne1);
      expect(moyenne2).toBe(3.0);

      // Nettoyer
      await Evaluation.destroy({
        where: {
          id_util_donne: testUserId1,
          id_util_recoit: testUserId2,
          id_transa: testTransactionId + 8001
        }
      });
    });

    it('devrait calculer correctement la moyenne avec 1 décimale', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      // Créer 3 évaluations : 4.5, 4.2, 3.8 → moyenne = 12.5/3 = 4.166... → ROUND(1) = 4.2
      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 9000,
        note: '4.5'
      });

      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 9001,
        note: '4.2'
      });

      await Evaluation.create({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 9002,
        note: '3.8'
      });

      // Vérifier la moyenne (avec 1 décimale)
      const user = await Utilisateur.findByPk(testUserId2);
      const moyenne = parseFloat(user?.note_moyenne || '0');

      // Moyenne = (4.5 + 4.2 + 3.8) / 3 = 4.166... → ROUND(1) = 4.2
      expect(moyenne).toBe(4.2);

      // Vérifier qu'il y a au maximum 1 décimale
      const moyenneStr = user?.note_moyenne || '0';
      const decimalPlaces = (moyenneStr.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);

      // Nettoyer
      await Evaluation.destroy({
        where: {
          id_util_donne: testUserId1,
          id_util_recoit: testUserId2,
          id_transa: { [Op.in]: [testTransactionId + 9000, testTransactionId + 9001, testTransactionId + 9002] }
        }
      });
    });
  });

  describe('GET /api/evaluations/search', () => {
    it('devrait rechercher par fourchette de notes', async () => {
      const response = await request(app)
        .get('/api/evaluations/search?note_min=4&note_max=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rejeter note_min > note_max', async () => {
      await request(app)
        .get('/api/evaluations/search?note_min=5&note_max=3')
        .expect(400);
    });

    it('devrait rejeter dateFrom > dateTo', async () => {
      await request(app)
        .get('/api/evaluations/search?dateFrom=2025-12-31&dateTo=2025-01-01')
        .expect(400);
    });
  });

  describe('Contraintes de la base de données', () => {
    it('devrait être bloqué par la DB si note < 0', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      const evaluation = await Evaluation.build({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 10000,
        note: '-1'
      });

      await expect(evaluation.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si note > 5', async () => {
      if (!testUserId1 || !testUserId2 || !testTransactionId) {
        return;
      }

      const evaluation = await Evaluation.build({
        id_util_donne: testUserId1,
        id_util_recoit: testUserId2,
        id_transa: testTransactionId + 10001,
        note: '6'
      });

      await expect(evaluation.save()).rejects.toThrow();
    });
  });
});

