import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindOne = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Abonnement: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findOne: mockFindOne,
    findAndCountAll: mockFindAndCountAll,
    create: mockCreate,
  },
  Utilisateur: {},
  TypeAbonnement: {},
}));

const abonnementsController = await import('../controllers/abonnementsController.js');

describe('Abonnements Controller - Unit Tests', () => {
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

  describe('getAllAbonnements', () => {
    it('devrait retourner tous les abonnements avec pagination', async () => {
      const mockAbonnements = [
        { id_abonnement: 1, id_util: 1, id_type_abonnement: 1 },
        { id_abonnement: 2, id_util: 2, id_type_abonnement: 2 },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 10,
        rows: mockAbonnements,
      });

      await abonnementsController.getAllAbonnements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: mockAbonnements,
        pagination: {
          total: 10,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockFindAndCountAll.mockRejectedValue(error);

      await abonnementsController.getAllAbonnements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAbonnementById', () => {
    it('devrait retourner un abonnement par son ID', async () => {
      const mockAbonnement = {
        id_abonnement: 1,
        id_util: 1,
        id_type_abonnement: 1,
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockAbonnement);

      await abonnementsController.getAbonnementById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockJson).toHaveBeenCalledWith(mockAbonnement);
    });

    it('devrait retourner 404 si abonnement non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await abonnementsController.getAbonnementById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Abonnement non trouvé',
      });
    });
  });

  describe('getAbonnementByUser', () => {
    it('devrait retourner l\'abonnement d\'un utilisateur', async () => {
      const mockAbonnement = {
        id_abonnement: 1,
        id_util: 5,
        id_type_abonnement: 2,
      };

      mockRequest.params = { id_util: '5' };
      mockFindOne.mockResolvedValue(mockAbonnement);

      await abonnementsController.getAbonnementByUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_util: 5 },
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockAbonnement);
    });

    it('devrait retourner 404 si utilisateur n\'a pas d\'abonnement', async () => {
      mockRequest.params = { id_util: '999' };
      mockFindOne.mockResolvedValue(null);

      await abonnementsController.getAbonnementByUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Aucun abonnement trouvé pour cet utilisateur',
      });
    });
  });

  describe('createAbonnement', () => {
    it('devrait créer un nouvel abonnement', async () => {
      const newAbonnementData = {
        id_util: 1,
        id_type_abonnement: 1,
        date_debut: new Date('2025-01-01'),
        date_fin: new Date('2025-12-31')
      };

      const mockCreatedAbonnement = { id_abonnement: 1, ...newAbonnementData };

      mockRequest.body = newAbonnementData;
      mockCreate.mockResolvedValue(mockCreatedAbonnement);
      mockFindByPk.mockResolvedValue(mockCreatedAbonnement);

      await abonnementsController.createAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreate).toHaveBeenCalledWith(newAbonnementData);
      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    it('devrait gérer les erreurs de création', async () => {
      const error = new Error('Creation failed');
      mockRequest.body = { id_util: 1 };
      mockCreate.mockRejectedValue(error);

      await abonnementsController.createAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAbonnement', () => {
    it('devrait mettre à jour un abonnement existant', async () => {
      const mockAbonnement = {
        id_abonnement: 1,
        id_util: 1,
        update: jest.fn().mockResolvedValue(undefined),
      };

      const updateData = { date_fin: new Date('2026-12-31') };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockFindByPk.mockResolvedValue(mockAbonnement);

      await abonnementsController.updateAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockAbonnement.update).toHaveBeenCalledWith(updateData);
    });

    it('devrait retourner 404 si abonnement non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { date_fin: new Date() };
      mockFindByPk.mockResolvedValue(null);

      await abonnementsController.updateAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteAbonnement', () => {
    it('devrait supprimer un abonnement', async () => {
      const mockAbonnement = {
        id_abonnement: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockAbonnement);

      await abonnementsController.deleteAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockAbonnement.destroy).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Abonnement supprimé',
      });
    });
  });

  describe('searchAbonnements', () => {
    it('devrait rechercher par user', async () => {
      const mockAbonnements = [
        { id_abonnement: 1, id_util: 1 },
      ];

      mockRequest.query = { user: 'john' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAbonnements,
      });

      await abonnementsController.searchAbonnements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockAbonnements,
        })
      );
    });

    it('devrait rechercher par type', async () => {
      const mockAbonnements = [
        { id_abonnement: 1, id_type_abonnement: 1 },
      ];

      mockRequest.query = { type: 'Premium' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAbonnements,
      });

      await abonnementsController.searchAbonnements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
    });

    it('devrait rechercher par status', async () => {
      const mockAbonnements = [
        { id_abonnement: 1 },
      ];

      mockRequest.query = { status: 'actif' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAbonnements,
      });

      await abonnementsController.searchAbonnements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
    });
  });
});




