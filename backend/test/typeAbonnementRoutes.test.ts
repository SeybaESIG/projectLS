import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import typesAbonnementRoutes from '../routes/typesAbonnementRoutes.js';
import { TypeAbonnement } from '../models/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import { Op } from 'sequelize';

const app: Application = express();
app.use(express.json());
app.use('/api/types_abonnement', typesAbonnementRoutes);

// Middleware d'erreur pour les tests
app.use(errorHandler);

describe('Types Abonnement Routes - Integration Tests', () => {
  let testTypeId: number;

  // Nettoyage avant et après les tests
  beforeAll(async () => {
    await TypeAbonnement.destroy({
      where: {
        nom_type: {
          [Op.like]: 'Test%'
        }
      }
    });
  });

  afterAll(async () => {
    await TypeAbonnement.destroy({
      where: {
        nom_type: {
          [Op.like]: 'Test%'
        }
      }
    });
  });

  describe('GET /api/types_abonnement', () => {
    it('devrait retourner tous les types avec pagination', async () => {
      const response = await request(app)
        .get('/api/types_abonnement')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('devrait respecter la pagination', async () => {
      const response = await request(app)
        .get('/api/types_abonnement?page=1&limit=2')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('POST /api/types_abonnement', () => {
    it('devrait créer un nouveau type d\'abonnement', async () => {
      const newType = {
        nom_type: 'Test Premium',
        prix: 29.99,
        duree_mois: 12,
        description: 'Type de test premium'
      };

      const response = await request(app)
        .post('/api/types_abonnement')
        .send(newType)
        .expect(201);

      expect(response.body).toHaveProperty('id_type_abonnement');
      expect(response.body.nom_type).toBe(newType.nom_type);
      expect(parseFloat(response.body.prix)).toBe(newType.prix);
      expect(response.body.duree_mois).toBe(newType.duree_mois);

      testTypeId = response.body.id_type_abonnement;
    });

    it('devrait créer un type sans description', async () => {
      const newType = {
        nom_type: 'Test Basique',
        prix: 9.99,
        duree_mois: 1
      };

      const response = await request(app)
        .post('/api/types_abonnement')
        .send(newType)
        .expect(201);

      expect(response.body).toHaveProperty('id_type_abonnement');
    });

    it('devrait rejeter un type avec prix négatif', async () => {
      const invalidType = {
        nom_type: 'Test Invalid',
        prix: -10,
        duree_mois: 1
      };

      await request(app)
        .post('/api/types_abonnement')
        .send(invalidType)
        .expect(400);
    });

    it('devrait rejeter un type avec durée à zéro', async () => {
      const invalidType = {
        nom_type: 'Test Invalid',
        prix: 10,
        duree_mois: 0
      };

      await request(app)
        .post('/api/types_abonnement')
        .send(invalidType)
        .expect(400);
    });

    it('devrait rejeter un nom_type trop court', async () => {
      const invalidType = {
        nom_type: 'AB',
        prix: 10,
        duree_mois: 1
      };

      await request(app)
        .post('/api/types_abonnement')
        .send(invalidType)
        .expect(400);
    });

    it('devrait rejeter un nom_type en double', async () => {
      const duplicateType = {
        nom_type: 'Test Premium', // Déjà créé
        prix: 39.99,
        duree_mois: 6
      };

      const response = await request(app)
        .post('/api/types_abonnement')
        .send(duplicateType)
        .expect(409);

      expect(response.body.message).toMatch(/existe déjà/i);
    });

    it('devrait rejeter si champs requis manquants', async () => {
      const invalidType = {
        nom_type: 'Test'
      };

      await request(app)
        .post('/api/types_abonnement')
        .send(invalidType)
        .expect(400);
    });
  });

  describe('GET /api/types_abonnement/:id', () => {
    it('devrait retourner un type par ID', async () => {
      if (!testTypeId) {
        return;
      }

      const response = await request(app)
        .get(`/api/types_abonnement/${testTypeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_type_abonnement', testTypeId);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/types_abonnement/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .get('/api/types_abonnement/invalid')
        .expect(400);
    });

    it('devrait rejeter un ID négatif', async () => {
      await request(app)
        .get('/api/types_abonnement/-1')
        .expect(400);
    });
  });

  describe('PATCH /api/types_abonnement/:id', () => {
    it('devrait mettre à jour un type existant', async () => {
      if (!testTypeId) {
        return;
      }

      const updateData = {
        prix: 39.99,
        description: 'Description mise à jour'
      };

      const response = await request(app)
        .patch(`/api/types_abonnement/${testTypeId}`)
        .send(updateData)
        .expect(200);

      expect(parseFloat(response.body.prix)).toBe(39.99);
      expect(response.body.description).toBe('Description mise à jour');
    });

    it('devrait rejeter une mise à jour vide', async () => {
      if (!testTypeId) {
        return;
      }

      await request(app)
        .patch(`/api/types_abonnement/${testTypeId}`)
        .send({})
        .expect(400);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const updateData = { prix: 49.99 };

      await request(app)
        .patch('/api/types_abonnement/999999')
        .send(updateData)
        .expect(404);
    });

    it('devrait rejeter un prix négatif', async () => {
      if (!testTypeId) {
        return;
      }

      const updateData = { prix: -10 };

      await request(app)
        .patch(`/api/types_abonnement/${testTypeId}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('GET /api/types_abonnement/search', () => {
    beforeAll(async () => {
      // Créer des types de test pour la recherche
      await TypeAbonnement.bulkCreate([
        { nom_type: 'Test Standard', prix: 19.99, duree_mois: 6 },
        { nom_type: 'Test VIP', prix: 99.99, duree_mois: 24 },
      ]);
    });

    afterAll(async () => {
      await TypeAbonnement.destroy({
        where: {
          nom_type: {
            [Op.in]: ['Test Standard', 'Test VIP']
          }
        }
      });
    });

    it('devrait rechercher par nom_type', async () => {
      const response = await request(app)
        .get('/api/types_abonnement/search?nom_type=Standard')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait rechercher par fourchette de prix', async () => {
      const response = await request(app)
        .get('/api/types_abonnement/search?prix_min=10&prix_max=50')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rechercher par fourchette de durée', async () => {
      const response = await request(app)
        .get('/api/types_abonnement/search?duree_min=6&duree_max=12')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('devrait rejeter prix_min > prix_max', async () => {
      await request(app)
        .get('/api/types_abonnement/search?prix_min=50&prix_max=10')
        .expect(400);
    });

    it('devrait rejeter duree_min > duree_max', async () => {
      await request(app)
        .get('/api/types_abonnement/search?duree_min=12&duree_max=6')
        .expect(400);
    });
  });

  describe('DELETE /api/types_abonnement/:id', () => {
    it('devrait supprimer un type existant', async () => {
      // Créer un type à supprimer
      const typeToDelete = await TypeAbonnement.create({
        nom_type: 'Test To Delete',
        prix: 15.99,
        duree_mois: 3
      });

      const typeId = typeToDelete.get('id_type_abonnement') as number;

      const response = await request(app)
        .delete(`/api/types_abonnement/${typeId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Type d\'abonnement supprimé');

      // Vérifier que le type n'existe plus
      await request(app)
        .get(`/api/types_abonnement/${typeId}`)
        .expect(404);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .delete('/api/types_abonnement/999999')
        .expect(404);
    });

    it('devrait rejeter un ID invalide', async () => {
      await request(app)
        .delete('/api/types_abonnement/invalid')
        .expect(400);
    });
  });

  describe('Contraintes de la base de données', () => {
    it('devrait être bloqué par la DB si prix négatif contourne Joi', async () => {
      const type = await TypeAbonnement.build({
        nom_type: 'Test Invalid Prix',
        prix: '-10',
        duree_mois: 1
      });

      await expect(type.save()).rejects.toThrow();
    });

    it('devrait être bloqué par la DB si duree_mois <= 0', async () => {
      const type = await TypeAbonnement.build({
        nom_type: 'Test Invalid Duree',
        prix: '10',
        duree_mois: 0
      });

      await expect(type.save()).rejects.toThrow();
    });
  });
});




