import { jest } from '@jest/globals';

// Mock axios et winston AVANT d'importer le module
const mockAxiosGet = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockBulkCreate = jest.fn();
const mockCronSchedule = jest.fn();

jest.unstable_mockModule('axios', () => ({
  default: {
    get: mockAxiosGet,
    isAxiosError: (error: any) => error.isAxiosError === true,
  },
}));

jest.unstable_mockModule('winston', () => ({
  default: {
    createLogger: jest.fn(() => ({
      info: mockLoggerInfo,
      error: mockLoggerError,
      warn: jest.fn(),
    })),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      printf: jest.fn(),
      colorize: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('node-cron', () => ({
  default: {
    schedule: mockCronSchedule,
  },
}));

jest.unstable_mockModule('../models/index.js', () => ({
  Pays: {
    bulkCreate: mockBulkCreate,
  },
}));

// Importer le module à tester APRÈS avoir configuré les mocks
const { importPays, startCronJob, stopCronJob } = await import('../scripts/importPays.js');

describe('Import Pays - Tests Unitaires', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AIRLABS_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    delete process.env.AIRLABS_API_KEY;
  });

  describe('✅ Cas de succès', () => {
    it('devrait importer les pays avec succès', async () => {
      const mockCountries = [
        { code: 'FR', code3: 'FRA', name: 'France' },
        { code: 'US', code3: 'USA', name: 'United States' },
      ];

      mockAxiosGet.mockResolvedValue({
        data: {
          response: mockCountries,
        },
      });

      mockBulkCreate.mockResolvedValue([
        { id_pays: 1, nom_pays: 'France', code_iso_pays: 'FR' },
        { id_pays: 2, nom_pays: 'United States', code_iso_pays: 'US' },
      ]);

      const result = await importPays();

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('importation des pays'));
    });

    it('devrait gérer correctement les doublons', async () => {
      const mockCountries = [
        { code: 'FR', code3: 'FRA', name: 'France' },
        { code: 'US', code3: 'USA', name: 'United States' },
      ];

      mockAxiosGet.mockResolvedValue({
        data: {
          response: mockCountries,
        },
      });

      // Simulate que seul 1 pays est importé (l'autre est un doublon)
      mockBulkCreate.mockResolvedValue([
        { id_pays: 1, nom_pays: 'France', code_iso_pays: 'FR' },
      ]);

      const result = await importPays();

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining('doublon'));
    });

    it('devrait filtrer les données invalides', async () => {
      const mockCountries = [
        { code: 'FR', code3: 'FRA', name: 'France' },
        { code: '', code3: 'XXX', name: 'Invalid' }, // Pas de code
        { code: 'US', code3: 'USA', name: '' }, // Pas de nom
      ];

      mockAxiosGet.mockResolvedValue({
        data: {
          response: mockCountries,
        },
      });

      mockBulkCreate.mockResolvedValue([
        { id_pays: 1, nom_pays: 'France', code_iso_pays: 'FR' },
      ]);

      const result = await importPays();

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
    });
  });

  describe('❌ Gestion des erreurs', () => {
    it('devrait gérer l\'absence de clé API', async () => {
      delete process.env.AIRLABS_API_KEY;

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(result.error).toContain('AIRLABS_API_KEY');
      expect(mockLoggerError).toHaveBeenCalled();
    });

    it('devrait gérer les timeouts de l\'API', async () => {
      const timeoutError: any = new Error('Timeout');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isAxiosError = true;

      mockAxiosGet.mockRejectedValue(timeoutError);

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('Timeout'));
    });

    it('devrait gérer les erreurs 401 (clé API invalide)', async () => {
      const error401: any = new Error('Unauthorized');
      error401.isAxiosError = true;
      error401.response = { status: 401 };

      mockAxiosGet.mockRejectedValue(error401);

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('invalide'));
    });

    it('devrait gérer les erreurs 429 (limite dépassée)', async () => {
      const error429: any = new Error('Too Many Requests');
      error429.isAxiosError = true;
      error429.response = { status: 429 };

      mockAxiosGet.mockRejectedValue(error429);

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('Limite'));
    });

    it('devrait gérer une réponse API invalide', async () => {
      mockAxiosGet.mockResolvedValue({
        data: null,
      });

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalide');
    });

    it('devrait gérer l\'absence de pays valides', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          response: [],
        },
      });

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Aucune donnée');
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const mockCountries = [{ code: 'FR', code3: 'FRA', name: 'France' }];

      mockAxiosGet.mockResolvedValue({
        data: {
          response: mockCountries,
        },
      });

      mockBulkCreate.mockRejectedValue(new Error('Database error'));

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(mockLoggerError).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs réseau', async () => {
      const networkError: any = new Error('Network error');
      networkError.isAxiosError = true;
      networkError.request = {};

      mockAxiosGet.mockRejectedValue(networkError);

      const result = await importPays();

      expect(result.success).toBe(false);
      expect(mockLoggerError).toHaveBeenCalledWith(expect.stringContaining('réseau'));
    });
  });

  describe('🔧 Configuration', () => {
    it('devrait utiliser la clé API depuis .env', async () => {
      process.env.AIRLABS_API_KEY = 'my-custom-key';

      mockAxiosGet.mockResolvedValue({
        data: {
          response: [{ code: 'FR', code3: 'FRA', name: 'France' }],
        },
      });

      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }]);

      await importPays();

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://airlabs.co/api/v9/countries',
        expect.objectContaining({
          params: expect.objectContaining({
            api_key: 'my-custom-key',
          }),
        })
      );
    });

    it('devrait appeler l\'API avec les bons paramètres', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          response: [{ code: 'FR', code3: 'FRA', name: 'France' }],
        },
      });

      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }]);

      await importPays();

      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://airlabs.co/api/v9/countries',
        expect.objectContaining({
          timeout: 10000,
          headers: { Accept: 'application/json' },
        })
      );
    });

    it('devrait appeler bulkCreate avec les bonnes options', async () => {
      const mockCountries = [{ code: 'FR', code3: 'FRA', name: 'France' }];

      mockAxiosGet.mockResolvedValue({
        data: {
          response: mockCountries,
        },
      });

      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }]);

      await importPays();

      expect(mockBulkCreate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          ignoreDuplicates: true,
          validate: true,
        })
      );
    });
  });

  describe('⏰ Cron Job', () => {
    it('devrait démarrer la tâche cron avec le bon pattern', () => {
      const mockTask = { stop: jest.fn() };
      mockCronSchedule.mockReturnValue(mockTask);

      startCronJob();

      expect(mockCronSchedule).toHaveBeenCalledWith(
        '0 0 * * *',
        expect.any(Function)
      );
    });

    it('devrait arrêter la tâche cron', () => {
      const mockTask = { stop: jest.fn() };
      mockCronSchedule.mockReturnValue(mockTask);

      startCronJob();
      stopCronJob();

      expect(mockTask.stop).toHaveBeenCalled();
    });
  });
});
