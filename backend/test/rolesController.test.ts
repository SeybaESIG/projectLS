import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { Op } from 'sequelize';

// Create mock functions
const mockFindAll = jest.fn();
const mockFindByPk = jest.fn();
const mockCreate = jest.fn();
const mockFindOne = jest.fn();

// Mock the models BEFORE importing
jest.unstable_mockModule('../models/index.js', () => ({
  Role: {
    findAll: mockFindAll,
    findByPk: mockFindByPk,
    create: mockCreate,
    findOne: mockFindOne,
  },
}));

// Now import the controller
const rolesController = await import('../controllers/rolesController.js');

describe('Roles Controller - Unit Tests', () => {
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

  describe('getAllRoles', () => {
    it('devrait retourner tous les rôles', async () => {
      const mockRoles = [
        { id_role: 1, nom_role: 'Admin' },
        { id_role: 2, nom_role: 'User' },
      ];

      mockFindAll.mockResolvedValue(mockRoles);

      await rolesController.getAllRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockRoles);
    });

    it('devrait retourner un tableau vide si aucun rôle', async () => {
      mockFindAll.mockResolvedValue([]);

      await rolesController.getAllRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await rolesController.getAllRoles(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getRoleById', () => {
    it('devrait retourner un rôle par son ID', async () => {
      const mockRole = { id_role: 1, nom_role: 'Admin' };
      mockRequest.params = { id: '1' };

      mockFindByPk.mockResolvedValue(mockRole);

      await rolesController.getRoleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockJson).toHaveBeenCalledWith(mockRole);
    });

    it('devrait retourner 404 si le rôle n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await rolesController.getRoleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Rôle introuvable' });
    });

    it('devrait gérer les erreurs', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockFindByPk.mockRejectedValue(error);

      await rolesController.getRoleById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createRole', () => {
    it('devrait créer un nouveau rôle', async () => {
      const newRoleData = { nom_role: 'Moderator' };
      const createdRole = { id_role: 3, ...newRoleData };
      
      mockRequest.body = newRoleData;
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(createdRole);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindOne).toHaveBeenCalledWith({ where: { nom_role: 'Moderator' } });
      expect(mockCreate).toHaveBeenCalledWith(newRoleData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdRole);
    });

    it('devrait retourner 409 si le rôle existe déjà', async () => {
      const existingRole = { id_role: 1, nom_role: 'Admin' };
      mockRequest.body = { nom_role: 'Admin' };

      mockFindOne.mockResolvedValue(existingRole);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Le nom du rôle existe déjà' });
    });

    it('devrait créer un rôle avec description', async () => {
      const newRoleData = { nom_role: 'Manager', description_role: 'Manage users' };
      const createdRole = { id_role: 4, ...newRoleData };
      
      mockRequest.body = newRoleData;
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(createdRole);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreate).toHaveBeenCalledWith(newRoleData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdRole);
    });

    it('devrait gérer les erreurs de création', async () => {
      mockRequest.body = { nom_role: 'NewRole' };
      const error = new Error('Database error');
      
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockRejectedValue(error);

      await rolesController.createRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateRole', () => {
    it('devrait mettre à jour un rôle existant', async () => {
      const mockRole = {
        id_role: 1,
        nom_role: 'OldName',
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nom_role: 'NewName' };

      mockFindByPk.mockResolvedValue(mockRole);
      mockFindOne.mockResolvedValue(null);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockFindOne).toHaveBeenCalled();
      expect(mockRole.update).toHaveBeenCalledWith({ nom_role: 'NewName' });
      expect(mockJson).toHaveBeenCalledWith(mockRole);
    });

    it('devrait retourner 404 si le rôle n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { nom_role: 'NewName' };

      mockFindByPk.mockResolvedValue(null);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Rôle introuvable' });
    });

    it('devrait retourner 409 si le nouveau nom existe déjà', async () => {
      const mockRole = {
        id_role: 1,
        nom_role: 'OldName',
        update: jest.fn(),
      };
      const existingRole = { id_role: 2, nom_role: 'ExistingName' };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nom_role: 'ExistingName' };

      mockFindByPk.mockResolvedValue(mockRole);
      mockFindOne.mockResolvedValue(existingRole);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRole.update).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Rôle déjà existant' });
    });

    it('devrait permettre de mettre à jour avec le même nom', async () => {
      const mockRole = {
        id_role: 1,
        nom_role: 'Admin',
        update: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nom_role: 'Admin', description_role: 'Updated description' };

      mockFindByPk.mockResolvedValue(mockRole);
      mockFindOne.mockResolvedValue(null);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRole.update).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockRole);
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      const error = new Error('Database error');
      const mockRole = {
        id_role: 1,
        nom_role: 'OldName',
        update: jest.fn().mockRejectedValue(error),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = { nom_role: 'NewName' };

      mockFindByPk.mockResolvedValue(mockRole);
      mockFindOne.mockResolvedValue(null);

      await rolesController.updateRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteRole', () => {
    it('devrait supprimer un rôle existant', async () => {
      const mockSend = jest.fn();
      mockResponse.send = mockSend;
      
      const mockRole = {
        id_role: 1,
        nom_role: 'ToDelete',
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockRole);

      await rolesController.deleteRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockFindByPk).toHaveBeenCalledWith('1');
      expect(mockRole.destroy).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('devrait retourner 404 si le rôle n\'existe pas', async () => {
      mockRequest.params = { id: '999' };
      mockFindByPk.mockResolvedValue(null);

      await rolesController.deleteRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Rôle introuvable' });
    });

    it('devrait gérer les erreurs de suppression', async () => {
      const error = new Error('Database error');
      const mockRole = {
        id_role: 1,
        nom_role: 'ToDelete',
        destroy: jest.fn().mockRejectedValue(error),
      };

      mockRequest.params = { id: '1' };
      mockFindByPk.mockResolvedValue(mockRole);

      await rolesController.deleteRole(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
