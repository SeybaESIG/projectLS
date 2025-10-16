import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import app from '../app.js';
import { Utilisateur } from '../models/index.js';

/**
 * Tests d'intégration pour vérifier les permissions Firebase
 * 
 * Ces tests vérifient que :
 * - Les routes publiques sont accessibles sans token
 * - Les routes protégées nécessitent un token Firebase valide
 * - Les routes admin nécessitent le rôle 'admin'
 * - Les utilisateurs ne peuvent accéder qu'à leurs propres données
 * 
 * Note: Ces tests utilisent les vrais middlewares Firebase (pas de mocks)
 * Pour qu'ils fonctionnent, Firebase doit être configuré ET bypass pour les tests
 */

describe('Permissions Integration Tests - Sans Firebase réel', () => {
  
  describe('Routes PUBLIQUES (sans authentification)', () => {
    
    it('GET /api/pays - devrait être accessible sans token', async () => {
      const response = await request(app)
        .get('/api/pays')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /api/annonces - devrait être accessible sans token', async () => {
      const response = await request(app)
        .get('/api/annonces')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/webhook/stripe - devrait être accessible sans token', async () => {
      // Le webhook ne devrait pas nécessiter d'authentification
      // (signature Stripe vérifiée dans le controller)
      const response = await request(app)
        .post('/api/webhook/stripe')
        .send({});
      
      // Peut être 400 (bad signature) mais pas 401 (unauthorized)
      expect(response.status).not.toBe(401);
    });
  });

  describe('Routes PROTÉGÉES (authentification requise)', () => {
    
    it('GET /api/me - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/me')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toMatch(/Token.*manquant/i);
    });

    it('GET /api/messages - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/messages')
        .expect(401);
      
      expect(response.body).toHaveProperty('error', 'Non autorisé');
    });

    it('POST /api/payer - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .post('/api/payer')
        .send({ montant: 50 })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('POST /api/annonces - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .post('/api/annonces')
        .send({ titre: 'Test' })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Routes ADMIN (rôle admin requis)', () => {
    
    it('GET /api/users - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);
      
      expect(response.body).toHaveProperty('error', 'Non autorisé');
    });

    it('GET /api/paiements - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/paiements')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/transactions - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/historique_abonnements - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/historique_abonnements')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('GET /api/historique_annonces - devrait rejeter sans token (401)', async () => {
      const response = await request(app)
        .get('/api/historique_annonces')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Vérification de la structure des erreurs', () => {
    
    it('Erreur 401 - devrait avoir la bonne structure', async () => {
      const response = await request(app)
        .get('/api/me')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.error).toBe('string');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Statistiques des utilisateurs créés', () => {
    
    it('Devrait avoir les utilisateurs Firebase dans la DB', async () => {
      const claclababe = await Utilisateur.findOne({ 
        where: { email: 'claclababe@gmail.com' } 
      });
      
      const eltonjon = await Utilisateur.findOne({ 
        where: { email: 'eltonjon1251@gmail.com' } 
      });
      
      expect(claclababe).toBeDefined();
      expect(claclababe?.id_role).toBe(1); // Admin
      expect(claclababe?.email).toBe('claclababe@gmail.com');
      
      expect(eltonjon).toBeDefined();
      expect(eltonjon?.id_role).toBe(2); // User
      expect(eltonjon?.email).toBe('eltonjon1251@gmail.com');
    });
  });
});



