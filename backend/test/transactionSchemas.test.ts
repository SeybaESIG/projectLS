import { transactionSchemas } from '../schemas/transactionSchemas.js';

describe('Transaction Schemas Validation', () => {
  describe('Create schema', () => {
    it('devrait accepter une transaction valide', () => {
      const validTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        id_annon: 5,
        montant: 100.50,
        statut: 'attente'
      };
      const { error } = transactionSchemas.create.validate(validTransaction);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une transaction sans id_annon', () => {
      const validTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        montant: 100.50,
        statut: 'attente'
      };
      const { error } = transactionSchemas.create.validate(validTransaction);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser "attente" comme statut par défaut', () => {
      const validTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        montant: 100.50
      };
      const { error, value } = transactionSchemas.create.validate(validTransaction);
      expect(error).toBeUndefined();
      expect(value.statut).toBe('attente');
    });

    it('devrait rejeter un montant négatif', () => {
      const invalidTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        montant: -50
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });

    it('devrait rejeter un montant de 0', () => {
      const invalidTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        montant: 0
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });

    it('devrait rejeter si payeur et receveur sont identiques', () => {
      const invalidTransaction = {
        id_payeur: 1,
        id_receveur: 1,
        montant: 100.50
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/différents/i);
    });

    it('devrait rejeter un statut invalide', () => {
      const invalidTransaction = {
        id_payeur: 1,
        id_receveur: 2,
        montant: 100.50,
        statut: 'pending'
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/attente|validée|annulée|remboursée/i);
    });

    it('devrait accepter tous les statuts valides', () => {
      const statuts = ['attente', 'validée', 'annulée', 'remboursée'];
      
      statuts.forEach(statut => {
        const transaction = {
          id_payeur: 1,
          id_receveur: 2,
          montant: 100.50,
          statut
        };
        const { error } = transactionSchemas.create.validate(transaction);
        expect(error).toBeUndefined();
      });
    });

    it('devrait rejeter un id_payeur manquant', () => {
      const invalidTransaction = {
        id_receveur: 2,
        montant: 100.50
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/payeur|required|requis/i);
    });

    it('devrait rejeter un id_receveur manquant', () => {
      const invalidTransaction = {
        id_payeur: 1,
        montant: 100.50
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/receveur|required|requis/i);
    });

    it('devrait rejeter un montant manquant', () => {
      const invalidTransaction = {
        id_payeur: 1,
        id_receveur: 2
      };
      const { error } = transactionSchemas.create.validate(invalidTransaction);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/montant|required|requis/i);
    });
  });

  describe('Update schema', () => {
    it('devrait accepter une mise à jour valide du montant', () => {
      const validUpdate = {
        montant: 150.75
      };
      const { error } = transactionSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une mise à jour valide du statut', () => {
      const validUpdate = {
        statut: 'validée'
      };
      const { error } = transactionSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une mise à jour complète', () => {
      const validUpdate = {
        montant: 150.75,
        statut: 'validée'
      };
      const { error } = transactionSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const invalidUpdate = {};
      const { error } = transactionSchemas.update.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/at least|au moins/i);
    });

    it('devrait rejeter un montant négatif', () => {
      const invalidUpdate = {
        montant: -50
      };
      const { error } = transactionSchemas.update.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });

    it('devrait rejeter un statut invalide', () => {
      const invalidUpdate = {
        statut: 'completed'
      };
      const { error } = transactionSchemas.update.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/attente|validée|annulée|remboursée/i);
    });
  });

  describe('Params schema', () => {
    it('devrait accepter un ID valide', () => {
      const validParams = { id: 1 };
      const { error } = transactionSchemas.params.validate(validParams);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const invalidParams = { id: -1 };
      const { error } = transactionSchemas.params.validate(invalidParams);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID non numérique', () => {
      const invalidParams = { id: 'abc' };
      const { error } = transactionSchemas.params.validate(invalidParams);
      expect(error).toBeDefined();
    });
  });

  describe('Query schema', () => {
    it('devrait accepter des paramètres de pagination', () => {
      const validQuery = {
        limit: 20,
        page: 2
      };
      const { error } = transactionSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait accepter des filtres de recherche', () => {
      const validQuery = {
        payeur: 1,
        receveur: 2,
        statut: 'validée',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        minAmount: 50.00,
        maxAmount: 500.00
      };
      const { error } = transactionSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter une plage de dates invalide', () => {
      const invalidQuery = {
        dateFrom: '2025-12-31',
        dateTo: '2025-01-01'
      };
      const { error } = transactionSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date/i);
    });

    it('devrait rejeter une plage de montants invalide', () => {
      const invalidQuery = {
        minAmount: 500,
        maxAmount: 100
      };
      const { error } = transactionSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/montant/i);
    });

    it('devrait accepter un tri valide', () => {
      const validQuery = {
        sortBy: 'montant',
        order: 'ASC'
      };
      const { error } = transactionSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut pour le tri', () => {
      const validQuery = {};
      const { error, value } = transactionSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
      expect(value.sortBy).toBe('date');
      expect(value.order).toBe('DESC');
    });

    it('devrait rejeter un sortBy invalide', () => {
      const invalidQuery = {
        sortBy: 'invalid_field'
      };
      const { error } = transactionSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un order invalide', () => {
      const invalidQuery = {
        order: 'INVALID'
      };
      const { error } = transactionSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
    });
  });
});

