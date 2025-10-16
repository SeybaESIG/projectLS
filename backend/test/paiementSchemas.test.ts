import { paiementSchemas } from '../schemas/paiementSchemas.js';

describe('Paiement Schemas Validation', () => {
  describe('Create schema', () => {
    it('devrait accepter un paiement valide', () => {
      const validPaiement = {
        id_transa: 1,
        montant: 100.50,
        type: 'carte',
        statut: 'attente'
      };
      const { error } = paiementSchemas.create.validate(validPaiement);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser "attente" comme statut par défaut', () => {
      const validPaiement = {
        id_transa: 1,
        montant: 100.50,
        type: 'carte'
      };
      const { error, value } = paiementSchemas.create.validate(validPaiement);
      expect(error).toBeUndefined();
      expect(value.statut).toBe('attente');
    });

    it('devrait accepter tous les types valides', () => {
      const types = ['carte', 'virement', 'especes', 'autre'];
      
      types.forEach(type => {
        const paiement = {
          id_transa: 1,
          montant: 100.50,
          type
        };
        const { error } = paiementSchemas.create.validate(paiement);
        expect(error).toBeUndefined();
      });
    });

    it('devrait accepter tous les statuts valides', () => {
      const statuts = ['attente', 'validé', 'annulé', 'remboursé'];
      
      statuts.forEach(statut => {
        const paiement = {
          id_transa: 1,
          montant: 100.50,
          type: 'carte',
          statut
        };
        const { error } = paiementSchemas.create.validate(paiement);
        expect(error).toBeUndefined();
      });
    });

    it('devrait rejeter un montant négatif', () => {
      const invalidPaiement = {
        id_transa: 1,
        montant: -50,
        type: 'carte'
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });

    it('devrait rejeter un montant de 0', () => {
      const invalidPaiement = {
        id_transa: 1,
        montant: 0,
        type: 'carte'
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });

    it('devrait rejeter un type invalide', () => {
      const invalidPaiement = {
        id_transa: 1,
        montant: 100.50,
        type: 'bitcoin'
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/carte|virement|especes|autre/i);
    });

    it('devrait rejeter un statut invalide', () => {
      const invalidPaiement = {
        id_transa: 1,
        montant: 100.50,
        type: 'carte',
        statut: 'pending'
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/attente|validé|annulé|remboursé/i);
    });

    it('devrait rejeter un montant manquant', () => {
      const invalidPaiement = {
        id_transa: 1,
        type: 'carte'
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/montant|required|requis/i);
    });

    it('devrait rejeter un type manquant', () => {
      const invalidPaiement = {
        id_transa: 1,
        montant: 100.50
      };
      const { error } = paiementSchemas.create.validate(invalidPaiement);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/type|required|requis/i);
    });
  });

  describe('Update schema', () => {
    it('devrait accepter une mise à jour valide du montant', () => {
      const validUpdate = {
        montant: 150.75
      };
      const { error } = paiementSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une mise à jour valide du statut', () => {
      const validUpdate = {
        statut: 'validé'
      };
      const { error } = paiementSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait accepter une mise à jour du type', () => {
      const validUpdate = {
        type: 'virement'
      };
      const { error } = paiementSchemas.update.validate(validUpdate);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const invalidUpdate = {};
      const { error } = paiementSchemas.update.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/at least|au moins/i);
    });

    it('devrait rejeter un montant négatif', () => {
      const invalidUpdate = {
        montant: -50
      };
      const { error } = paiementSchemas.update.validate(invalidUpdate);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/positif|positive/i);
    });
  });

  describe('CreatePaymentIntent schema', () => {
    it('devrait accepter une requête valide', () => {
      const validRequest = {
        id_transa: 1,
        montant: 100.50
      };
      const { error } = paiementSchemas.createPaymentIntent.validate(validRequest);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser "eur" comme devise par défaut', () => {
      const validRequest = {
        id_transa: 1,
        montant: 100.50
      };
      const { error, value } = paiementSchemas.createPaymentIntent.validate(validRequest);
      expect(error).toBeUndefined();
      expect(value.currency).toBe('eur');
    });

    it('devrait accepter une devise personnalisée', () => {
      const validRequest = {
        id_transa: 1,
        montant: 100.50,
        currency: 'usd'
      };
      const { error } = paiementSchemas.createPaymentIntent.validate(validRequest);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter une devise invalide (trop longue)', () => {
      const invalidRequest = {
        id_transa: 1,
        montant: 100.50,
        currency: 'euro'
      };
      const { error } = paiementSchemas.createPaymentIntent.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/3 lettres|3 characters/i);
    });
  });

  describe('Query schema', () => {
    it('devrait accepter des paramètres de pagination', () => {
      const validQuery = {
        limit: 20,
        page: 2
      };
      const { error } = paiementSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait accepter des filtres de recherche', () => {
      const validQuery = {
        id_transa: 1,
        type: 'carte',
        statut: 'validé',
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        minAmount: 50.00,
        maxAmount: 500.00
      };
      const { error } = paiementSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter une plage de dates invalide', () => {
      const invalidQuery = {
        dateFrom: '2025-12-31',
        dateTo: '2025-01-01'
      };
      const { error } = paiementSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date/i);
    });

    it('devrait rejeter une plage de montants invalide', () => {
      const invalidQuery = {
        minAmount: 500,
        maxAmount: 100
      };
      const { error } = paiementSchemas.query.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/montant/i);
    });

    it('devrait accepter un tri valide', () => {
      const validQuery = {
        sortBy: 'montant',
        order: 'ASC'
      };
      const { error } = paiementSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut pour le tri', () => {
      const validQuery = {};
      const { error, value } = paiementSchemas.query.validate(validQuery);
      expect(error).toBeUndefined();
      expect(value.sortBy).toBe('date');
      expect(value.order).toBe('DESC');
    });
  });
});




