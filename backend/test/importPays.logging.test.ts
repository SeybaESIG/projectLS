import { jest } from '@jest/globals';

const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();
const mockAxiosGet = jest.fn();
const mockBulkCreate = jest.fn();

jest.unstable_mockModule('winston', () => ({
  default: {
    createLogger: jest.fn(() => ({
      info: mockLoggerInfo,
      error: mockLoggerError,
      warn: mockLoggerWarn,
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

jest.unstable_mockModule('axios', () => ({
  default: {
    get: mockAxiosGet,
    isAxiosError: (error: any) => error.isAxiosError === true,
  },
}));

jest.unstable_mockModule('node-cron', () => ({
  default: {
    schedule: jest.fn(),
  },
}));

jest.unstable_mockModule('../models/index.js', () => ({
  Pays: {
    bulkCreate: mockBulkCreate,
  },
}));

const { importPays } = await import('../scripts/importPays.js');

describe('Import Pays - Tests de Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AIRLABS_API_KEY = 'test_api_key';
  });

  afterEach(() => {
    delete process.env.AIRLABS_API_KEY;
  });

  describe('📝 Logs d\'information', () => {
    it('devrait logger le début de l\'importation', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          response: [{ code: 'FR', code3: 'FRA', name: 'France' }],
        },
      });

      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }]);

      await importPays();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('Début de l\'importation des pays')
      );
    });

    it('devrait logger le nombre de pays récupérés', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          response: [
            { code: 'FR', code3: 'FRA', name: 'France' },
            { code: 'US', code3: 'USA', name: 'United States' },
          ],
        },
      });

      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }, { id_pays: 2 }]);

      await importPays();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('2 pays récupérés')
      );
    });

    it('devrait logger le nombre de doublons ignorés', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          response: [
            { code: 'FR', code3: 'FRA', name: 'France' },
            { code: 'US', code3: 'USA', name: 'United States' },
          ],
        },
      });

      // Seulement 1 pays importé (l'autre est un doublon)
      mockBulkCreate.mockResolvedValue([{ id_pays: 1 }]);

      await importPays();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('1 doublon')
      );
    });
  });

  describe('❌ Logs d\'erreur', () => {
    it('devrait logger les erreurs avec le bon niveau', async () => {
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      await importPays();

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Erreur'),
        expect.any(Object)
      );
    });

    it('devrait logger les détails des erreurs Axios', async () => {
      const error: any = new Error('Timeout');
      error.code = 'ECONNABORTED';
      error.isAxiosError = true;

      mockAxiosGet.mockRejectedValue(error);

      await importPays();

      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Timeout')
      );
    });
  });
});
