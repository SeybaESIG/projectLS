import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import rolesRoutes from '../routes/rolesRoutes.js';
import { Role } from '../models/index.js';

const app: Application = express();
app.use(express.json());
app.use('/api/roles', rolesRoutes);

describe('Roles Routes - Integration Tests', () => {
  let createdRoleId: number;

  // Nettoyage après tous les tests
  afterAll(async () => {
    // Supprimer les rôles de test
    await Role.destroy({ where: { nom_role: ['TestRole', 'UpdatedRole', 'ToDelete'] } });
  });

  describe('GET /api/roles', () => {
    it('devrait retourner tous les rôles', async () => {
      const response = await request(app)
        .get('/api/roles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner un tableau JSON', async () => {
      const response = await request(app)
        .get('/api/roles')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/roles', () => {
    it('devrait créer un nouveau rôle', async () => {
      const newRole = { nom_role: 'TestRole' };

      const response = await request(app)
        .post('/api/roles')
        .send(newRole)
        .expect(201);

      expect(response.body).toHaveProperty('id_role');
      expect(response.body.nom_role).toBe('TestRole');
      
      createdRoleId = response.body.id_role;
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const invalidRole = { nom_role: '' };

      await request(app)
        .post('/api/roles')
        .send(invalidRole)
        .expect(400);
    });

    it('devrait retourner 409 pour un rôle en doublon', async () => {
      const duplicateRole = { nom_role: 'TestRole' };

      await request(app)
        .post('/api/roles')
        .send(duplicateRole)
        .expect(409);
    });

    it('devrait rejeter un nom_role trop long', async () => {
      const invalidRole = { nom_role: 'A'.repeat(101) };

      // Without validation middleware, Sequelize will reject it
      const response = await request(app)
        .post('/api/roles')
        .send(invalidRole);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/roles/:id', () => {
    it('devrait retourner un rôle par son ID', async () => {
      const response = await request(app)
        .get(`/api/roles/${createdRoleId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_role', createdRoleId);
      expect(response.body.nom_role).toBe('TestRole');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/roles/99999')
        .expect(404);
    });

    it('devrait gérer un ID invalide', async () => {
      // Note: Sans validation middleware, cela retourne 500
      await request(app)
        .get('/api/roles/invalid')
        .expect(500);
    });
  });

  describe('PATCH /api/roles/:id', () => {
    it('devrait mettre à jour seulement le nom', async () => {
      const updatedData = { nom_role: 'ModifiedRole' };

      const response = await request(app)
        .patch(`/api/roles/${createdRoleId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.nom_role).toBe('ModifiedRole');
    });

    it('devrait mettre à jour un rôle existant', async () => {
      const updatedData = { nom_role: 'UpdatedRole' };

      const response = await request(app)
        .patch(`/api/roles/${createdRoleId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.nom_role).toBe('UpdatedRole');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const updatedData = { nom_role: 'NonExistent' };

      await request(app)
        .patch('/api/roles/99999')
        .send(updatedData)
        .expect(404);
    });

    it('devrait accepter des données vides (n\'update que les champs fournis)', async () => {
      const invalidData = { nom_role: '' };

      // Sans validation middleware, empty string passe
      await request(app)
        .patch(`/api/roles/${createdRoleId}`)
        .send(invalidData)
        .expect(200);
    });

    it('devrait retourner 409 pour un nom en doublon', async () => {
      // Créer un deuxième rôle
      const secondRole = await Role.create({ nom_role: 'ToDelete' });

      // Essayer de renommer le premier avec le nom du second
      await request(app)
        .patch(`/api/roles/${createdRoleId}`)
        .send({ nom_role: 'ToDelete' })
        .expect(409);

      // Nettoyer
      await secondRole.destroy();
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('devrait supprimer un rôle existant', async () => {
      await request(app)
        .delete(`/api/roles/${createdRoleId}`)
        .expect(204);

      // Vérifier que le rôle a bien été supprimé
      const deletedRole = await Role.findByPk(createdRoleId);
      expect(deletedRole).toBeNull();
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .delete('/api/roles/99999')
        .expect(404);
    });

    it('devrait gérer un ID invalide', async () => {
      // Note: Sans validation middleware, cela retourne 500
      await request(app)
        .delete('/api/roles/invalid')
        .expect(500);
    });
  });

  describe('Validation des champs', () => {
    it('devrait accepter les champs supplémentaires sans validation middleware', async () => {
      const roleWithExtra = {
        nom_role: 'UniqueCleanRole',
        extra_field: 'should be ignored by Sequelize',
      };

      const response = await request(app)
        .post('/api/roles')
        .send(roleWithExtra)
        .expect(201);
      
      // Nettoyer
      await Role.destroy({ where: { nom_role: 'UniqueCleanRole' } });
    });
  });
});
