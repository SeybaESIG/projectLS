import CircuitBreaker from 'opossum';
import logger from './logger.js';

/**
 * Configuration des Circuit Breakers pour APIs externes
 * 
 * Un circuit breaker protège l'application contre les pannes en cascade :
 * - CLOSED : Tout fonctionne, les requêtes passent
 * - OPEN : Trop d'erreurs, les requêtes sont rejetées immédiatement
 * - HALF_OPEN : Test si le service est revenu, quelques requêtes passent
 * 
 * Avantages :
 * - Évite de surcharger un service défaillant
 * - Fail-fast : réponses rapides en cas de panne
 * - Auto-récupération : teste automatiquement si le service est revenu
 */

// Options par défaut pour tous les circuit breakers
const defaultOptions = {
    timeout: 10000, // 10 secondes max par requête
    errorThresholdPercentage: 50, // Ouvre le circuit si > 50% d'erreurs
    resetTimeout: 30000, // Essaie de refermer après 30s
    rollingCountTimeout: 10000, // Fenêtre glissante de 10s pour calculer le taux d'erreur
    rollingCountBuckets: 10, // Divise la fenêtre en 10 buckets
    volumeThreshold: 5, // Minimum 5 requêtes avant d'ouvrir le circuit
};

/**
 * Circuit Breaker pour Stripe
 * Timeout: 15s (paiements peuvent être lents)
 */
export const stripeCircuitBreaker = <T>(fn: (...args: any[]) => Promise<T>) => {
    const breaker = new CircuitBreaker(fn, {
        ...defaultOptions,
        timeout: 15000, // Stripe peut être lent, 15s
        name: 'Stripe',
    });

    // Événements pour monitoring
    breaker.on('open', () => {
        logger.error('🔴 Circuit Breaker OPEN: Stripe indisponible');
    });

    breaker.on('halfOpen', () => {
        logger.warn('🟡 Circuit Breaker HALF-OPEN: Test de Stripe...');
    });

    breaker.on('close', () => {
        logger.info('🟢 Circuit Breaker CLOSED: Stripe opérationnel');
    });

    breaker.on('timeout', () => {
        logger.warn('⏱️  Timeout: Requête Stripe > 15s');
    });

    breaker.on('failure', (error: Error) => {
        logger.error('❌ Erreur Stripe:', { message: error.message });
    });

    return breaker;
};

/**
 * Circuit Breaker pour Firebase
 * Timeout: 10s (authentification doit être rapide)
 */
export const firebaseCircuitBreaker = <T>(fn: (...args: any[]) => Promise<T>) => {
    const breaker = new CircuitBreaker(fn, {
        ...defaultOptions,
        timeout: 10000,
        name: 'Firebase',
    });

    breaker.on('open', () => {
        logger.error('🔴 Circuit Breaker OPEN: Firebase indisponible');
    });

    breaker.on('halfOpen', () => {
        logger.warn('🟡 Circuit Breaker HALF-OPEN: Test de Firebase...');
    });

    breaker.on('close', () => {
        logger.info('🟢 Circuit Breaker CLOSED: Firebase opérationnel');
    });

    breaker.on('timeout', () => {
        logger.warn('⏱️  Timeout: Requête Firebase > 10s');
    });

    breaker.on('failure', (error: Error) => {
        logger.error('❌ Erreur Firebase:', { message: error.message });
    });

    return breaker;
};

/**
 * Circuit Breaker pour Google Cloud Storage
 * Timeout: 30s (uploads peuvent être lents pour gros fichiers)
 */
export const gcsCircuitBreaker = <T>(fn: (...args: any[]) => Promise<T>) => {
    const breaker = new CircuitBreaker(fn, {
        ...defaultOptions,
        timeout: 30000, // GCS upload peut prendre du temps
        volumeThreshold: 3, // Moins de requêtes, circuit plus sensible
        name: 'GCS',
    });

    breaker.on('open', () => {
        logger.error('🔴 Circuit Breaker OPEN: Google Cloud Storage indisponible');
    });

    breaker.on('halfOpen', () => {
        logger.warn('🟡 Circuit Breaker HALF-OPEN: Test de GCS...');
    });

    breaker.on('close', () => {
        logger.info('🟢 Circuit Breaker CLOSED: GCS opérationnel');
    });

    breaker.on('timeout', () => {
        logger.warn('⏱️  Timeout: Upload GCS > 30s');
    });

    breaker.on('failure', (error: Error) => {
        logger.error('❌ Erreur GCS:', { message: error.message });
    });

    return breaker;
};

/**
 * Circuit Breaker générique pour autres APIs
 */
export const createCircuitBreaker = <T>(
    fn: (...args: any[]) => Promise<T>,
    name: string,
    customOptions: Partial<CircuitBreaker.Options> = {}
) => {
    const breaker = new CircuitBreaker(fn, {
        ...defaultOptions,
        ...customOptions,
        name,
    });

    breaker.on('open', () => {
        logger.error(`🔴 Circuit Breaker OPEN: ${name} indisponible`);
    });

    breaker.on('halfOpen', () => {
        logger.warn(`🟡 Circuit Breaker HALF-OPEN: Test de ${name}...`);
    });

    breaker.on('close', () => {
        logger.info(`🟢 Circuit Breaker CLOSED: ${name} opérationnel`);
    });

    breaker.on('timeout', () => {
        logger.warn(`⏱️  Timeout: ${name} > ${customOptions.timeout || defaultOptions.timeout}ms`);
    });

    breaker.on('failure', (error: Error) => {
        logger.error(`❌ Erreur ${name}:`, { message: error.message });
    });

    return breaker;
};

/**
 * Helper pour wrapper une fonction avec circuit breaker + fallback
 */
export const withCircuitBreaker = async <T>(
    breaker: CircuitBreaker<any[], any>,
    fallback: () => T | Promise<T>,
    ...args: any[]
): Promise<T> => {
    try {
        return await breaker.fire(...args);
    } catch (error) {
        logger.warn('Circuit breaker échec, utilisation du fallback');
        return await fallback();
    }
};

export default {
    stripe: stripeCircuitBreaker,
    firebase: firebaseCircuitBreaker,
    gcs: gcsCircuitBreaker,
    create: createCircuitBreaker,
    withFallback: withCircuitBreaker,
};

