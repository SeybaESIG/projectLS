import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  TypeAbonnement: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findAndCountAll: mockFindAndCountAll,
    create: mockCreate,
  },
}));

// Mock du service de cache pour bypasser Redis dans les tests
jest.unstable_mockModule('../services/cacheService.js', () => ({
  getTypesAbonnementCache: jest.fn((fetchFn: any) => fetchFn()),
}));

const typesAbosController = await import('../controllers/typesAbosController.js');

describe('Types Abos Controller - Unit Tests', () => {
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

  describe('getAllTypesAbonnement', () => {
    it('devrait retourner tous les types avec pagination', async () => {
      const mockTypes = [
        { id_type_abonnement: 1, nom_type: 'Basique', prix: '9.99', duree_mois: 1 },
        { id_type_abonnement: 2, nom_type: 'Premium', prix: '29.99', duree_mois: 12 },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 10,
        rows: mockTypes,
      });

      await typesAbosController.getAllTypesAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: mockTypes,
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

      await typesAbosController.getAllTypesAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTypeAbonnementById', () => {
    it('devrait retourner un type par son ID', async () => {
      const mockType = {
        id_type_abonnement: 1,
        nom_type: 'Premium',
        prix: '29.99',
        duree_mois: 12,
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockType);

      await typesAbosController.getTypeAbonnementById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockType);
    });

    it('devrait retourner 404 si type non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await typesAbosController.getTypeAbonnementById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Type d\'abonnement introuvable',
      });
    });
  });

  describe('createTypeAbonnement', () => {
    it('devrait créer un nouveau type', async () => {
      const newTypeData = {
        nom_type: 'VIP',
        prix: 99.99,
        duree_mois: 24,
        description: 'Abonnement VIP'
      };

      const mockCreatedType = { id_type_abonnement: 3, ...newTypeData };

      mockRequest.body = newTypeData;
      mockCreate.mockResolvedValue(mockCreatedType);

      await typesAbosController.createTypeAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreate).toHaveBeenCalledWith(newTypeData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockCreatedType);
    });
  });

  describe('updateTypeAbonnement', () => {
    it('devrait mettre à jour un type existant', async () => {
      const mockType = {
        id_type_abonnement: 1,
        nom_type: 'Premium',
        prix: '29.99',
        update: jest.fn().mockResolvedValue(undefined),
      };

      const updateData = { prix: 39.99 };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockFindByPk.mockResolvedValue(mockType);

      await typesAbosController.updateTypeAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockType.update).toHaveBeenCalledWith(updateData);
      expect(mockJson).toHaveBeenCalledWith(mockType);
    });

    it('devrait retourner 404 si type non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { prix: 39.99 };
      mockFindByPk.mockResolvedValue(null);

      await typesAbosController.updateTypeAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTypeAbonnement', () => {
    it('devrait supprimer un type', async () => {
      const mockType = {
        id_type_abonnement: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockType);

      await typesAbosController.deleteTypeAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockType.destroy).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Type d\'abonnement supprimé',
      });
    });
  });

  describe('searchTypesAbonnement', () => {
    it('devrait rechercher par nom_type', async () => {
      const mockTypes = [
        { id_type_abonnement: 1, nom_type: 'Premium', prix: '29.99' },
      ];

      mockRequest.query = { nom_type: 'Premium' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTypes,
      });

      await typesAbosController.searchTypesAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockTypes,
        })
      );
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const mockTypes = [
        { id_type_abonnement: 1, prix: '29.99' },
      ];

      mockRequest.query = { prix_min: '10', prix_max: '50' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockTypes,
      });

      await typesAbosController.searchTypesAbonnement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
    });
  });
});




