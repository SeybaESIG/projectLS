import axios from 'axios';
import type { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import logger from './logger.js';

/**
 * Configuration d'Axios avec retry automatique
 * 
 * Retry automatiquement les requêtes en cas d'erreur réseau ou timeout
 * - Erreurs réseau : ECONNREFUSED, ETIMEDOUT, etc.
 * - Erreurs 5xx : 500, 502, 503, 504
 * - Erreurs 429 : Too Many Requests (après un délai)
 */

/**
 * Créer une instance Axios avec retry automatique
 */
export const createAxiosWithRetry = (
    name: string = 'default',
    config: {
        timeout?: number;
        retries?: number;
        retryDelay?: number;
    } = {}
): AxiosInstance => {
    const {
        timeout = 10000, // 10s par défaut
        retries = 3, // 3 tentatives par défaut
        retryDelay = 1000, // 1s entre chaque tentative
    } = config;

    // Créer l'instance Axios
    const instance = axios.create({
        timeout,
        headers: {
            'User-Agent': 'Backend-API/1.0',
        },
    });

    // Configurer le retry
    axiosRetry(instance, {
        retries,
        retryDelay: (retryCount) => {
            // Backoff exponentiel : 1s, 2s, 4s, 8s, etc.
            const delay = retryDelay * Math.pow(2, retryCount - 1);
            logger.warn(`Retry ${retryCount}/${retries} pour ${name} dans ${delay}ms`);
            return delay;
        },
        retryCondition: (error) => {
            // Retry sur erreurs réseau
            if (axiosRetry.isNetworkError(error)) {
                logger.warn(`Erreur réseau ${name}:`, { message: error.message });
                return true;
            }

            // Retry sur erreurs 5xx (serveur)
            if (axiosRetry.isRetryableError(error)) {
                logger.warn(`Erreur serveur ${name}:`, { status: error.response?.status });
                return true;
            }

            // Retry sur 429 (rate limit)
            if (error.response?.status === 429) {
                logger.warn(`Rate limit ${name}, retry dans ${retryDelay}ms`);
                return true;
            }

            // Ne pas retry sur erreurs 4xx (client)
            return false;
        },
        onRetry: (retryCount, error, requestConfig) => {
            logger.info(`Tentative ${retryCount}/${retries} pour ${name}`, {
                url: requestConfig.url,
                method: requestConfig.method,
                error: error.message,
            });
        },
    });

    // Intercepteur pour logger les requêtes
    instance.interceptors.request.use(
        (config) => {
            logger.debug(`Requête ${name}:`, {
                method: config.method,
                url: config.url,
            });
            return config;
        },
        (error) => {
            logger.error(`Erreur requête ${name}:`, { message: error.message });
            return Promise.reject(error);
        }
    );

    // Intercepteur pour logger les réponses
    instance.interceptors.response.use(
        (response) => {
            logger.debug(`Réponse ${name}:`, {
                status: response.status,
                url: response.config.url,
            });
            return response;
        },
        (error) => {
            if (error.response) {
                logger.error(`Erreur HTTP ${name}:`, {
                    status: error.response.status,
                    url: error.config?.url,
                    data: error.response.data,
                });
            } else {
                logger.error(`Erreur réseau ${name}:`, {
                    message: error.message,
                    code: error.code,
                });
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

/**
 * Instances préconfigurées pour chaque service externe
 */

// Instance pour Stripe (timeout 15s, 3 retries)
export const stripeAxios = createAxiosWithRetry('Stripe', {
    timeout: 15000,
    retries: 3,
    retryDelay: 1000,
});

// Instance pour Firebase (timeout 10s, 3 retries)
export const firebaseAxios = createAxiosWithRetry('Firebase', {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
});

// Instance pour GCS (timeout 30s, 2 retries car uploads lents)
export const gcsAxios = createAxiosWithRetry('GCS', {
    timeout: 30000,
    retries: 2,
    retryDelay: 2000,
});

// Instance générique (timeout 10s, 3 retries)
export const defaultAxios = createAxiosWithRetry('Default', {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
});

export default {
    create: createAxiosWithRetry,
    stripe: stripeAxios,
    firebase: firebaseAxios,
    gcs: gcsAxios,
    default: defaultAxios,
};

