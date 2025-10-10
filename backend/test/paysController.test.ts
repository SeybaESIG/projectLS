import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Pays: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
  },
}));

const paysController = await import('../controllers/paysController.js');

describe('Pays Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockNext = jest.fn();
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('getAllPays', () => {
    it('devrait retourner tous les pays', async () => {
      const mockPays = [
        { id_pays: 1, nom_pays: 'France', code_iso_pays: 'FR' },
        { id_pays: 2, nom_pays: 'United States', code_iso_pays: 'US' },
      ];

      mockFindAll.mockResolvedValue(mockPays);

      await paysController.getAllPays(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockPays);
    });

    it('devrait retourner un tableau vide si aucun pays', async () => {
      mockFindAll.mockResolvedValue([]);

      await paysController.getAllPays(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await paysController.getAllPays(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getPaysById', () => {
    it('devrait retourner un pays par son ID', async () => {
      const mockPays = { id_pays: 1, nom_pays: 'France', code_iso_pays: 'FR' };
      mockRequest.params = { id: '1' };

      mockFindByPk.mockResolvedValue(mockPays);

      await paysController.getPaysById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockPays);
    });

    it('devrait retourner 404 si le pays n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await paysController.getPaysById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('Pays non trouvé');
      expect(error.status).toBe(404);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockFindByPk.mockRejectedValue(error);

      await paysController.getPaysById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});





