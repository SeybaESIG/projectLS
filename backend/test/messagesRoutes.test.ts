import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import messagesRoutes from '../routes/messagesRoutes.js';
import { Message, Utilisateur, Annonce } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { encryptMessage, decryptMessage } from '../services/encryptionService.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/messages', messagesRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Messages Routes - Integration Tests', () => {
  let testMessageId: number;
  let testUserId1: number;
  let testUserId2: number;
  let testAnnonceId: number;

  // Setup: Récupérer des données de test
  beforeAll(async () => {
    // S'assurer que la clé d'encryptage est définie
    if (!process.env.MESSAGE_ENCRYPTION_KEY) {
      throw new Error('MESSAGE_ENCRYPTION_KEY doit être définie pour les tests');
    }

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

    // Nettoyer les messages de test
    await Message.destroy({
      where: {
        contenu: {
          [Op.like]: '%Test Message%'
        }
      }
    });
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    await Message.destroy({
      where: {
        contenu: {
          [Op.like]: '%Test Message%'
        }
      }
    });
  });

  describe('POST /api/messages', () => {
    it('devrait créer un nouveau message et l\'encrypter', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const newMessage = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        id_annon: testAnnonceId,
        contenu: 'Test Message - Bonjour!'
      };

      const response = await request(app)
        .post('/api/messages')
        .send(newMessage)
        .expect(201);

      expect(response.body).toHaveProperty('id_msg');
      expect(response.body.contenu).toBe('Test Message - Bonjour!'); // Décrypté dans la réponse
      expect(response.body.id_expediteur).toBe(testUserId1);
      expect(response.body.id_destinataire).toBe(testUserId2);

      testMessageId = response.body.id_msg;

      // Vérifier que le message est bien chiffré en DB
      const messageInDb = await Message.findByPk(testMessageId);
      expect(messageInDb?.contenu).not.toBe('Test Message - Bonjour!'); // Chiffré en DB
    });

    it('devrait créer un message avec URL image', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const newMessage = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        contenu: 'Test Message avec image',
        url_image: 'https://storage.googleapis.com/bucket/test.jpg'
      };

      const response = await request(app)
        .post('/api/messages')
        .send(newMessage)
        .expect(201);

      expect(response.body.url_image).toBe('https://storage.googleapis.com/bucket/test.jpg');
    });

    it('devrait rejeter si expediteur = destinataire', async () => {
      if (!testUserId1) {
        return;
      }

      const invalidMessage = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId1,
        contenu: 'Message à soi-même'
      };

      await request(app)
        .post('/api/messages')
        .send(invalidMessage)
        .expect(400);
    });

    it('devrait rejeter un message vide', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const invalidMessage = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        contenu: ''
      };

      await request(app)
        .post('/api/messages')
        .send(invalidMessage)
        .expect(400);
    });

    it('devrait rejeter un message trop long', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const invalidMessage = {
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        contenu: 'a'.repeat(1001)
      };

      await request(app)
        .post('/api/messages')
        .send(invalidMessage)
        .expect(400);
    });
  });

  describe('GET /api/messages', () => {
    it('devrait retourner tous les messages avec pagination', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait retourner des messages déchiffrés', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(200);

      // Vérifier qu'au moins un message est déchiffré
      if (response.body.data.length > 0) {
        const firstMessage = response.body.data[0];
        expect(firstMessage).toHaveProperty('contenu');
        // Le contenu ne devrait pas être en base64 chiffré
        expect(firstMessage.contenu).not.toMatch(/^[A-Za-z0-9+/=]+$/);
      }
    });
  });

  describe('GET /api/messages/:id', () => {
    it('devrait retourner un message déchiffré par ID', async () => {
      if (!testMessageId) {
        return;
      }

      const response = await request(app)
        .get(`/api/messages/${testMessageId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_msg', testMessageId);
      expect(response.body).toHaveProperty('contenu');
      expect(response.body.contenu).toBe('Test Message - Bonjour!');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/messages/999999')
        .expect(404);
    });
  });

  describe('GET /api/messages/conversation', () => {
    it('devrait retourner une conversation', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const response = await request(app)
        .get(`/api/messages/conversation?id_expediteur=${testUserId1}&id_destinataire=${testUserId2}&id_annon=${testAnnonceId || ''}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rejeter si id_expediteur manquant', async () => {
      await request(app)
        .get('/api/messages/conversation?id_destinataire=2')
        .expect(400);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('devrait supprimer un message', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      // Créer un message à supprimer
      const messageToDelete = await Message.create({
        id_expediteur: testUserId1,
        id_destinataire: testUserId2,
        contenu: await encryptMessage('Test Message à supprimer')
      });

      const msgId = messageToDelete.get('id_msg') as number;

      const response = await request(app)
        .delete(`/api/messages/${msgId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Message supprimé');

      // Vérifier suppression
      await request(app)
        .get(`/api/messages/${msgId}`)
        .expect(404);
    });
  });

  describe('Encryptage/Décryptage', () => {
    it('devrait stocker le message chiffré en DB', async () => {
      if (!testUserId1 || !testUserId2) {
        return;
      }

      const plaintext = 'Message secret test';

      // Créer via API
      const response = await request(app)
        .post('/api/messages')
        .send({
          id_expediteur: testUserId1,
          id_destinataire: testUserId2,
          contenu: plaintext
        })
        .expect(201);

      const msgId = response.body.id_msg;

      // Vérifier en DB directement
      const messageInDb = await Message.findByPk(msgId);
      
      // Le contenu en DB doit être chiffré (différent du plaintext)
      expect(messageInDb?.contenu).not.toBe(plaintext);
      
      // Mais décryptable
      const decrypted = await decryptMessage(messageInDb?.contenu || '');
      expect(decrypted).toBe(plaintext);

      // Nettoyer
      await messageInDb?.destroy();
    });
  });
});


