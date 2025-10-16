import { abonnementSchemas } from '../schemas/abonnementSchemas.js';

describe('Abonnement Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid data', () => {
      it('devrait valider un abonnement complet', () => {
        const validAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(validAbonnement);
        expect(error).toBeUndefined();
      });

      it('devrait accepter des dates ISO string', () => {
        const validAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: '2025-01-01T00:00:00Z',
          date_fin: '2025-12-31T23:59:59Z'
        };
        const { error } = abonnementSchemas.create.validate(validAbonnement);
        expect(error).toBeUndefined();
      });
    });

    describe('Dates validation', () => {
      it('devrait rejeter si date_fin <= date_debut', () => {
        const invalidAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-12-31'),
          date_fin: new Date('2025-01-01')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date de fin.*postérieure/i);
      });

      it('devrait rejeter si date_fin = date_debut', () => {
        const invalidAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-06-01'),
          date_fin: new Date('2025-06-01')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date de fin.*postérieure/i);
      });

      it('devrait accepter date_fin > date_debut', () => {
        const validAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-01-02')
        };
        const { error } = abonnementSchemas.create.validate(validAbonnement);
        expect(error).toBeUndefined();
      });
    });

    describe('Champs requis', () => {
      it('devrait rejeter si id_util manquant', () => {
        const invalidAbonnement = {
          id_type_abonnement: 1,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_util/i);
      });

      it('devrait rejeter si id_type_abonnement manquant', () => {
        const invalidAbonnement = {
          id_util: 1,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_type_abonnement/i);
      });

      it('devrait rejeter si date_debut manquante', () => {
        const invalidAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date.*début/i);
      });

      it('devrait rejeter si date_fin manquante', () => {
        const invalidAbonnement = {
          id_util: 1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-01-01')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date.*fin/i);
      });
    });

    describe('ID validation', () => {
      it('devrait rejeter id_util négatif', () => {
        const invalidAbonnement = {
          id_util: -1,
          id_type_abonnement: 1,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
      });

      it('devrait rejeter id_type_abonnement à zéro', () => {
        const invalidAbonnement = {
          id_util: 1,
          id_type_abonnement: 0,
          date_debut: new Date('2025-01-01'),
          date_fin: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.create.validate(invalidAbonnement);
        expect(error).toBeDefined();
      });
    });
  });

  describe('Update Schema', () => {
    it('devrait accepter une mise à jour partielle', () => {
      const update = { date_fin: new Date('2026-01-01') };
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter plusieurs champs', () => {
      const update = {
        id_type_abonnement: 2,
        date_debut: new Date('2025-06-01'),
        date_fin: new Date('2026-06-01')
      };
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const update = {};
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/au moins un champ/i);
    });

    it('devrait valider les dates si les deux sont fournies', () => {
      const update = {
        date_debut: new Date('2025-12-31'),
        date_fin: new Date('2025-01-01')
      };
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date de fin.*postérieure/i);
    });

    it('devrait accepter seulement date_debut', () => {
      const update = { date_debut: new Date('2025-06-01') };
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter seulement date_fin', () => {
      const update = { date_fin: new Date('2026-12-31') };
      const { error } = abonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = abonnementSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = abonnementSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('User Params Schema', () => {
    it('devrait valider un id_util numérique', () => {
      const params = { id_util: 456 };
      const { error } = abonnementSchemas.userParams.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un id_util négatif', () => {
      const params = { id_util: -1 };
      const { error } = abonnementSchemas.userParams.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    describe('Filtres valides', () => {
      it('devrait accepter user', () => {
        const query = { user: 'john' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter type', () => {
        const query = { type: 'Premium' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter status "actif"', () => {
        const query = { status: 'actif' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter status "active"', () => {
        const query = { status: 'active' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter status "expiré"', () => {
        const query = { status: 'expiré' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait accepter status "expire"', () => {
        const query = { status: 'expire' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter status invalide', () => {
        const query = { status: 'invalid' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/actif|expiré/i);
      });
    });

    describe('Plages de dates', () => {
      it('devrait accepter date_debut_min et date_debut_max', () => {
        const query = {
          date_debut_min: new Date('2025-01-01'),
          date_debut_max: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter date_debut_min > date_debut_max', () => {
        const query = {
          date_debut_min: new Date('2025-12-31'),
          date_debut_max: new Date('2025-01-01')
        };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date de début minimum/i);
      });

      it('devrait accepter date_fin_min et date_fin_max', () => {
        const query = {
          date_fin_min: new Date('2025-01-01'),
          date_fin_max: new Date('2025-12-31')
        };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter date_fin_min > date_fin_max', () => {
        const query = {
          date_fin_min: new Date('2025-12-31'),
          date_fin_max: new Date('2025-01-01')
        };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date de fin minimum/i);
      });
    });

    describe('Pagination', () => {
      it('devrait accepter des paramètres de pagination', () => {
        const query = { page: 1, limit: 20 };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser des valeurs par défaut', () => {
        const query = {};
        const { value } = abonnementSchemas.query.validate(query);
        expect(value.page).toBe(1);
        expect(value.limit).toBe(50);
        expect(value.sortBy).toBe('date_debut');
        expect(value.sort).toBe('desc');
      });

      it('devrait rejeter page < 1', () => {
        const query = { page: 0 };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait rejeter limit > 100', () => {
        const query = { limit: 101 };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });
    });

    describe('Tri', () => {
      it('devrait accepter sortBy valides', () => {
        const validSortFields = ['id_abonnement', 'date_debut', 'date_fin'];
        
        validSortFields.forEach(field => {
          const query = { sortBy: field };
          const { error } = abonnementSchemas.query.validate(query);
          expect(error).toBeUndefined();
        });
      });

      it('devrait rejeter sortBy invalide', () => {
        const query = { sortBy: 'invalid_field' };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeDefined();
      });

      it('devrait accepter sort "asc" et "desc"', () => {
        const queryAsc = { sort: 'asc' };
        const queryDesc = { sort: 'desc' };
        
        expect(abonnementSchemas.query.validate(queryAsc).error).toBeUndefined();
        expect(abonnementSchemas.query.validate(queryDesc).error).toBeUndefined();
      });
    });

    describe('Filtres combinés', () => {
      it('devrait accepter plusieurs filtres simultanés', () => {
        const query = {
          user: 'john',
          type: 'Premium',
          status: 'actif',
          date_debut_min: new Date('2025-01-01'),
          date_debut_max: new Date('2025-12-31'),
          page: 1,
          limit: 20
        };
        const { error } = abonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });
  });
});




