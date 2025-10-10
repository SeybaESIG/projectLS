import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import msgLecturesRoutes from '../routes/msgLecturesRoutes.js';
import { MsgLecture, Message, Utilisateur, Annonce } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { encryptMessage } from '../services/encryptionService.js';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/msg_lectures', msgLecturesRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Msg Lectures Routes - Integration Tests', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testAnnonceId: number;

  // Setup
  beforeAll(async () => {
    // Récupérer deux utilisateurs différents
    const users = await Utilisateur.findAll({ limit: 2 });
    if (users.length >= 2) {
      testUserId1 = users[0].get('id_util') as number;
      testUserId2 = users[1].get('id_util') as number;
    }

    // Récupérer une annonce
    const annonce = await Annonce.findOne();
    if (annonce) {
      testAnnonceId = annonce.get('id_annon') as number;
    }

    // Nettoyer les lectures de test
    await MsgLecture.destroy({
      where: {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2
      }
    });
  });

  // Nettoyage
  afterAll(async () => {
    await MsgLecture.destroy({
      where: {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2
      }
    });
  });

  describe('POST /api/msg_lectures/mark-read', () => {
    it('devrait créer un nouvel enregistrement de lecture', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const requestData = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        id_annon: testAnnonceId
      };

      const response = await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(requestData)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_lecture');
      expect(response.body.data.id_expediteur).toBe(testUserId1);
      expect(response.body.data.id_destinataire).toBe(testUserId2);
    });

    it('devrait mettre à jour un enregistrement existant (upsert)', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const requestData = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        id_annon: testAnnonceId
      };

      // Premier appel
      const response1 = await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(requestData)
        .expect(200);

      const firstAccess = response1.body.data.dernier_acces;

      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 100));

      // Deuxième appel (update)
      const response2 = await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(requestData)
        .expect(200);

      const secondAccess = response2.body.data.dernier_acces;

      // Le dernier_acces doit être mis à jour
      expect(new Date(secondAccess).getTime()).toBeGreaterThan(new Date(firstAccess).getTime());
      expect(response2.body.message).toMatch(/mise à jour/i);
    });

    it('devrait rejeter si id_expediteur manquant', async () => {
      const invalidRequest = {
        id_destinataire: testUserId2
      };

      await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(invalidRequest)
        .expect(400);
    });

    it('devrait rejeter si id_destinataire manquant', async () => {
      const invalidRequest = {
        id_expediteur: testUserId1
      };

      await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(invalidRequest)
        .expect(400);
    });

    it('devrait rejeter des IDs négatifs', async () => {
      const invalidRequest = {
        id_expediteur: -1,
        id_destinataire: testUserId2
      };

      await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(invalidRequest)
        .expect(400);
    });
  });

  describe('GET /api/msg_lectures/unread-count/:id_util', () => {
    it('devrait retourner le nombre de messages non lus par conversation', async () => {
      if (!testUserId2) {
        return;
      }

      const response = await request(app)
        .get(`/api/msg_lectures/unread-count/${testUserId2}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait rejeter un id_util invalide', async () => {
      await request(app)
        .get('/api/msg_lectures/unread-count/invalid')
        .expect(400);
    });
  });

  describe('GET /api/msg_lectures/unread-conversations/:id_util', () => {
    it('devrait retourner les conversations avec messages non lus', async () => {
      if (!testUserId2) {
        return;
      }

      const response = await request(app)
        .get(`/api/msg_lectures/unread-conversations/${testUserId2}`)
        .expect(200);

      expect(response.body).toHaveProperty('conversations_ouvertes');
      expect(response.body).toHaveProperty('conversations_non_ouvertes');
      expect(Array.isArray(response.body.conversations_ouvertes)).toBe(true);
      expect(Array.isArray(response.body.conversations_non_ouvertes)).toBe(true);
    });

    it('devrait rejeter un id_util invalide', async () => {
      await request(app)
        .get('/api/msg_lectures/unread-conversations/invalid')
        .expect(400);
    });
  });

  describe('GET /api/msg_lectures', () => {
    it('devrait retourner toutes les lectures', async () => {
      const response = await request(app)
        .get('/api/msg_lectures')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Contrainte UNIQUE', () => {
    it('devrait permettre un seul enregistrement par conversation', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const requestData = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        id_annon: testAnnonceId
      };

      // Premier insert
      await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(requestData)
        .expect(200);

      // Deuxième insert (devrait update, pas créer un doublon)
      await request(app)
        .post('/api/msg_lectures/mark-read')
        .send(requestData)
        .expect(200);

      // Vérifier qu'il n'y a qu'un seul enregistrement
      const lectures = await MsgLecture.findAll({
        where: {
          id_expediteur: testUserId1,
          id_destinataire: testUserId2,
          id_annon: testAnnonceId
        }
      });

      expect(lectures.length).toBe(1);
    });
  });
});

