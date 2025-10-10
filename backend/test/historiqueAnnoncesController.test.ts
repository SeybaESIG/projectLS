import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindAndCountAll = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  HistoriqueAnnonce: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findAndCountAll: mockFindAndCountAll,
  },
  Annonce: {},
  Utilisateur: {},
}));

const historiqueAnnoncesController = await import('../controllers/historiqueAnnoncesController.js');

describe('Historique Annonces Controller - Unit Tests', () => {
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
      query: {},
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('getAllHistoriqueAnnonces', () => {
    it('devrait retourner tous les historiques avec pagination', async () => {
      const mockHistoriques = [
        { id_histo_annon: 1, id_annon: 1, action_histo: 'insert', prix: '100.00' },
        { id_histo_annon: 2, id_annon: 1, action_histo: 'update', prix: '150.00' },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 10,
        rows: mockHistoriques,
      });

      await historiqueAnnoncesController.getAllHistoriqueAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: mockHistoriques,
        pagination: {
          total: 10,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('devrait gérer la pagination avec page et limit', async () => {
      mockRequest.query = { page: '2', limit: '10' };
      mockFindAndCountAll.mockResolvedValue({ count: 100, rows: [] });

      await historiqueAnnoncesController.getAllHistoriqueAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10,
        })
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 2,
            limit: 10,
            totalPages: 10,
          }),
        })
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockFindAndCountAll.mockRejectedValue(error);

      await historiqueAnnoncesController.getAllHistoriqueAnnonces(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getHistoriqueAnnonceById', () => {
    it('devrait retourner un historique par son ID', async () => {
      const mockHistorique = {
        id_histo_annon: 1,
        id_annon: 1,
        action_histo: 'update',
        prix: '150.00',
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockHistorique);

      await historiqueAnnoncesController.getHistoriqueAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(mockJson).toHaveBeenCalledWith(mockHistorique);
    });

    it('devrait retourner 404 si historique non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await historiqueAnnoncesController.getHistoriqueAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Historique d\'annonce introuvable',
      });
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockFindByPk.mockRejectedValue(error);

      await historiqueAnnoncesController.getHistoriqueAnnonceById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getHistoriqueByAnnonce', () => {
    it('devrait retourner l\'historique d\'une annonce', async () => {
      const mockHistoriques = [
        { id_histo_annon: 1, id_annon: 5, action_histo: 'insert', prix: '100.00' },
        { id_histo_annon: 2, id_annon: 5, action_histo: 'update', prix: '150.00' },
        { id_histo_annon: 3, id_annon: 5, action_histo: 'delete', prix: '150.00' },
      ];

      mockRequest.params = { id_annon: '5' };
      mockFindAll.mockResolvedValue(mockHistoriques);

      await historiqueAnnoncesController.getHistoriqueByAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_annon: 5 },
          order: [['id_histo_annon', 'DESC']],
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockHistoriques);
    });

    it('devrait retourner un tableau vide si aucun historique', async () => {
      mockRequest.params = { id_annon: '999' };
      mockFindAll.mockResolvedValue([]);

      await historiqueAnnoncesController.getHistoriqueByAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id_annon: '5' };
      mockFindAll.mockRejectedValue(error);

      await historiqueAnnoncesController.getHistoriqueByAnnonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('searchHistorique', () => {
    it('devrait rechercher par id_annon', async () => {
      const mockHistoriques = [
        { id_histo_annon: 1, id_annon: 5, action_histo: 'insert' },
      ];

      mockRequest.query = { id_annon: '5' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoriques,
      });

      await historiqueAnnoncesController.searchHistorique(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockHistoriques,
        })
      );
    });

    it('devrait rechercher par action_histo', async () => {
      const mockHistoriques = [
        { id_histo_annon: 2, action_histo: 'update' },
      ];

      mockRequest.query = { action_histo: 'update' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoriques,
      });

      await historiqueAnnoncesController.searchHistorique(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockHistoriques,
        })
      );
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const mockHistoriques = [
        { id_histo_annon: 1, prix: '100.00' },
      ];

      mockRequest.query = { prix_min: '50', prix_max: '150' };
      mockFindAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockHistoriques,
      });

      await historiqueAnnoncesController.searchHistorique(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockHistoriques,
        })
      );
    });

    it('devrait gérer les erreurs de recherche', async () => {
      const error = new Error('Search failed');
      mockRequest.query = { id_annon: '5' };
      mockFindAndCountAll.mockRejectedValue(error);

      await historiqueAnnoncesController.searchHistorique(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});


