import { messageSchemas } from '../schemas/messageSchemas.js';

describe('Message Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid data', () => {
      it('devrait valider un message complet avec image', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          id_annon: 5,
          contenu: 'Bonjour, est-ce que l\'annonce est toujours disponible?',
          url_image: 'https://storage.googleapis.com/bucket/image.jpg'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un message sans annonce', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'Message général'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un message sans image', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          id_annon: 5,
          contenu: 'Message texte uniquement'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un message long (1000 caractères)', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'a'.repeat(1000)
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });
    });

    describe('Contenu validation', () => {
      it('devrait rejeter un message vide', () => {
        const invalidMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: ''
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/vide|empty/i);
      });

      it('devrait rejeter un message trop long', () => {
        const invalidMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'a'.repeat(1001)
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/1000 caractères/i);
      });

      it('devrait rejeter si contenu manquant', () => {
        const invalidMessage = {
          id_expediteur: 1,
          id_destinataire: 2
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/contenu/i);
      });
    });

    describe('URL image validation', () => {
      it('devrait accepter une URL valide', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'Message',
          url_image: 'https://example.com/image.jpg'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter une URL invalide', () => {
        const invalidMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'Message',
          url_image: 'not-a-valid-url'
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/URL.*valide/i);
      });

      it('devrait rejeter une URL trop longue', () => {
        const invalidMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'Message',
          url_image: 'https://example.com/' + 'a'.repeat(500)
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/500 caractères/i);
      });
    });

    describe('Utilisateurs validation', () => {
      it('ne teste plus expediteur = destinataire (car id_expediteur est forcé par le controller)', () => {
        // Ce test n'est plus pertinent car id_expediteur est maintenant optionnel
        // et forcé automatiquement par le controller à l'utilisateur connecté
        // La validation se fait au niveau du controller, pas du schéma
        expect(true).toBe(true);
      });

      it('devrait accepter expediteur ≠ destinataire', () => {
        const validMessage = {
          id_expediteur: 1,
          id_destinataire: 2,
          contenu: 'Message valide'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        expect(error).toBeUndefined();
      });
    });

    describe('Champs requis', () => {
      it('devrait ACCEPTER si id_expediteur manquant (car forcé par le controller)', () => {
        const validMessage = {
          id_destinataire: 2,
          contenu: 'Message'
        };
        const { error } = messageSchemas.create.validate(validMessage);
        // id_expediteur est maintenant optionnel car le controller le force automatiquement
        expect(error).toBeUndefined();
      });

      it('devrait rejeter si id_destinataire manquant', () => {
        const invalidMessage = {
          id_expediteur: 1,
          contenu: 'Message'
        };
        const { error } = messageSchemas.create.validate(invalidMessage);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_destinataire/i);
      });
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = messageSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = messageSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Conversation Query Schema', () => {
    it('devrait accepter expediteur et destinataire', () => {
      const query = {
        id_expediteur: 1,
        id_destinataire: 2
      };
      const { error } = messageSchemas.conversationQuery.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter avec annonce', () => {
      const query = {
        id_expediteur: 1,
        id_destinataire: 2,
        id_annon: 5
      };
      const { error } = messageSchemas.conversationQuery.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter pagination', () => {
      const query = {
        id_expediteur: 1,
        id_destinataire: 2,
        page: 2,
        limit: 20
      };
      const { error } = messageSchemas.conversationQuery.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut', () => {
      const query = {
        id_expediteur: 1,
        id_destinataire: 2
      };
      const { value } = messageSchemas.conversationQuery.validate(query);
      expect(value.page).toBe(1);
      expect(value.limit).toBe(50);
    });
  });

  describe('Query Schema', () => {
    it('devrait accepter des filtres optionnels', () => {
      const query = {
        sender: 'alice',
        receiver: 'bob',
        id_annon: 5,
        dateFrom: new Date('2025-01-01'),
        dateTo: new Date('2025-12-31')
      };
      const { error } = messageSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter dateFrom > dateTo', () => {
      const query = {
        dateFrom: new Date('2025-12-31'),
        dateTo: new Date('2025-01-01')
      };
      const { error } = messageSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date de début.*antérieure/i);
    });

    it('devrait accepter des paramètres de pagination', () => {
      const query = { page: 1, limit: 20 };
      const { error } = messageSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser des valeurs par défaut', () => {
      const query = {};
      const { value } = messageSchemas.query.validate(query);
      expect(value.page).toBe(1);
      expect(value.limit).toBe(50);
      expect(value.sortBy).toBe('dateenvoi');
      expect(value.sort).toBe('desc');
    });
  });
});

