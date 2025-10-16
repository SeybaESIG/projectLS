import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { readFileSync } from 'fs';
import logger from './logger.js';

/**
 * Initialise Firebase Admin SDK
 * 
 * Deux méthodes de configuration supportées :
 * 1. Via fichier JSON (FIREBASE_SERVICE_ACCOUNT_PATH)
 * 2. Via variables d'environnement individuelles
 */

let firebaseApp: admin.app.App | null = null;
let authInstance: admin.auth.Auth | null = null;

function initializeFirebase() {
    try {
        // Méthode 1 : Fichier service account JSON
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccountJson = readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf-8');
            const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            authInstance = admin.auth();
            logger.info('✅ Firebase Admin initialisé avec fichier service account');
        }
        // Méthode 2 : Variables d'environnement individuelles
        else if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY
        ) {
            const serviceAccount: ServiceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            authInstance = admin.auth();
            logger.info('✅ Firebase Admin initialisé avec variables d\'environnement');
        }
        // Environnement de test/développement sans Firebase
        else {
            logger.warn('⚠️  Firebase non configuré - Authentification désactivée');
        }
    } catch (error) {
        logger.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
        // En développement, on continue sans Firebase
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('⚠️  Mode développement : Firebase bypass activé');
        } else {
            throw error;
        }
    }
}

// Getter pour accéder à l'instance Firebase Admin
// Retourne l'instance actuelle (peut être null si pas encore initialisé)
export function getFirebaseAdmin(): admin.app.App | null {
    return firebaseApp;
}

// Getter pour accéder à l'instance Auth
// Retourne l'instance actuelle (peut être null si pas encore initialisé)
export function getAuth(): admin.auth.Auth | null {
    return authInstance;
}

// Pour compatibilité avec les imports existants
// Ces getters retournent les valeurs ACTUELLES, pas des copies
export const auth: { readonly current: admin.auth.Auth | null } = {
    get current() {
        return authInstance;
    }
};

export const firebaseAdmin: { readonly current: admin.app.App | null } = {
    get current() {
        return firebaseApp;
    }
};

// Initialiser Firebase au chargement du module (après un tick pour laisser dotenv se charger)
setTimeout(() => {
    initializeFirebase();
}, 0);

