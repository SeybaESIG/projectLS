import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockUpsert = jest.fn();
const mockFindAll = jest.fn();
const mockCount = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  MsgLecture: {
    upsert: mockUpsert,
    findAll: mockFindAll,
  },
  Message: {
    count: mockCount,
  },
  Utilisateur: {},
  Annonce: {},
}));

jest.unstable_mockModule('../config/db.js', () => ({
  default: {
    query: jest.fn().mockResolvedValue([]),
    QueryTypes: { SELECT: 'SELECT' }
  }
}));

const msgLecturesController = await import('../controllers/msgLecturesController.js');

describe('Msg Lectures Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>;
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
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('markConversationAsRead', () => {
    it('devrait créer un nouvel enregistrement de lecture', async () => {
      const requestData = {
        id_expediteur: 1,
        id_destinataire: 2,
        id_annon: 5
      };

      const mockLecture = {
        id_lecture: 1,
        ...requestData,
        dernier_acces: new Date()
      };

      mockRequest.body = requestData;
      mockUpsert.mockResolvedValue([mockLecture, true]);

      await msgLecturesController.markConversationAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id_expediteur: 1,
          id_destinataire: 2,
          id_annon: 5
        }),
        expect.any(Object)
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Conversation marquée comme lue'
        })
      );
    });

    it('devrait mettre à jour un enregistrement existant', async () => {
      const requestData = {
        id_expediteur: 1,
        id_destinataire: 2,
        id_annon: 5
      };

      const mockLecture = {
        id_lecture: 1,
        ...requestData,
        dernier_acces: new Date()
      };

      mockRequest.body = requestData;
      mockUpsert.mockResolvedValue([mockLecture, false]); // false = updated

      await msgLecturesController.markConversationAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Dernière lecture mise à jour'
        })
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockRequest.body = { id_expediteur: 1, id_destinataire: 2 };
      mockUpsert.mockRejectedValue(error);

      await msgLecturesController.markConversationAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllMsgLectures', () => {
    it('devrait retourner toutes les lectures', async () => {
      const mockLectures = [
        { id_lecture: 1, id_expediteur: 1, id_destinataire: 2 },
        { id_lecture: 2, id_expediteur: 2, id_destinataire: 1 },
      ];

      mockFindAll.mockResolvedValue(mockLectures);

      await msgLecturesController.getAllMsgLectures(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockLectures);
    });
  });
});


