import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import usersRoutes from '../routes/usersRoutes.js';
import { Utilisateur, Role, Ville } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { initAssociations } from '../models/associations.js';
import { Op } from 'sequelize';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Users Routes - Integration Tests', () => {
  let testUserId: number;
  let testVilleId: number;

  // Setup: Créer des données de test
  beforeAll(async () => {
    // Nettoyage avant de commencer (au cas où des tests précédents ont échoué)
    await Utilisateur.destroy({ 
      where: { 
        username: [
          'testuser1', 'testuser2', 'testuser_update', 'testuser_delete', 
          'testuser_search', 'test.user_2', 'testuser_unique', 'testuser_unique2',
          'uniqueuser123', 'uniqueuser456', 'charlie.brown'
        ]
      } 
    });
    
    // Récupérer une ville valide pour les tests
    const ville = await Ville.findOne();
    if (ville) {
      testVilleId = ville.get('id_ville') as number;
    }
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    // Supprimer tous les utilisateurs de test créés pendant les tests
    await Utilisateur.destroy({ 
      where: { 
        username: [
          'testuser1', 'testuser_update', 'testuser_delete', 'testuser_search',
          'test.user_2', 'testuser_unique', 'testuser_unique2',
          'uniqueuser123', 'uniqueuser456', 'charlie.brown',
          'duplicate_test_user', 'email_dup_test', 'tel_dup_test', 
          'different_username', 'different_username2'
        ]
      } 
    });
    
    // Supprimer également par pattern d'email pour les tests avec timestamps
    await Utilisateur.destroy({
      where: {
        email: {
          [Op.like]: '%@example.com'
        },
        username: {
          [Op.like]: 'testuser_%'
        }
      }
    });
  });

  describe('GET /api/users', () => {
    it('devrait retourner tous les utilisateurs avec pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('devrait retourner des utilisateurs avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      if (response.body.data.length > 0) {
        const firstUser = response.body.data[0];
        expect(firstUser).toHaveProperty('id_util');
        expect(firstUser).toHaveProperty('username');
        expect(firstUser).toHaveProperty('nom');
        expect(firstUser).toHaveProperty('prenom');
        expect(firstUser).toHaveProperty('email');
        expect(firstUser).not.toHaveProperty('mot_de_passe'); // Password should be hidden!
        expect(firstUser).toHaveProperty('Role');
        expect(firstUser).toHaveProperty('Ville');
      }
    });

    it('ne devrait JAMAIS exposer le mot de passe', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      response.body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('mot_de_passe');
      });
    });
  });

  describe('POST /api/users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const newUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser1',
        nom: 'Test',
        prenom: 'User',
        email: 'testuser1@example.com',
        tel: '+33601020304',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('id_util');
      expect(response.body.username).toBe('testuser1');
      expect(response.body).not.toHaveProperty('mot_de_passe'); // Password should be hidden!
      
      testUserId = response.body.id_util;
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      const invalidUser = {
        username: 'ab', // Trop court
      };

      await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);
    });

    it('devrait retourner 409 pour un username en doublon', async () => {
      const duplicateUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser1', // Déjà utilisé
        nom: 'Duplicate',
        prenom: 'User',
        email: 'different@example.com',
        tel: '+33602030405',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.message).toContain('utilisateur');
    });

    it('devrait retourner 409 pour un email en doublon', async () => {
      const duplicateUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser_unique',
        nom: 'Duplicate',
        prenom: 'User',
        email: 'testuser1@example.com', // Déjà utilisé
        tel: '+33603040506',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.message).toContain('email');
    });

    it('devrait retourner 409 pour un téléphone en doublon', async () => {
      const duplicateUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser_unique2',
        nom: 'Duplicate',
        prenom: 'User',
        email: 'unique@example.com',
        tel: '+33601020304', // Déjà utilisé
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.message).toContain('téléphone');
    });

    it('devrait accepter un username avec points et tirets', async () => {
      const userWithSpecialChars = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'test.user_2',
        nom: 'Test',
        prenom: 'User',
        email: 'test.user.2@example.com',
        tel: '+33604050607',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userWithSpecialChars)
        .expect(201);

      expect(response.body.username).toBe('test.user_2');
      
      // Nettoyer
      await Utilisateur.destroy({ where: { username: 'test.user_2' } });
    });
  });

  describe('GET /api/users/:id', () => {
    it('devrait retourner un utilisateur par son ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_util', testUserId);
      expect(response.body).toHaveProperty('username');
      expect(response.body).not.toHaveProperty('mot_de_passe');
      expect(response.body).toHaveProperty('Role');
      expect(response.body).toHaveProperty('Ville');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/users/999999')
        .expect(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const updates = {
        nom: 'UpdatedName',
        prenom: 'UpdatedFirstName',
      };

      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send(updates)
        .expect(200);

      expect(response.body.nom).toBe('UpdatedName');
      expect(response.body.prenom).toBe('UpdatedFirstName');
      expect(response.body).not.toHaveProperty('mot_de_passe');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .put('/api/users/999999')
        .send({ nom: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      // Créer un utilisateur à supprimer
      const userToDelete = await Utilisateur.create({
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser_delete',
        nom: 'ToDelete',
        prenom: 'User',
        email: 'delete@example.com',
        tel: '+33605060708',
        mot_de_passe: 'hashedPassword',
        adresse: 'Test',
      });

      const deleteId = userToDelete.get('id_util');

      await request(app)
        .delete(`/api/users/${deleteId}`)
        .expect(204);

      // Vérifier qu'il est supprimé
      const deleted = await Utilisateur.findByPk(deleteId);
      expect(deleted).toBeNull();
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .delete('/api/users/999999')
        .expect(404);
    });
  });

  describe('GET /api/users/role/:roleId', () => {
    it('devrait retourner les utilisateurs par rôle', async () => {
      const response = await request(app)
        .get('/api/users/role/2')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id_role', 2);
        expect(response.body[0]).not.toHaveProperty('mot_de_passe');
      }
    });
  });

  describe('GET /api/users/ville/:villeId', () => {
    it('devrait retourner les utilisateurs par ville', async () => {
      const response = await request(app)
        .get(`/api/users/ville/${testVilleId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id_ville', testVilleId);
        expect(response.body[0]).not.toHaveProperty('mot_de_passe');
      }
    });
  });

  describe('GET /api/users/search', () => {
    beforeAll(async () => {
      // Créer un utilisateur pour les tests de recherche
      await Utilisateur.create({
        id_ville: testVilleId,
        id_role: 2,
        username: 'testuser_search',
        nom: 'SearchTest',
        prenom: 'UserSearch',
        email: 'search@example.com',
        tel: '+33606070809',
        mot_de_passe: 'hashedPassword',
        adresse: 'Search Address',
      });
    });

    it('devrait chercher par username', async () => {
      const response = await request(app)
        .get('/api/users/search?username=testuser_search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].username).toBe('testuser_search');
      expect(response.body.data[0]).not.toHaveProperty('mot_de_passe');
    });

    it('devrait chercher par nom', async () => {
      const response = await request(app)
        .get('/api/users/search?nom=SearchTest')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].nom).toBe('SearchTest');
    });

    it('devrait chercher par prenom', async () => {
      const response = await request(app)
        .get('/api/users/search?prenom=UserSearch')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].prenom).toBe('UserSearch');
    });

    it('devrait chercher par email', async () => {
      const response = await request(app)
        .get('/api/users/search?email=search@example.com')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].email).toBe('search@example.com');
    });

    it('devrait chercher par téléphone', async () => {
      const response = await request(app)
        .get('/api/users/search?tel=%2B33606070809')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].tel).toBe('+33606070809');
    });

    it('devrait chercher par rôle', async () => {
      const response = await request(app)
        .get('/api/users/search?role=utilisateur')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].Role.nom_role).toContain('utilisateur');
      }
    });

    it('devrait supporter la recherche partielle insensible à la casse', async () => {
      const response = await request(app)
        .get('/api/users/search?nom=search')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].nom).toMatch(/search/i);
    });

    it('devrait combiner plusieurs critères de recherche', async () => {
      const response = await request(app)
        .get('/api/users/search?nom=SearchTest&prenom=UserSearch')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('devrait supporter la pagination dans la recherche', async () => {
      const response = await request(app)
        .get('/api/users/search?role=utilisateur&page=1&limit=1')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('devrait retourner 400 sans paramètres de recherche', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const response = await request(app)
        .get('/api/users/search?username=XXXYYYZZZ999')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Sécurité des mots de passe', () => {
    it('ne devrait jamais retourner le mot de passe dans GET', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      response.body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('mot_de_passe');
      });
    });

    it('ne devrait jamais retourner le mot de passe dans POST', async () => {
      const uniqueTimestamp = Date.now();
      const newUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: `testuser_pwd_${uniqueTimestamp}`,
        nom: 'Test',
        prenom: 'UserTwo',
        email: `testuserpwd${uniqueTimestamp}@example.com`,
        tel: `+3370${uniqueTimestamp.toString().slice(-8)}`,
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser);

      // Si échec, logger la réponse pour debugger
      if (response.status !== 201) {
        console.log('Error response:', response.body);
      }
      
      expect(response.status).toBe(201);
      expect(response.body).not.toHaveProperty('mot_de_passe');
      
      // Nettoyer
      await Utilisateur.destroy({ where: { username: newUser.username } });
    });

    it('ne devrait jamais retourner le mot de passe dans PUT', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .send({ nom: 'UpdatedAgain' })
        .expect(200);

      expect(response.body).not.toHaveProperty('mot_de_passe');
    });
  });

  describe('Validation des contraintes UNIQUE', () => {
    it('devrait empêcher deux utilisateurs avec le même username', async () => {
      // D'abord créer un utilisateur de référence
      const baseUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'duplicate_test_user',
        nom: 'Test',
        prenom: 'User',
        email: 'duplicatebase@example.com',
        tel: '+33607080910',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address Base',
      };
      
      await request(app).post('/api/users').send(baseUser);
      
      // Essayer de créer un autre avec le même username
      const response = await request(app)
        .post('/api/users')
        .send({
          ...baseUser,
          email: 'different@example.com',
          tel: '+33608091011',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/utilisateur|username/i);
      
      // Nettoyer
      await Utilisateur.destroy({ where: { username: 'duplicate_test_user' } });
    });

    it('devrait empêcher deux utilisateurs avec le même email', async () => {
      // D'abord créer un utilisateur de référence
      const baseUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'email_dup_test',
        nom: 'Test',
        prenom: 'User',
        email: 'duplicate_email@example.com',
        tel: '+33609101112',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address Email',
      };
      
      await request(app).post('/api/users').send(baseUser);
      
      // Essayer de créer un autre avec le même email
      const response = await request(app)
        .post('/api/users')
        .send({
          ...baseUser,
          username: 'different_username',
          tel: '+33610111213',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/email/i);
      
      // Nettoyer
      await Utilisateur.destroy({ where: { username: 'email_dup_test' } });
    });

    it('devrait empêcher deux utilisateurs avec le même téléphone', async () => {
      // D'abord créer un utilisateur de référence
      const baseUser = {
        id_ville: testVilleId,
        id_role: 2,
        username: 'tel_dup_test',
        nom: 'Test',
        prenom: 'User',
        email: 'duplicate_tel@example.com',
        tel: '+33611121314',
        mot_de_passe: 'SecurePass123!',
        adresse: 'Test Address Tel',
      };
      
      await request(app).post('/api/users').send(baseUser);
      
      // Essayer de créer un autre avec le même téléphone
      const response = await request(app)
        .post('/api/users')
        .send({
          ...baseUser,
          username: 'different_username2',
          email: 'different2@example.com',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/téléphone|tel/i);
      
      // Nettoyer
      await Utilisateur.destroy({ where: { username: 'tel_dup_test' } });
    });
  });
});

