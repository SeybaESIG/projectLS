import { msgLectureSchemas } from '../schemas/msgLectureSchemas.js';

describe('Msg Lecture Schemas Validation', () => {
  describe('Mark As Read Schema', () => {
    it('devrait valider une requête complète avec annonce', () => {
      const validRequest = {
        id_expediteur: 1,
        id_destinataire: 2,
        id_annon: 5
      };
      const { error } = msgLectureSchemas.markAsRead.validate(validRequest);
      expect(error).toBeUndefined();
    });

    it('devrait accepter sans annonce', () => {
      const validRequest = {
        id_expediteur: 1,
        id_destinataire: 2
      };
      const { error } = msgLectureSchemas.markAsRead.validate(validRequest);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter si id_expediteur manquant', () => {
      const invalidRequest = {
        id_destinataire: 2
      };
      const { error } = msgLectureSchemas.markAsRead.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/id_expediteur/i);
    });

    it('devrait rejeter si id_destinataire manquant', () => {
      const invalidRequest = {
        id_expediteur: 1
      };
      const { error } = msgLectureSchemas.markAsRead.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/id_destinataire/i);
    });

    it('devrait rejeter des IDs négatifs', () => {
      const invalidRequest = {
        id_expediteur: -1,
        id_destinataire: 2
      };
      const { error } = msgLectureSchemas.markAsRead.validate(invalidRequest);
      expect(error).toBeDefined();
    });

    it('devrait rejeter des IDs à zéro', () => {
      const invalidRequest = {
        id_expediteur: 1,
        id_destinataire: 0
      };
      const { error } = msgLectureSchemas.markAsRead.validate(invalidRequest);
      expect(error).toBeDefined();
    });
  });

  describe('User Params Schema', () => {
    it('devrait valider un id_util numérique', () => {
      const params = { id_util: 123 };
      const { error } = msgLectureSchemas.userParams.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un id_util négatif', () => {
      const params = { id_util: -1 };
      const { error } = msgLectureSchemas.userParams.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un id_util à zéro', () => {
      const params = { id_util: 0 };
      const { error } = msgLectureSchemas.userParams.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 456 };
      const { error } = msgLectureSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = msgLectureSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });
});




