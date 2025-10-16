import { historiqueAnnonceSchemas } from '../schemas/historiqueAnnonceSchemas.js';

describe('Historique Annonce Schemas Validation', () => {
  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = historiqueAnnonceSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = historiqueAnnonceSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID à zéro', () => {
      const params = { id: 0 };
      const { error } = historiqueAnnonceSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Annonce Params Schema', () => {
    it('devrait valider un id_annon numérique', () => {
      const params = { id_annon: 456 };
      const { error } = historiqueAnnonceSchemas.annonceParams.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un id_annon négatif', () => {
      const params = { id_annon: -1 };
      const { error } = historiqueAnnonceSchemas.annonceParams.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un id_annon à zéro', () => {
      const params = { id_annon: 0 };
      const { error } = historiqueAnnonceSchemas.annonceParams.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    describe('Filtres valides', () => {
      it('devrait accepter id_annon', () => {
        const query = { id_annon: 1 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "insert"', () => {
        const query = { action_histo: 'insert' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "update"', () => {
        const query = { action_histo: 'update' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "delete"', () => {
        const query = { action_histo: 'delete' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter action_histo invalide', () => {
        const query = { action_histo: 'invalid' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/insert|update|delete/i);
      });

      it('devrait accepter statut "active"', () => {
        const query = { statut: 'active' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter statut "vendue"', () => {
        const query = { statut: 'vendue' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter statut invalide', () => {
        const query = { statut: 'completed' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait accepter une fourchette de prix', () => {
        const query = { prix_min: 50, prix_max: 200 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter prix_min > prix_max', () => {
        const query = { prix_min: 200, prix_max: 50 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/prix minimum.*inférieur/i);
      });

      it('devrait accepter une plage de dates', () => {
        const query = {
          dateFrom: new Date('2025-01-01'),
          dateTo: new Date('2025-12-31')
        };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter dateFrom > dateTo', () => {
        const query = {
          dateFrom: new Date('2025-12-31'),
          dateTo: new Date('2025-01-01')
        };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date de début.*antérieure/i);
      });
    });

    describe('Pagination', () => {
      it('devrait accepter des paramètres de pagination valides', () => {
        const query = { page: 1, limit: 20 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser page=1 par défaut', () => {
        const query = {};
        const { value } = historiqueAnnonceSchemas.query.validate(query);
        expect(value.page).toBe(1);
      });

      it('devrait utiliser limit=50 par défaut', () => {
        const query = {};
        const { value } = historiqueAnnonceSchemas.query.validate(query);
        expect(value.limit).toBe(50);
      });

      it('devrait rejeter page < 1', () => {
        const query = { page: 0 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait rejeter limit > 100', () => {
        const query = { limit: 101 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait rejeter limit < 1', () => {
        const query = { limit: 0 };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });
    });

    describe('Tri', () => {
      it('devrait accepter sortBy valides', () => {
        const validSortFields = ['id_histo_annon', 'prix', 'datedepart', 'datearrivee', 'datepublication'];
        
        validSortFields.forEach(field => {
          const query = { sortBy: field };
          const { error } = historiqueAnnonceSchemas.query.validate(query);
          expect(error).toBeUndefined();
        });
      });

      it('devrait utiliser "id_histo_annon" comme sortBy par défaut', () => {
        const query = {};
        const { value } = historiqueAnnonceSchemas.query.validate(query);
        expect(value.sortBy).toBe('id_histo_annon');
      });

      it('devrait rejeter sortBy invalide', () => {
        const query = { sortBy: 'invalid_field' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait accepter sort "asc"', () => {
        const query = { sort: 'asc' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter sort "desc"', () => {
        const query = { sort: 'desc' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser "desc" comme sort par défaut', () => {
        const query = {};
        const { value } = historiqueAnnonceSchemas.query.validate(query);
        expect(value.sort).toBe('desc');
      });

      it('devrait rejeter sort invalide', () => {
        const query = { sort: 'invalid' };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeDefined();
      });
    });

    describe('Filtres combinés', () => {
      it('devrait accepter plusieurs filtres simultanés', () => {
        const query = {
          id_annon: 1,
          action_histo: 'update',
          statut: 'active',
          prix_min: 50,
          prix_max: 200,
          dateFrom: new Date('2025-01-01'),
          dateTo: new Date('2025-12-31'),
          page: 1,
          limit: 20,
          sortBy: 'prix',
          sort: 'asc'
        };
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une query vide', () => {
        const query = {};
        const { error } = historiqueAnnonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });
  });
});




