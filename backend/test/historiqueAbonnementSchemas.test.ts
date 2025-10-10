import { historiqueAbonnementSchemas } from '../schemas/historiqueAbonnementSchemas.js';

describe('Historique Abonnement Schemas Validation', () => {
  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = historiqueAbonnementSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = historiqueAbonnementSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID à zéro', () => {
      const params = { id: 0 };
      const { error } = historiqueAbonnementSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Type Params Schema', () => {
    it('devrait valider un id_type_abonnement numérique', () => {
      const params = { id_type_abonnement: 456 };
      const { error } = historiqueAbonnementSchemas.typeParams.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un id_type_abonnement négatif', () => {
      const params = { id_type_abonnement: -1 };
      const { error } = historiqueAbonnementSchemas.typeParams.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un id_type_abonnement à zéro', () => {
      const params = { id_type_abonnement: 0 };
      const { error } = historiqueAbonnementSchemas.typeParams.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    describe('Filtres valides', () => {
      it('devrait accepter id_type_abonnement', () => {
        const query = { id_type_abonnement: 1 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "insert"', () => {
        const query = { action_histo: 'insert' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "update"', () => {
        const query = { action_histo: 'update' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter action_histo "delete"', () => {
        const query = { action_histo: 'delete' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter action_histo invalide', () => {
        const query = { action_histo: 'invalid' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/insert|update|delete/i);
      });

      it('devrait accepter nom_type', () => {
        const query = { nom_type: 'Premium' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une fourchette de prix', () => {
        const query = { prix_min: 10, prix_max: 50 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter prix_min > prix_max', () => {
        const query = { prix_min: 50, prix_max: 10 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/prix minimum.*inférieur/i);
      });

      it('devrait accepter une fourchette de durée', () => {
        const query = { duree_min: 1, duree_max: 12 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter duree_min > duree_max', () => {
        const query = { duree_min: 12, duree_max: 1 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/durée minimum.*inférieure/i);
      });
    });

    describe('Pagination', () => {
      it('devrait accepter des paramètres de pagination', () => {
        const query = { page: 1, limit: 20 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser page=1 par défaut', () => {
        const query = {};
        const { value } = historiqueAbonnementSchemas.query.validate(query);
        expect(value.page).toBe(1);
      });

      it('devrait utiliser limit=50 par défaut', () => {
        const query = {};
        const { value } = historiqueAbonnementSchemas.query.validate(query);
        expect(value.limit).toBe(50);
      });

      it('devrait rejeter page < 1', () => {
        const query = { page: 0 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait rejeter limit > 100', () => {
        const query = { limit: 101 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait rejeter limit < 1', () => {
        const query = { limit: 0 };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });
    });

    describe('Tri', () => {
      it('devrait accepter sortBy valides', () => {
        const validSortFields = ['id_histo_abo', 'prix', 'duree_mois', 'nom_type'];
        
        validSortFields.forEach(field => {
          const query = { sortBy: field };
          const { error } = historiqueAbonnementSchemas.query.validate(query);
          expect(error).toBeUndefined();
        });
      });

      it('devrait utiliser "id_histo_abo" comme sortBy par défaut', () => {
        const query = {};
        const { value } = historiqueAbonnementSchemas.query.validate(query);
        expect(value.sortBy).toBe('id_histo_abo');
      });

      it('devrait rejeter sortBy invalide', () => {
        const query = { sortBy: 'invalid_field' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait accepter sort "asc"', () => {
        const query = { sort: 'asc' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter sort "desc"', () => {
        const query = { sort: 'desc' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser "desc" comme sort par défaut', () => {
        const query = {};
        const { value } = historiqueAbonnementSchemas.query.validate(query);
        expect(value.sort).toBe('desc');
      });

      it('devrait rejeter sort invalide', () => {
        const query = { sort: 'invalid' };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });
    });

    describe('Filtres combinés', () => {
      it('devrait accepter plusieurs filtres simultanés', () => {
        const query = {
          id_type_abonnement: 1,
          action_histo: 'update',
          nom_type: 'Premium',
          prix_min: 10,
          prix_max: 100,
          duree_min: 1,
          duree_max: 24,
          page: 1,
          limit: 20,
          sortBy: 'prix',
          sort: 'asc'
        };
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une query vide', () => {
        const query = {};
        const { error } = historiqueAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });
  });
});


