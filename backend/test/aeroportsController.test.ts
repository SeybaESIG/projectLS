import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Aeroport: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
  },
}));

const aeroportsController = await import('../controllers/aeroportsController.js');

describe('Aeroports Controller - Unit Tests', () => {
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

  describe('getAllAeroports', () => {
    it('devrait retourner tous les aéroports', async () => {
      const mockAeroports = [
        { id_aeroport: 1, code_iata: 'CDG', nom_aeroport: 'Charles de Gaulle', id_ville: 1 },
        { id_aeroport: 2, code_iata: 'ORY', nom_aeroport: 'Orly', id_ville: 1 },
      ];

      mockFindAll.mockResolvedValue(mockAeroports);

      await aeroportsController.getAllAeroports(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockAeroports);
    });

    it('devrait retourner un tableau vide si aucun aéroport', async () => {
      mockFindAll.mockResolvedValue([]);

      await aeroportsController.getAllAeroports(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await aeroportsController.getAllAeroports(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAeroportById', () => {
    it('devrait retourner un aéroport par son ID', async () => {
      const mockAeroport = { id_aeroport: 1, code_iata: 'CDG', nom_aeroport: 'Charles de Gaulle', id_ville: 1 };
      mockRequest.params = { id: '1' };

      mockFindByPk.mockResolvedValue(mockAeroport);

      await aeroportsController.getAeroportById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockAeroport);
    });

    it('devrait retourner 404 si l\'aéroport n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await aeroportsController.getAeroportById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Aéroport introuvable' });
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockFindByPk.mockRejectedValue(error);

      await aeroportsController.getAeroportById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});


