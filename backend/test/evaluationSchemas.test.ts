import { evaluationSchemas } from '../schemas/evaluationSchemas.js';

describe('Evaluation Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid data', () => {
      it('devrait valider une évaluation complète', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.5,
          commentaire: 'Excellent acheteur, transaction rapide et agréable'
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une évaluation sans commentaire', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 5
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un commentaire vide', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 3.5,
          commentaire: ''
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un commentaire null', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4,
          commentaire: null
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });
    });

    describe('Note validation', () => {
      it('devrait accepter note = 0', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 0
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait accepter note = 5', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 5
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait accepter note avec 1 décimale', () => {
        const validNotes = [0.5, 1.2, 2.7, 3.9, 4.5];
        
        validNotes.forEach(note => {
          const evaluation = {
            id_util_donne: 1,
            id_util_recoit: 2,
            id_transa: 5,
            note
          };
          const { error } = evaluationSchemas.create.validate(evaluation);
          expect(error).toBeUndefined();
        });
      });

      it('devrait rejeter note < 0', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: -1
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/minimum 0/i);
      });

      it('devrait rejeter note > 5', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 5.1
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/maximum 5/i);
      });

      it('devrait rejeter note avec 2 décimales', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.25
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/1 décimale/i);
      });

      it('devrait rejeter si note manquante', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/note.*requis/i);
      });
    });

    describe('Commentaire validation', () => {
      it('devrait accepter un commentaire de 100 caractères', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.5,
          commentaire: 'a'.repeat(100)
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un commentaire trop long', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.5,
          commentaire: 'a'.repeat(101)
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/100 caractères/i);
      });
    });

    describe('Utilisateurs validation', () => {
      it('devrait rejeter si util_donne = util_recoit', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 1,
          id_transa: 5,
          note: 4.5
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/utilisateur.*évaluer.*même/i);
      });

      it('devrait accepter util_donne ≠ util_recoit', () => {
        const validEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.5
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        expect(error).toBeUndefined();
      });
    });

    describe('Champs requis', () => {
      it('devrait ACCEPTER si id_util_donne manquant (car forcé par le controller)', () => {
        const validEvaluation = {
          id_util_recoit: 2,
          id_transa: 5,
          note: 4.5
        };
        const { error } = evaluationSchemas.create.validate(validEvaluation);
        // id_util_donne est maintenant optionnel car le controller le force automatiquement
        expect(error).toBeUndefined();
      });

      it('devrait rejeter si id_util_recoit manquant', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_transa: 5,
          note: 4.5
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
      });

      it('devrait rejeter si id_transa manquant', () => {
        const invalidEvaluation = {
          id_util_donne: 1,
          id_util_recoit: 2,
          note: 4.5
        };
        const { error } = evaluationSchemas.create.validate(invalidEvaluation);
        expect(error).toBeDefined();
      });
    });
  });

  describe('Params Schema', () => {
    it('devrait valider les 3 IDs de la clé composite', () => {
      const params = {
        id_util_donne: 1,
        id_util_recoit: 2,
        id_transa: 5
      };
      const { error } = evaluationSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter si un ID est négatif', () => {
      const params = {
        id_util_donne: -1,
        id_util_recoit: 2,
        id_transa: 5
      };
      const { error } = evaluationSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    it('devrait accepter des filtres par note', () => {
      const query = { note_min: 4, note_max: 5 };
      const { error } = evaluationSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter note_min > note_max', () => {
      const query = { note_min: 5, note_max: 3 };
      const { error } = evaluationSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/note minimum.*inférieure/i);
    });

    it('devrait accepter des filtres par date', () => {
      const query = {
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-12-31')
      };
      const { error } = evaluationSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter dateFrom > dateTo', () => {
      const query = {
        dateFrom: new Date('2025-12-31'),
        dateTo: new Date('2025-01-01')
      };
      const { error } = evaluationSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date de début.*antérieure/i);
    });

    it('devrait accepter des paramètres de pagination', () => {
      const query = { page: 1, limit: 20 };
      const { error } = evaluationSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut', () => {
      const query = {};
      const { value } = evaluationSchemas.query.validate(query);
      expect(value.page).toBe(1);
      expect(value.limit).toBe(50);
      expect(value.sortBy).toBe('date');
      expect(value.sort).toBe('desc');
    });
  });
});

