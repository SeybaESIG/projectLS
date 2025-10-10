import { uploadSchemas } from '../schemas/uploadSchemas.js';

describe('Upload Schemas Validation', () => {
  describe('GetSignedUrl schema', () => {
    it('devrait accepter une requête valide', () => {
      const validRequest = {
        filename: 'photo.jpg',
        contentType: 'image/jpeg'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(validRequest);
      expect(error).toBeUndefined();
    });

    it('devrait utiliser "message-image" comme catégorie par défaut', () => {
      const validRequest = {
        filename: 'photo.jpg',
        contentType: 'image/jpeg'
      };
      const { error, value } = uploadSchemas.getSignedUrl.validate(validRequest);
      expect(error).toBeUndefined();
      expect(value.category).toBe('message-image');
    });

    it('devrait accepter tous les types d\'images valides', () => {
      const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      types.forEach(contentType => {
        const request = {
          filename: 'photo.jpg',
          contentType
        };
        const { error } = uploadSchemas.getSignedUrl.validate(request);
        expect(error).toBeUndefined();
      });
    });

    it('devrait accepter les catégories valides', () => {
      const categories = ['user-photo', 'message-image'];
      
      categories.forEach(category => {
        const request = {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
          category
        };
        const { error } = uploadSchemas.getSignedUrl.validate(request);
        expect(error).toBeUndefined();
      });
    });

    it('devrait rejeter un type de fichier non-image', () => {
      const invalidRequest = {
        filename: 'document.pdf',
        contentType: 'application/pdf'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/image|JPEG|PNG|GIF|WEBP/i);
    });

    it('devrait rejeter un type de fichier invalide', () => {
      const invalidRequest = {
        filename: 'video.mp4',
        contentType: 'video/mp4'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/image/i);
    });

    it('devrait rejeter un nom de fichier vide', () => {
      const invalidRequest = {
        filename: '',
        contentType: 'image/jpeg'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/1 caractère|1 character|empty|vide/i);
    });

    it('devrait rejeter un nom de fichier trop long', () => {
      const invalidRequest = {
        filename: 'a'.repeat(256),
        contentType: 'image/jpeg'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/255 caractères|255 characters/i);
    });

    it('devrait rejeter un filename manquant', () => {
      const invalidRequest = {
        contentType: 'image/jpeg'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/filename|nom.*fichier|required|requis/i);
    });

    it('devrait rejeter un contentType manquant', () => {
      const invalidRequest = {
        filename: 'photo.jpg'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/contentType|type.*contenu|required|requis/i);
    });

    it('devrait rejeter une catégorie invalide', () => {
      const invalidRequest = {
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        category: 'invalid-category'
      };
      const { error } = uploadSchemas.getSignedUrl.validate(invalidRequest);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/user-photo|message-image/i);
    });
  });
});

