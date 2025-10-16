import { encryptMessage, decryptMessage, generateEncryptionKey } from '../services/encryptionService.js';

describe('Encryption Service', () => {
  // Sauvegarder et restaurer la clé originale
  let originalKey: string | undefined;

  beforeAll(() => {
    originalKey = process.env.MESSAGE_ENCRYPTION_KEY;
  });

  afterAll(() => {
    if (originalKey) {
      process.env.MESSAGE_ENCRYPTION_KEY = originalKey;
    }
  });

  describe('generateEncryptionKey', () => {
    it('devrait générer une clé de 32 bytes en base64', async () => {
      const key = await generateEncryptionKey();
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(40); // Base64 de 32 bytes ≈ 44 caractères
    });

    it('devrait générer des clés différentes à chaque appel', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('encryptMessage et decryptMessage', () => {
    beforeEach(async () => {
      // Utiliser une clé de test
      process.env.MESSAGE_ENCRYPTION_KEY = await generateEncryptionKey();
    });

    it('devrait encrypter et décrypter un message simple', async () => {
      const original = 'Bonjour, comment allez-vous?';
      
      const encrypted = await encryptMessage(original);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(original);
      
      const decrypted = await decryptMessage(encrypted);
      expect(decrypted).toBe(original);
    });

    it('devrait encrypter et décrypter un message avec caractères spéciaux', async () => {
      const original = 'Message avec émojis 🚀 et caractères spéciaux: é à ç ü!';
      
      const encrypted = await encryptMessage(original);
      const decrypted = await decryptMessage(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it('devrait encrypter et décrypter un message long', async () => {
      const original = 'A'.repeat(1000);
      
      const encrypted = await encryptMessage(original);
      const decrypted = await decryptMessage(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it('devrait encrypter et décrypter un message vide', async () => {
      const original = '';
      
      const encrypted = await encryptMessage(original);
      const decrypted = await decryptMessage(encrypted);
      
      expect(decrypted).toBe(original);
    });

    it('devrait produire des chiffrés différents pour le même message', async () => {
      const original = 'Message identique';
      
      const encrypted1 = await encryptMessage(original);
      const encrypted2 = await encryptMessage(original);
      
      // Les chiffrés sont différents (nonce aléatoire)
      expect(encrypted1).not.toBe(encrypted2);
      
      // Mais les deux se déchiffrent correctement
      const decrypted1 = await decryptMessage(encrypted1);
      const decrypted2 = await decryptMessage(encrypted2);
      
      expect(decrypted1).toBe(original);
      expect(decrypted2).toBe(original);
    });

    it('devrait échouer si la clé est absente', async () => {
      delete process.env.MESSAGE_ENCRYPTION_KEY;
      
      await expect(encryptMessage('test')).rejects.toThrow(/MESSAGE_ENCRYPTION_KEY/);
      await expect(decryptMessage('test')).rejects.toThrow(/MESSAGE_ENCRYPTION_KEY/);
    });

    it('devrait échouer si on décrypte avec une mauvaise clé', async () => {
      const original = 'Message secret';
      const key1 = await generateEncryptionKey();
      
      process.env.MESSAGE_ENCRYPTION_KEY = key1;
      const encrypted = await encryptMessage(original);
      
      // Changer la clé
      const key2 = await generateEncryptionKey();
      process.env.MESSAGE_ENCRYPTION_KEY = key2;
      
      await expect(decryptMessage(encrypted)).rejects.toThrow();
    });
  });
});




