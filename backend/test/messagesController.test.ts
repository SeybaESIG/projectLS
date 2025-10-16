import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/firebaseAuth.js';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindOne = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCreate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Message: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findAndCountAll: mockFindAndCountAll,
    create: mockCreate,
  },
  Utilisateur: {
    findOne: mockFindOne,
  },
  MsgLecture: {
    findAll: jest.fn().mockResolvedValue([]),
  },
}));

// Mock encryption service
jest.unstable_mockModule('../services/encryptionService.js', () => ({
  encryptMessage: jest.fn().mockImplementation(async (text: string) => `encrypted_${text}`),
  decryptMessage: jest.fn().mockImplementation(async (text: string) => text.replace('encrypted_', '')),
}));

const messagesController = await import('../controllers/messagesController.js');
const { encryptMessage, decryptMessage } = await import('../services/encryptionService.js');

describe('Messages Controller - Unit Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();

    mockRequest = {
      params: {},
      body: {},
      query: {},
      user: {
        uid: 'firebase-test-uid',
        email: 'alice.martin@example.com',
        email_verified: true
      }
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Mock utilisateur par défaut
    mockFindOne.mockResolvedValue({
      id_util: 1,
      email: 'alice.martin@example.com',
      username: 'alice.martin',
      nom: 'Martin',
      prenom: 'Alice'
    });

    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('devrait encrypter le message avant création', async () => {
      const messageData = {
        id_expediteur: 1,
        id_destinataire: 2,
        id_annon: 5,
        contenu: 'Message en clair',
        url_image: 'https://example.com/image.jpg'
      };

      const mockCreatedMessage = {
        id_msg: 1,
        ...messageData,
        contenu: 'encrypted_Message en clair',
        toJSON: function() { return { ...this }; }
      };

      mockRequest.body = messageData;
      mockCreate.mockResolvedValue(mockCreatedMessage);
      mockFindByPk.mockResolvedValue(mockCreatedMessage);

      await messagesController.createMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(encryptMessage).toHaveBeenCalledWith('Message en clair');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          contenu: 'encrypted_Message en clair'
        })
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('getAllMessages', () => {
    it('devrait décrypter les messages retournés', async () => {
      const mockMessages = [
        {
          id_msg: 1,
          contenu: 'encrypted_Message 1',
          toJSON: function() { return { id_msg: this.id_msg, contenu: this.contenu }; }
        },
        {
          id_msg: 2,
          contenu: 'encrypted_Message 2',
          toJSON: function() { return { id_msg: this.id_msg, contenu: this.contenu }; }
        },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockMessages,
      });

      await messagesController.getAllMessages(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(decryptMessage).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ contenu: 'Message 1' }),
            expect.objectContaining({ contenu: 'Message 2' })
          ])
        })
      );
    });
  });

  describe('getMessageById', () => {
    it('devrait décrypter le message retourné', async () => {
      const mockMessage = {
        id_msg: 1,
        id_expediteur: 1,  // L'utilisateur connecté est l'expéditeur
        id_destinataire: 2,
        contenu: 'encrypted_Message secret',
        toJSON: function() { return { id_msg: this.id_msg, id_expediteur: this.id_expediteur, id_destinataire: this.id_destinataire, contenu: this.contenu }; }
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockMessage);

      await messagesController.getMessageById(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(decryptMessage).toHaveBeenCalledWith('encrypted_Message secret');
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ contenu: 'Message secret' })
      );
    });

    it('devrait retourner 404 si message non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await messagesController.getMessageById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteMessage', () => {
    it('devrait supprimer un message', async () => {
      const mockMessage = {
        id_msg: 1,
        id_expediteur: 1,  // L'utilisateur connecté est l'expéditeur
        id_destinataire: 2,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockMessage);

      await messagesController.deleteMessage(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockMessage.destroy).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Message supprimé' })
      );
    });
  });
});




