import type { Request, Response, NextFunction } from 'express';
import type * as admin from 'firebase-admin';
import { auth } from '../config/firebase.js';
import logger from '../config/logger.js';

/**
 * Interface pour étendre Express Request avec les données utilisateur Firebase
 */
export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string | undefined;
        email_verified?: boolean | undefined;
        phone_number?: string | undefined;
        name?: string | undefined;
        picture?: string | undefined;
        firebase?: any; // Données complètes du token Firebase
    };
}

/**
 * Middleware d'authentification Firebase
 * 
 * Vérifie le token JWT Firebase dans le header Authorization
 * Format attendu : "Bearer <token>"
 * 
 * @throws 401 - Si aucun token n'est fourni
 * @throws 403 - Si le token est invalide ou expiré
 */
export async function authenticateFirebase(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Vérifier si Firebase est configuré
        const firebaseAuth = auth.current;
        if (!firebaseAuth) {
            logger.warn('⚠️  Firebase non configuré - Authentification bypass pour développement');
            return next();
        }

        // Récupérer le header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Non autorisé',
                message: 'Token d\'authentification manquant. Format attendu: "Bearer <token>"'
            });
            return;
        }

        // Extraire le token
        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            res.status(401).json({
                error: 'Non autorisé',
                message: 'Token vide'
            });
            return;
        }

        // Vérifier le token avec Firebase Admin
        const decodedToken = await firebaseAuth.verifyIdToken(token);

        // Ajouter les informations utilisateur à la requête
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            phone_number: decodedToken.phone_number,
            name: decodedToken.name,
            picture: decodedToken.picture,
            firebase: decodedToken // Toutes les données du token
        };

        // Passer au middleware suivant
        next();

    } catch (error: any) {
        logger.error('❌ Erreur d\'authentification Firebase:', { message: error.message, code: error.code });

        // Gérer les différents types d'erreurs
        if (error.code === 'auth/id-token-expired') {
            res.status(403).json({
                error: 'Token expiré',
                message: 'Votre session a expiré. Veuillez vous reconnecter.'
            });
            return;
        }

        if (error.code === 'auth/argument-error') {
            res.status(401).json({
                error: 'Token invalide',
                message: 'Le format du token est incorrect'
            });
            return;
        }

        // Erreur générique
        res.status(403).json({
            error: 'Accès interdit',
            message: 'Token invalide ou révoqué'
        });
    }
}

/**
 * Middleware optionnel pour les routes publiques avec auth optionnelle
 * Ajoute les infos user si le token est valide, sinon continue sans erreur
 */
export async function optionalFirebaseAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const firebaseAuth = auth.current;

        if (!authHeader || !firebaseAuth) {
            return next();
        }

        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            return next();
        }

        const decodedToken = await firebaseAuth.verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified,
            phone_number: decodedToken.phone_number,
            name: decodedToken.name,
            picture: decodedToken.picture,
            firebase: decodedToken
        };

        next();
    } catch (error) {
        // En cas d'erreur, on continue sans authentification
        next();
    }
}

/**
 * Middleware pour vérifier que l'email est vérifié
 * À utiliser APRÈS authenticateFirebase
 */
export function requireEmailVerified(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({
            error: 'Non autorisé',
            message: 'Authentification requise'
        });
        return;
    }

    if (!req.user.email_verified) {
        res.status(403).json({
            error: 'Email non vérifié',
            message: 'Vous devez vérifier votre email pour accéder à cette ressource'
        });
        return;
    }

    next();
}

/**
 * Middleware pour vérifier les rôles personnalisés (custom claims)
 * À utiliser APRÈS authenticateFirebase
 * 
 * @param allowedRoles - Liste des rôles autorisés
 */
export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user?.firebase) {
            res.status(401).json({
                error: 'Non autorisé',
                message: 'Authentification requise'
            });
            return;
        }

        const userRole = req.user.firebase.role || 'user';

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                error: 'Accès interdit',
                message: `Rôle requis: ${allowedRoles.join(' ou ')}`
            });
            return;
        }

        next();
    };
}

