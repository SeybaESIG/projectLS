import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middlewares/firebaseAuth.js';

/**
 * Mock middleware pour l'authentification Firebase dans les tests
 * Simule un utilisateur connecté
 * 
 * Pour les tests d'intégration : utilise alice.martin@example.com (existe dans la DB)
 * Pour les tests unitaires : les mocks définissent l'utilisateur
 */
export function mockAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    // Ajouter un utilisateur fictif à la requête
    req.user = {
        uid: 'test-firebase-uid',
        email: 'alice.martin@example.com',
        email_verified: true,
        name: 'Alice Martin',
        firebase: {
            role: 'user'
        }
    };
    next();
}

/**
 * Mock middleware pour optionalFirebaseAuth
 * Ajoute l'utilisateur si disponible, sinon continue sans erreur
 */
export function mockOptionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    // En mode test, toujours ajouter l'utilisateur pour simplifier
    req.user = {
        uid: 'test-firebase-uid',
        email: 'test@example.com',
        email_verified: true,
        name: 'Test User',
        firebase: {
            role: 'user'
        }
    };
    next();
}

/**
 * Mock middleware pour admin
 */
export function mockAdminAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    req.user = {
        uid: 'test-admin-uid',
        email: 'admin@example.com',
        email_verified: true,
        name: 'Admin User',
        firebase: {
            role: 'admin'
        }
    };
    next();
}

