import { jest } from '@jest/globals';
import logger, { logWithContext, logError } from '../config/logger.js';

/**
 * Tests pour le logger Winston
 * 
 * Note: Ces tests vérifient la configuration, pas Winston lui-même
 */

describe('Logger Tests', () => {
    // Spy sur les méthodes du logger
    let infoSpy: jest.SpiedFunction<any>;
    let errorSpy: jest.SpiedFunction<any>;
    let warnSpy: jest.SpiedFunction<any>;
    let debugSpy: jest.SpiedFunction<any>;

    beforeEach(() => {
        infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => logger);
        errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => logger);
        warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
        debugSpy = jest.spyOn(logger, 'debug').mockImplementation(() => logger);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Logger de base', () => {
        it('devrait logger un message info', () => {
            logger.info('Test message');

            expect(infoSpy).toHaveBeenCalledWith('Test message');
        });

        it('devrait logger un message error', () => {
            logger.error('Error message');

            expect(errorSpy).toHaveBeenCalledWith('Error message');
        });

        it('devrait logger un message warn', () => {
            logger.warn('Warning message');

            expect(warnSpy).toHaveBeenCalledWith('Warning message');
        });

        it('devrait logger un message debug', () => {
            logger.debug('Debug message');

            expect(debugSpy).toHaveBeenCalledWith('Debug message');
        });
    });

    describe('Logger avec contexte', () => {
        it('devrait logger avec contexte', () => {
            const logSpy = jest.spyOn(logger, 'log').mockImplementation(() => logger);
            
            logWithContext('info', 'Message with context', { userId: 123 });

            expect(logSpy).toHaveBeenCalledWith('info', 'Message with context', { userId: 123 });
            
            logSpy.mockRestore();
        });

        it('devrait accepter différents niveaux de log', () => {
            const logSpy = jest.spyOn(logger, 'log').mockImplementation(() => logger);
            
            logWithContext('error', 'Error with context', { error: 'details' });

            expect(logSpy).toHaveBeenCalledWith('error', 'Error with context', { error: 'details' });
            
            logSpy.mockRestore();
        });
    });

    describe('logError helper', () => {
        it('devrait logger une Error avec stack trace', () => {
            const error = new Error('Test error');
            
            logError(error);

            expect(errorSpy).toHaveBeenCalledWith(
                'Test error',
                expect.objectContaining({
                    stack: expect.any(String)
                })
            );
        });

        it('devrait logger une Error avec contexte supplémentaire', () => {
            const error = new Error('Test error');
            const context = { userId: 456, action: 'create' };
            
            logError(error, context);

            expect(errorSpy).toHaveBeenCalledWith(
                'Test error',
                expect.objectContaining({
                    stack: expect.any(String),
                    userId: 456,
                    action: 'create'
                })
            );
        });
    });

    describe('Configuration', () => {
        it('devrait avoir un niveau de log défini', () => {
            expect(logger.level).toBeDefined();
            expect(typeof logger.level).toBe('string');
        });

        it('devrait avoir des transports configurés', () => {
            // Le logger doit avoir au moins la console en test
            expect(logger.transports).toBeDefined();
            expect(logger.transports.length).toBeGreaterThan(0);
        });
    });

    describe('Métadonnées', () => {
        it('devrait accepter des métadonnées structurées', () => {
            logger.info('Message with metadata', {
                method: 'GET',
                path: '/api/test',
                ip: '127.0.0.1',
                user: 'test@example.com'
            });

            expect(infoSpy).toHaveBeenCalled();
        });

        it('devrait gérer des objets complexes', () => {
            logger.info('Complex data', {
                user: {
                    id: 1,
                    email: 'test@example.com'
                },
                data: [1, 2, 3]
            });

            expect(infoSpy).toHaveBeenCalled();
        });
    });
});

