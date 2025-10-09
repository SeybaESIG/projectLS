import { Ville, Pays } from '../models/index.js';

describe('Import Villes - Tests d\'Intégration', () => {
  describe('🌍 Vérification des données importées', () => {
    it('devrait avoir importé au moins 2940 villes', async () => {
      const count = await Ville.count();
      expect(count).toBeGreaterThanOrEqual(2940);
    });

    it('devrait avoir la bonne structure de données en base', async () => {
      const ville = await Ville.findOne();

      expect(ville).toBeDefined();
      expect(ville).toHaveProperty('id_ville');
      expect(ville).toHaveProperty('nom_ville');
      expect(ville).toHaveProperty('id_pays');
      expect(ville).not.toHaveProperty('code_iata_ville');
    });

    it('ne devrait pas avoir de nom_ville vide', async () => {
      const villesWithEmptyName = await Ville.count({ 
        where: { nom_ville: '' } 
      });
      expect(villesWithEmptyName).toBe(0);
    });

    it('devrait avoir des villes liées à des pays valides', async () => {
      const ville = await Ville.findOne();
      expect(ville).toBeDefined();

      if (ville) {
        const pays = await Pays.findByPk(ville.get('id_pays'));
        expect(pays).toBeDefined();
        expect(pays?.get('nom_pays')).toBeTruthy();
      }
    });

    it('devrait avoir importé des villes courantes', async () => {
      const villesCourantes = ['Paris', 'London', 'Tokyo', 'Singapore', 'New York'];

      for (const nomVille of villesCourantes) {
        const villes = await Ville.findAll({ 
          where: { nom_ville: nomVille } 
        });
        
        // Certaines villes peuvent avoir plusieurs entrées (ex: Paris en France, Paris au Texas)
        expect(villes.length).toBeGreaterThan(0);
      }
    });

    it('ne devrait pas avoir de doublons (même nom_ville + même id_pays)', async () => {
      const allVilles = await Ville.findAll();
      const combinations = new Set<string>();

      for (const ville of allVilles) {
        const key = `${ville.get('nom_ville')}_${ville.get('id_pays')}`;
        expect(combinations.has(key)).toBe(false);
        combinations.add(key);
      }
    });

    it('devrait avoir des villes réparties sur plusieurs pays', async () => {
      const paysDistincts = await Ville.findAll({
        attributes: ['id_pays'],
        group: ['id_pays']
      });

      expect(paysDistincts.length).toBeGreaterThan(50);
    });
  });

  describe('🔍 Vérification de la qualité des données', () => {
    it('toutes les villes devraient avoir un id_pays valide', async () => {
      const villesWithInvalidPays = await Ville.count({ 
        where: { id_pays: [null, 0] } 
      });
      expect(villesWithInvalidPays).toBe(0);
    });

    it('devrait avoir des villes avec des noms variés', async () => {
      const villes = await Ville.findAll({ limit: 100 });
      const noms = villes.map(v => v.get('nom_ville'));
      const uniqueNoms = new Set(noms);

      // Au moins 80% de noms uniques dans les 100 premiers
      expect(uniqueNoms.size).toBeGreaterThan(80);
    });
  });
});

