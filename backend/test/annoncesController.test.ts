import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Annonce: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    create: mockCreate,
  },
  Utilisateur: {},
}));

const annoncesController = await import('../controllers/annoncesController.js');

describe('Annonces Controller - Unit Tests', () => {
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

  describe('getAllAnnonces', () => {
    it('devrait retourner toutes les annonces', async () => {
      const mockAnnonces = [
        {
          id_annon: 1,
          titre: 'Paris - New York',
          prix: '150.00',
          statut: 'active',
        },
        {
          id_annon: 2,
          titre: 'Lyon - Tokyo',
          prix: '300.00',
          statut: 'vendue',
        },
      ];

      mockFindAll.mockResolvedValue(mockAnnonces);

      await annoncesController.getAllAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockAnnonces);
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await annoncesController.getAllAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAnnonceById', () => {
    it('devrait retourner une annonce par son ID', async () => {
      const mockAnnonce = {
        id_annon: 1,
        titre: 'Paris - New York',
        prix: '150.00',
        statut: 'active',
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockAnnonce);

      await annoncesController.getAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockAnnonce);
    });

    it('devrait retourner 404 si annonce non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await annoncesController.getAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Annonce non trouvée',
      });
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockFindByPk.mockRejectedValue(error);

      await annoncesController.getAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createAnnonce', () => {
    it('devrait créer une nouvelle annonce', async () => {
      const newAnnonceData = {
        id_util: 1,
        id_ville_dep: 1,
        id_aerodep: 1,
        id_ville_arr: 2,
        id_aeroarr: 2,
        titre: 'Paris - New York',
        description: 'Voyage avec 2 valises de 23kg chacune',
        prix: 150.50,
        datedepart: new Date('2025-12-01T10:00:00Z'),
        datearrivee: new Date('2025-12-01T18:00:00Z'),
        statut: 'active',
      };

      const mockCreatedAnnonce = { id_annon: 1, ...newAnnonceData };

      mockRequest.body = newAnnonceData;
      mockCreate.mockResolvedValue(mockCreatedAnnonce);

      await annoncesController.createAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockCreate).toHaveBeenCalledWith(newAnnonceData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockCreatedAnnonce);
    });

    it('devrait gérer les erreurs de création', async () => {
      const error = new Error('Creation failed');
      mockRequest.body = { titre: 'Test' };
      mockCreate.mockRejectedValue(error);

      await annoncesController.createAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAnnonce', () => {
    it('devrait mettre à jour une annonce existante', async () => {
      const mockAnnonce = {
        id_annon: 1,
        titre: 'Paris - New York',
        prix: '150.00',
        update: jest.fn().mockResolvedValue(undefined),
      };

      const updateData = { prix: 200, statut: 'vendue' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockFindByPk.mockResolvedValue(mockAnnonce);

      await annoncesController.updateAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockAnnonce.update).toHaveBeenCalledWith(updateData);
      expect(mockJson).toHaveBeenCalledWith(mockAnnonce);
    });

    it('devrait retourner 404 si annonce non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { prix: 200 };
      mockFindByPk.mockResolvedValue(null);

      await annoncesController.updateAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Annonce non trouvée',
      });
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      const error = new Error('Update failed');
      mockRequest.params = { id: '1' };
      mockRequest.body = { prix: 200 };
      mockFindByPk.mockRejectedValue(error);

      await annoncesController.updateAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteAnnonce', () => {
    it('devrait supprimer une annonce', async () => {
      const mockAnnonce = {
        id_annon: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockAnnonce);

      await annoncesController.deleteAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockAnnonce.destroy).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Annonce supprimée',
      });
    });

    it('devrait retourner 404 si annonce non trouvée', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await annoncesController.deleteAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Annonce non trouvée',
      });
    });

    it('devrait gérer les erreurs de suppression', async () => {
      const error = new Error('Delete failed');
      mockRequest.params = { id: '1' };
      mockFindByPk.mockRejectedValue(error);

      await annoncesController.deleteAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('searchAnnonces', () => {
    it('devrait rechercher des annonces par titre', async () => {
      const mockAnnonces = [
        { id_annon: 1, titre: 'Paris - New York', prix: '150.00' },
      ];

      mockRequest.query = { titre: 'Paris' };
      mockFindAll.mockResolvedValue(mockAnnonces);

      await annoncesController.searchAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockAnnonces);
    });

    it('devrait rechercher des annonces par statut', async () => {
      const mockAnnonces = [
        { id_annon: 1, titre: 'Paris - New York', statut: 'active' },
      ];

      mockRequest.query = { statut: 'active' };
      mockFindAll.mockResolvedValue(mockAnnonces);

      await annoncesController.searchAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockAnnonces);
    });

    it('devrait rechercher des annonces par fourchette de prix', async () => {
      const mockAnnonces = [
        { id_annon: 1, titre: 'Paris - New York', prix: '150.00' },
      ];

      mockRequest.query = { prix_min: '100', prix_max: '200' };
      mockFindAll.mockResolvedValue(mockAnnonces);

      await annoncesController.searchAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockAnnonces);
    });

    it('devrait retourner 400 si aucun paramètre de recherche', async () => {
      mockRequest.query = {};

      await annoncesController.searchAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: expect.stringContaining('Au moins un paramètre'),
      });
    });

    it('devrait gérer les erreurs de recherche', async () => {
      const error = new Error('Search failed');
      mockRequest.query = { titre: 'Paris' };
      mockFindAll.mockRejectedValue(error);

      await annoncesController.searchAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});


