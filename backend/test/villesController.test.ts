import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Ville: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
  },
}));

const villesController = await import('../controllers/villesController.js');

describe('Villes Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('getAllVilles', () => {
    it('devrait retourner toutes les villes', async () => {
      const mockVilles = [
        { id_ville: 1, nom_ville: 'Paris', id_pays: 1 },
        { id_ville: 2, nom_ville: 'Lyon', id_pays: 1 },
      ];

      mockFindAll.mockResolvedValue(mockVilles);

      await villesController.getAllVilles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockVilles);
    });

    it('devrait retourner un tableau vide si aucune ville', async () => {
      mockFindAll.mockResolvedValue([]);

      await villesController.getAllVilles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await villesController.getAllVilles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getVilleById', () => {
    it('devrait retourner une ville par son ID', async () => {
      const mockVille = { id_ville: 1, nom_ville: 'Paris', id_pays: 1 };
      mockRequest.params = { id: '1' };

      mockFindByPk.mockResolvedValue(mockVille);

      await villesController.getVilleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockVille);
    });

    it('devrait retourner 404 si la ville n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await villesController.getVilleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Ville non trouvée' });
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockFindByPk.mockRejectedValue(error);

      await villesController.getVilleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});


