import { typeAbonnementSchemas } from '../schemas/typeAbonnementSchemas.js';

describe('Type Abonnement Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid data', () => {
      it('devrait valider un type d\'abonnement complet', () => {
        const validType = {
          nom_type: 'Premium',
          prix: 29.99,
          duree_mois: 12,
          description: 'Abonnement premium avec tous les avantages'
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une description nulle', () => {
        const validType = {
          nom_type: 'Basique',
          prix: 9.99,
          duree_mois: 1,
          description: null
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une description vide', () => {
        const validType = {
          nom_type: 'Basique',
          prix: 9.99,
          duree_mois: 1,
          description: ''
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un type sans description', () => {
        const validType = {
          nom_type: 'Standard',
          prix: 19.99,
          duree_mois: 6
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });
    });

    describe('Nom_type validation', () => {
      it('devrait rejeter nom_type trop court', () => {
        const invalidType = {
          nom_type: 'AB',
          prix: 9.99,
          duree_mois: 1
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/3 caractères/i);
      });

      it('devrait rejeter nom_type trop long', () => {
        const invalidType = {
          nom_type: 'A'.repeat(101),
          prix: 9.99,
          duree_mois: 1
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/100 caractères/i);
      });

      it('devrait rejeter nom_type manquant', () => {
        const invalidType = {
          prix: 9.99,
          duree_mois: 1
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/nom.*type.*requis|nom_type/i);
      });

      it('devrait trim les espaces du nom_type', () => {
        const validType = {
          nom_type: '  Premium  ',
          prix: 9.99,
          duree_mois: 1
        };
        const { value, error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
        expect(value.nom_type).toBe('Premium');
      });
    });

    describe('Prix validation', () => {
      it('devrait accepter un prix positif', () => {
        const validType = {
          nom_type: 'Premium',
          prix: 29.99,
          duree_mois: 12
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un prix négatif', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: -10,
          duree_mois: 12
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/positif/i);
      });

      it('devrait rejeter un prix à zéro', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: 0,
          duree_mois: 12
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/positif/i);
      });

      it('devrait rejeter prix manquant', () => {
        const invalidType = {
          nom_type: 'Premium',
          duree_mois: 12
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/prix/i);
      });
    });

    describe('Duree_mois validation', () => {
      it('devrait accepter 1 mois minimum', () => {
        const validType = {
          nom_type: 'Premium',
          prix: 9.99,
          duree_mois: 1
        };
        const { error } = typeAbonnementSchemas.create.validate(validType);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter durée à zéro', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: 9.99,
          duree_mois: 0
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/1 mois/i);
      });

      it('devrait rejeter durée négative', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: 9.99,
          duree_mois: -5
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
      });

      it('devrait rejeter durée manquante', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: 9.99
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/durée/i);
      });

      it('devrait rejeter durée décimale', () => {
        const invalidType = {
          nom_type: 'Premium',
          prix: 9.99,
          duree_mois: 1.5
        };
        const { error } = typeAbonnementSchemas.create.validate(invalidType);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/entier/i);
      });
    });
  });

  describe('Update Schema', () => {
    it('devrait accepter une mise à jour partielle', () => {
      const update = { prix: 39.99 };
      const { error } = typeAbonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter plusieurs champs', () => {
      const update = {
        nom_type: 'Premium Plus',
        prix: 49.99,
        duree_mois: 24,
        description: 'Nouvelle description'
      };
      const { error } = typeAbonnementSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const update = {};
      const { error } = typeAbonnementSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/au moins un champ/i);
    });

    it('devrait rejeter prix négatif', () => {
      const update = { prix: -10 };
      const { error } = typeAbonnementSchemas.update.validate(update);
      expect(error).toBeDefined();
    });

    it('devrait rejeter duree_mois invalide', () => {
      const update = { duree_mois: 0 };
      const { error } = typeAbonnementSchemas.update.validate(update);
      expect(error).toBeDefined();
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = typeAbonnementSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = typeAbonnementSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID à zéro', () => {
      const params = { id: 0 };
      const { error } = typeAbonnementSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    it('devrait accepter une recherche par nom_type', () => {
      const query = { nom_type: 'Premium' };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une fourchette de prix', () => {
      const query = { prix_min: 10, prix_max: 50 };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter prix_min > prix_max', () => {
      const query = { prix_min: 50, prix_max: 10 };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/prix minimum.*inférieur/i);
    });

    it('devrait accepter une fourchette de durée', () => {
      const query = { duree_min: 1, duree_max: 12 };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter duree_min > duree_max', () => {
      const query = { duree_min: 12, duree_max: 1 };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/durée minimum.*inférieure/i);
    });

    it('devrait accepter des paramètres de pagination', () => {
      const query = { page: 1, limit: 20 };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut', () => {
      const query = {};
      const { value } = typeAbonnementSchemas.query.validate(query);
      expect(value.page).toBe(1);
      expect(value.limit).toBe(50);
      expect(value.sortBy).toBe('id_type_abonnement');
      expect(value.sort).toBe('asc');
    });

    it('devrait accepter sortBy valides', () => {
      const validSortFields = ['id_type_abonnement', 'nom_type', 'prix', 'duree_mois'];
      
      validSortFields.forEach(field => {
        const query = { sortBy: field };
        const { error } = typeAbonnementSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });

    it('devrait rejeter sortBy invalide', () => {
      const query = { sortBy: 'invalid_field' };
      const { error } = typeAbonnementSchemas.query.validate(query);
      expect(error).toBeDefined();
    });
  });
});

