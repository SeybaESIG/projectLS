import { importPays } from '../scripts/importPays.js';
import { Pays } from '../models/index.js';

describe('Import Pays - Tests d\'Intégration', () => {
  // Ces tests utilisent la vraie API et la vraie base de données
  // Ils sont plus lents mais vérifient que tout fonctionne ensemble

  describe('🌍 Importation réelle', () => {
    it('devrait importer les pays depuis l\'API AirLabs', async () => {
      const result = await importPays();

      expect(result.success).toBe(true);
      expect(result.imported).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    }, 30000); // Timeout de 30 secondes

    it('devrait importer au moins 200 pays', async () => {
      const result = await importPays();

      expect(result.success).toBe(true);
      expect(result.imported).toBeGreaterThanOrEqual(200);
    }, 30000);

    it('ne devrait pas créer de doublons lors d\'imports successifs', async () => {
      // Premier import
      const firstResult = await importPays();
      expect(firstResult.success).toBe(true);
      
      const firstCount = await Pays.count();

      // Deuxième import (devrait ignorer tous les doublons)
      const secondResult = await importPays();
      const secondCount = await Pays.count();

      expect(secondResult.success).toBe(true);
      expect(secondCount).toBe(firstCount); // Pas de nouveaux pays
    }, 60000);
  });

  describe('🗄️ Vérification des données', () => {
    it('devrait avoir la bonne structure de données en base', async () => {
      const pays = await Pays.findOne();

      expect(pays).toBeDefined();
      expect(pays).toHaveProperty('id_pays');
      expect(pays).toHaveProperty('nom_pays');
      expect(pays).toHaveProperty('code_iso_pays');
    });

    it('devrait avoir importé les pays courants', async () => {
      const paysCourants = ['FR', 'US', 'CA', 'GB', 'DE'];

      for (const code of paysCourants) {
        const pays = await Pays.findOne({ where: { code_iso_pays: code } });
        expect(pays).toBeDefined();
        expect(pays?.get('nom_pays')).toBeTruthy();
      }
    });

    it('ne devrait pas avoir de code_iso_pays null', async () => {
      const paysWithNullCode = await Pays.findOne({ where: { code_iso_pays: null } });
      expect(paysWithNullCode).toBeNull();
    });

    it('ne devrait pas avoir de nom_pays null ou vide', async () => {
      const paysWithNullName = await Pays.findOne({ 
        where: { nom_pays: [null, ''] } 
      });
      expect(paysWithNullName).toBeNull();
    });
  });

  describe('🔄 Gestion des doublons', () => {
    it('devrait ignorer les doublons basés sur code_iso_pays', async () => {
      const firstCount = await Pays.count();
      
      // Essayer d'importer à nouveau
      const result = await importPays();
      const secondCount = await Pays.count();

      // Le nombre de pays ne devrait pas augmenter
      expect(secondCount).toBe(firstCount);
    }, 30000);

    it('ne devrait pas avoir de doublons de codes ISO en base', async () => {
      const allPays = await Pays.findAll();
      const codes = allPays.map(p => p.get('code_iso_pays'));
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });
  });

  describe('⚡ Performance', () => {
    it('devrait importer en moins de 20 secondes', async () => {
      const start = Date.now();
      await importPays();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(20000);
    }, 30000);

    it('ne devrait pas créer plus de 300 pays', async () => {
      const count = await Pays.count();
      expect(count).toBeLessThanOrEqual(300);
    });
  });
});
