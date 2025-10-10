import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDestroy = jest.fn();

jest.unstable_mockModule('../models/index.js', () => ({
  Utilisateur: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    findAndCountAll: mockFindAndCountAll,
    create: mockCreate,
    destroy: mockDestroy,
  },
  Role: {},
  Ville: {},
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashedPassword123'),
  },
}));

const usersController = await import('../controllers/usersControllers.js');

describe('Users Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockSend = jest.fn();
    mockNext = jest.fn();
    
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    mockResponse = {
      json: mockJson,
      status: mockStatus,
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('devrait retourner tous les utilisateurs avec pagination', async () => {
      const mockUsers = [
        { id_util: 1, username: 'user1', nom: 'Doe', prenom: 'John' },
        { id_util: 2, username: 'user2', nom: 'Smith', prenom: 'Jane' },
      ];

      mockFindAndCountAll.mockResolvedValue({
        count: 10,
        rows: mockUsers,
      });

      await usersController.listUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAndCountAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        data: mockUsers,
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

      await usersController.listUsers(mockRequest as Request, mockResponse as Response, mockNext);

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

    it('devrait limiter à 100 items par page maximum', async () => {
      mockRequest.query = { limit: '1000' };
      mockFindAndCountAll.mockResolvedValue({ count: 200, rows: [] });

      await usersController.listUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      );
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockFindAndCountAll.mockRejectedValue(error);

      await usersController.listUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const mockUser = { id_util: 1, username: 'user1', nom: 'Doe' };
      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockUser);

      await usersController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('devrait retourner 404 si utilisateur non trouvé', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await usersController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockFindByPk.mockRejectedValue(error);

      await usersController.getUserById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur', async () => {
      mockRequest.params = { id: '1' };
      const mockDestroyResult = 1;
      (mockDestroy as any).mockResolvedValue(mockDestroyResult);

      await usersController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockDestroy).toHaveBeenCalledWith({ where: { id_util: 1 } });
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('devrait retourner 404 si utilisateur non trouvé', async () => {
      mockRequest.params = { id: '999' };
      (mockDestroy as any).mockResolvedValue(0);

      await usersController.deleteUser(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    });
  });

  describe('getUsersByRole', () => {
    it('devrait retourner les utilisateurs par rôle', async () => {
      const mockUsers = [{ id_util: 1, id_role: 2, username: 'user1' }];
      mockRequest.params = { roleId: '2' };
      mockFindAll.mockResolvedValue(mockUsers);

      await usersController.getUsersByRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_role: 2 },
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUsersByVille', () => {
    it('devrait retourner les utilisateurs par ville', async () => {
      const mockUsers = [{ id_util: 1, id_ville: 100, username: 'user1' }];
      mockRequest.params = { villeId: '100' };
      mockFindAll.mockResolvedValue(mockUsers);

      await usersController.getUsersByVille(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_ville: 100 },
        })
      );
      expect(mockJson).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('searchUsers', () => {
    it('devrait chercher par username avec pagination', async () => {
      mockRequest.query = { username: 'alice', page: '1', limit: '10' };
      mockFindAndCountAll.mockResolvedValue({ count: 5, rows: [] });

      await usersController.searchUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            username: expect.any(Object),
          }),
          limit: 10,
          offset: 0,
        })
      );
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            total: 5,
            page: 1,
            limit: 10,
          }),
        })
      );
    });

    it('devrait retourner 400 sans paramètres de recherche', async () => {
      mockRequest.query = {};

      await usersController.searchUsers(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Au moins un paramètre'),
        })
      );
    });
  });
});




