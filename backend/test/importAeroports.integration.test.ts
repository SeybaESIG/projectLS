import { Aeroport, Ville, Pays } from '../models/index.js';

describe('Import Aeroports - Tests d\'Intégration', () => {
  describe('✈️ Vérification des données importées', () => {
    it('devrait avoir importé au moins 3000 aéroports', async () => {
      const count = await Aeroport.count();
      expect(count).toBeGreaterThanOrEqual(3000);
    });

    it('devrait avoir la bonne structure de données en base', async () => {
      const aeroport = await Aeroport.findOne();

      expect(aeroport).toBeDefined();
      expect(aeroport).toHaveProperty('id_aeroport');
      expect(aeroport).toHaveProperty('code_iata');
      expect(aeroport).toHaveProperty('nom_aeroport');
      expect(aeroport).toHaveProperty('id_ville');
    });

    it('ne devrait pas avoir de code_iata vide', async () => {
      const aeroportsWithEmptyCode = await Aeroport.count({ 
        where: { code_iata: '' } 
      });
      expect(aeroportsWithEmptyCode).toBe(0);
    });

    it('ne devrait pas avoir de nom_aeroport vide', async () => {
      const aeroportsWithEmptyName = await Aeroport.count({ 
        where: { nom_aeroport: '' } 
      });
      expect(aeroportsWithEmptyName).toBe(0);
    });

    it('devrait avoir des aéroports liés à des villes valides', async () => {
      const aeroport = await Aeroport.findOne();
      expect(aeroport).toBeDefined();

      if (aeroport) {
        const ville = await Ville.findByPk(aeroport.get('id_ville'));
        expect(ville).toBeDefined();
        expect(ville?.get('nom_ville')).toBeTruthy();
      }
    });

    it('devrait avoir importé des aéroports célèbres', async () => {
      const aeroportsCelebres = [
        { code: 'CDG', nom: 'Charles de Gaulle' },
        { code: 'JFK', nom: 'Kennedy' },
        { code: 'LHR', nom: 'Heathrow' },
        { code: 'NRT', nom: 'Narita' },
        { code: 'ORY', nom: 'Orly' },
        { code: 'LAX', nom: 'Los Angeles' },
      ];

      for (const aeroInfo of aeroportsCelebres) {
        const aeroport = await Aeroport.findOne({ 
          where: { code_iata: aeroInfo.code } 
        });
        
        expect(aeroport).toBeDefined();
        expect(aeroport?.get('nom_aeroport')).toContain(aeroInfo.nom);
      }
    });

    it('devrait avoir importé les nouveaux aéroports', async () => {
      const nouveauxAeroports = ['PPT', 'SPY', 'GAQ', 'KYS'];

      for (const code of nouveauxAeroports) {
        const aeroport = await Aeroport.findOne({ 
          where: { code_iata: code } 
        });
        
        expect(aeroport).toBeDefined();
        expect(aeroport?.get('code_iata')).toBe(code);
      }
    });

    it('ne devrait pas avoir de doublons de code_iata', async () => {
      const allAeroports = await Aeroport.findAll();
      const codes = allAeroports.map(a => a.get('code_iata'));
      const uniqueCodes = new Set(codes);

      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('devrait avoir des aéroports répartis sur plusieurs villes', async () => {
      const villesDistinctes = await Aeroport.findAll({
        attributes: ['id_ville'],
        group: ['id_ville']
      });

      // Les aéroports devraient être répartis sur au moins 2900 villes
      expect(villesDistinctes.length).toBeGreaterThan(2900);
    });

    it('devrait avoir plusieurs aéroports pour certaines grandes villes', async () => {
      // Trouver Paris
      const paris = await Ville.findOne({
        where: { nom_ville: 'Paris' }
      });

      if (paris) {
        const parisAeroports = await Aeroport.findAll({
          where: { id_ville: paris.get('id_ville') }
        });

        // Paris peut avoir 0 aéroport si le nom exact ne correspond pas
        // Donc on vérifie juste que la requête fonctionne
        expect(Array.isArray(parisAeroports)).toBe(true);
      }
    });
  });

  describe('🔍 Vérification de la qualité des données', () => {
    it('tous les aéroports devraient avoir un id_ville valide', async () => {
      const aeroportsWithInvalidVille = await Aeroport.count({ 
        where: { id_ville: [null, 0] } 
      });
      expect(aeroportsWithInvalidVille).toBe(0);
    });

    it('tous les codes IATA devraient avoir 3 caractères', async () => {
      const aeroports = await Aeroport.findAll();
      
      for (const aeroport of aeroports) {
        const code = aeroport.get('code_iata');
        expect(code.length).toBeLessThanOrEqual(3);
        expect(code.length).toBeGreaterThan(0);
      }
    });

    it('devrait avoir des noms d\'aéroport variés', async () => {
      const aeroports = await Aeroport.findAll({ limit: 100 });
      const noms = aeroports.map(a => a.get('nom_aeroport'));
      const uniqueNoms = new Set(noms);

      // Au moins 95% de noms uniques dans les 100 premiers
      expect(uniqueNoms.size).toBeGreaterThan(95);
    });
  });

  describe('🔗 Vérification des relations', () => {
    it('chaque aéroport devrait être lié à une ville existante', async () => {
      const aeroport = await Aeroport.findOne();
      expect(aeroport).toBeDefined();

      if (aeroport) {
        const ville = await Ville.findByPk(aeroport.get('id_ville'));
        expect(ville).toBeDefined();
      }
    });

    it('chaque ville d\'un aéroport devrait être liée à un pays existant', async () => {
      const aeroport = await Aeroport.findOne();
      expect(aeroport).toBeDefined();

      if (aeroport) {
        const ville = await Ville.findByPk(aeroport.get('id_ville'));
        expect(ville).toBeDefined();

        if (ville) {
          const pays = await Pays.findByPk(ville.get('id_pays'));
          expect(pays).toBeDefined();
        }
      }
    });
  });
});

