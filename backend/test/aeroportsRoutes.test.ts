import request from 'supertest';
import express from 'express';
import type { Application } from 'express';
import aeroportsRoutes from '../routes/aeroportsRoutes.js';
import { Aeroport } from '../models/index.js';
import { initAssociations } from '../models/associations.js';

// Initialiser les associations avant les tests
initAssociations();

const app: Application = express();
app.use(express.json());
app.use('/api/aeroports', aeroportsRoutes);

// Middleware d'erreur pour les tests
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Aeroports Routes - Integration Tests', () => {
  describe('GET /api/aeroports', () => {
    it('devrait retourner tous les aéroports', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('devrait retourner un tableau JSON', async () => {
      await request(app)
        .get('/api/aeroports')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('devrait retourner des aéroports avec la bonne structure', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const firstAeroport = response.body[0];
      expect(firstAeroport).toHaveProperty('id_aeroport');
      expect(firstAeroport).toHaveProperty('code_iata');
      expect(firstAeroport).toHaveProperty('nom_aeroport');
      expect(firstAeroport).toHaveProperty('id_ville');
    });

    it('devrait avoir au moins 3000 aéroports', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(3000);
    });
  });

  describe('GET /api/aeroports/:id', () => {
    it('devrait retourner un aéroport par son ID', async () => {
      // Récupérer le premier aéroport pour avoir un ID valide
      const allAeroports = await Aeroport.findAll({ limit: 1 });
      const aeroportId = allAeroports[0].get('id_aeroport');

      const response = await request(app)
        .get(`/api/aeroports/${aeroportId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id_aeroport', aeroportId);
      expect(response.body).toHaveProperty('code_iata');
      expect(response.body).toHaveProperty('nom_aeroport');
      expect(response.body).toHaveProperty('id_ville');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      await request(app)
        .get('/api/aeroports/99999')
        .expect(404);
    });

    it('devrait gérer un ID invalide', async () => {
      await request(app)
        .get('/api/aeroports/invalid')
        .expect(500);
    });
  });

  describe('Vérification des codes IATA célèbres', () => {
    it('devrait retourner CDG (Paris Charles de Gaulle)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const cdg = response.body.find((a: any) => a.code_iata === 'CDG');
      expect(cdg).toBeDefined();
      expect(cdg.nom_aeroport).toContain('Charles de Gaulle');
    });

    it('devrait retourner JFK (New York)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const jfk = response.body.find((a: any) => a.code_iata === 'JFK');
      expect(jfk).toBeDefined();
      expect(jfk.nom_aeroport).toContain('Kennedy');
    });

    it('devrait retourner LHR (London Heathrow)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const lhr = response.body.find((a: any) => a.code_iata === 'LHR');
      expect(lhr).toBeDefined();
      expect(lhr.nom_aeroport).toContain('Heathrow');
    });

    it('devrait retourner NRT (Tokyo Narita)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const nrt = response.body.find((a: any) => a.code_iata === 'NRT');
      expect(nrt).toBeDefined();
      expect(nrt.nom_aeroport).toContain('Narita');
    });
  });

  describe('Vérification des nouveaux aéroports', () => {
    it('devrait retourner PPT (Tahiti)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const ppt = response.body.find((a: any) => a.code_iata === 'PPT');
      expect(ppt).toBeDefined();
      expect(ppt.nom_aeroport).toContain('Tahiti');
    });

    it('devrait retourner SPY (San Pedro)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const spy = response.body.find((a: any) => a.code_iata === 'SPY');
      expect(spy).toBeDefined();
      expect(spy.nom_aeroport).toContain('San Pedro');
    });

    it('devrait retourner GAQ (Gao)', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const gaq = response.body.find((a: any) => a.code_iata === 'GAQ');
      expect(gaq).toBeDefined();
      expect(gaq.nom_aeroport).toContain('Gao');
    });
  });

  describe('Vérification de la qualité des données', () => {
    it('tous les aéroports devraient avoir un code IATA', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const aeroportsWithoutCode = response.body.filter((a: any) => !a.code_iata || a.code_iata.trim() === '');
      expect(aeroportsWithoutCode.length).toBe(0);
    });

    it('tous les codes IATA devraient être uniques', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const codes = response.body.map((a: any) => a.code_iata);
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('tous les aéroports devraient avoir un nom', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const aeroportsWithoutName = response.body.filter((a: any) => !a.nom_aeroport || a.nom_aeroport.trim() === '');
      expect(aeroportsWithoutName.length).toBe(0);
    });

    it('tous les aéroports devraient avoir une ville valide', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const aeroportsWithoutVille = response.body.filter((a: any) => !a.id_ville || a.id_ville <= 0);
      expect(aeroportsWithoutVille.length).toBe(0);
    });

    it('les codes IATA devraient avoir 3 caractères maximum', async () => {
      const response = await request(app)
        .get('/api/aeroports')
        .expect(200);

      const invalidCodes = response.body.filter((a: any) => a.code_iata.length > 3);
      // Tous les codes IATA devraient avoir 3 caractères
      expect(invalidCodes.length).toBe(0);
    });
  });

  describe('GET /api/aeroports/search', () => {
    it('devrait chercher des aéroports par nom', async () => {
      const response = await request(app)
        .get('/api/aeroports/search?name=Charles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('nom_aeroport');
      expect(response.body[0].nom_aeroport).toMatch(/Charles/i);
    });

    it('devrait chercher des aéroports par ville', async () => {
      const response = await request(app)
        .get('/api/aeroports/search?ville=Paris')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      // Vérifier que les résultats incluent les données de la ville
      if (response.body[0].tb_ville) {
        expect(response.body[0].tb_ville.nom_ville).toMatch(/Paris/i);
      }
    });

    it('devrait combiner nom et ville dans la recherche', async () => {
      const response = await request(app)
        .get('/api/aeroports/search?name=International&ville=Bamako')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('devrait retourner une erreur 400 sans paramètres', async () => {
      const response = await request(app)
        .get('/api/aeroports/search')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      const response = await request(app)
        .get('/api/aeroports/search?name=XXXYYYZZZ999')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
});


