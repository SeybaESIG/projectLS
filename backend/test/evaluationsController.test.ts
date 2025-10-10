import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Evaluation: {
    findAll: mockFindAll,
    findOne: mockFindOne,
    findAndCountAll: mockFindAndCountAll,
    create: mockCreate,
  },
  Utilisateur: {},
  Transaction: {},
}));

const evaluationsController = await import('../controllers/evaluationsController.js');

describe('Evaluations Controller - Unit Tests', () => {
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

  describe('getAllEvaluations', () => {
    it('devrait retourner toutes les évaluations avec pagination', async () => {
      const mockEvaluations = [
        { id_util_donne: 1, id_util_recoit: 2, id_transa: 1, note: '4.5' },
        { id_util_donne: 2, id_util_recoit: 1, id_transa: 2, note: '5.0' },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 10,
        rows: mockEvaluations,
      });

      await evaluationsController.getAllEvaluations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: mockEvaluations,
        pagination: {
          total: 10,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });
  });

  describe('getEvaluationById', () => {
    it('devrait retourner une évaluation par clé composite', async () => {
      const mockEvaluation = {
        id_util_donne: 1,
        id_util_recoit: 2,
        id_transa: 5,
        note: '4.5',
      };

      mockRequest.params = {
        id_util_donne: '1',
        id_util_recoit: '2',
        id_transa: '5'
      };
      mockFindOne.mockResolvedValue(mockEvaluation);

      await evaluationsController.getEvaluationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id_util_donne: 1,
            id_util_recoit: 2,
            id_transa: 5
          }
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockEvaluation);
    });

    it('devrait retourner 404 si évaluation non trouvée', async () => {
      mockRequest.params = {
        id_util_donne: '1',
        id_util_recoit: '2',
        id_transa: '999'
      };
      mockFindOne.mockResolvedValue(null);

      await evaluationsController.getEvaluationById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('createEvaluation', () => {
    it('devrait créer une nouvelle évaluation', async () => {
      const newEvaluationData = {
        id_util_donne: 1,
        id_util_recoit: 2,
        id_transa: 5,
        note: 4.5,
        commentaire: 'Excellent!'
      };

      const mockCreatedEvaluation = { ...newEvaluationData };

      mockRequest.body = newEvaluationData;
      mockCreate.mockResolvedValue(mockCreatedEvaluation);
      mockFindOne.mockResolvedValue(mockCreatedEvaluation);

      await evaluationsController.createEvaluation(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreate).toHaveBeenCalledWith(newEvaluationData);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('getEvaluationsRecues', () => {
    it('devrait retourner les évaluations reçues par un utilisateur', async () => {
      const mockEvaluations = [
        { id_util_donne: 1, id_util_recoit: 2, note: '4.5' },
        { id_util_donne: 3, id_util_recoit: 2, note: '5.0' },
      ];

      mockRequest.params = { id_util: '2' };
      mockFindAll.mockResolvedValue(mockEvaluations);

      await evaluationsController.getEvaluationsRecues(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_util_recoit: 2 }
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockEvaluations);
    });
  });

  describe('getEvaluationsDonnees', () => {
    it('devrait retourner les évaluations données par un utilisateur', async () => {
      const mockEvaluations = [
        { id_util_donne: 1, id_util_recoit: 2, note: '4.5' },
        { id_util_donne: 1, id_util_recoit: 3, note: '3.0' },
      ];

      mockRequest.params = { id_util: '1' };
      mockFindAll.mockResolvedValue(mockEvaluations);

      await evaluationsController.getEvaluationsDonnees(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_util_donne: 1 }
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockEvaluations);
    });
  });

  describe('searchEvaluations', () => {
    it('devrait rechercher par note_min et note_max', async () => {
      const mockEvaluations = [
        { id_util_donne: 1, id_util_recoit: 2, note: '4.5' },
      ];

      mockRequest.query = { note_min: '4', note_max: '5' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockEvaluations,
      });

      await evaluationsController.searchEvaluations(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
    });
  });
});


