import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';

// Mock Firebase Admin AVANT d'importer les middlewares
const mockVerifyIdToken = jest.fn() as jest.Mock;
jest.unstable_mockModule('../config/firebase.js', () => ({
    auth: {
        get current() {
            return {
                verifyIdToken: mockVerifyIdToken
            };
        }
    },
    firebaseAdmin: {
        get current() {
            return {};
        }
    }
}));

// Importer les middlewares APRÈS avoir mocké Firebase
const { 
    authenticateFirebase, 
    optionalFirebaseAuth, 
    requireEmailVerified, 
    requireRole 
} = await import('../middlewares/firebaseAuth.js');

import type { AuthRequest } from '../middlewares/firebaseAuth.js';

describe('Firebase Authentication Middleware', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        req = {
            headers: {}
        };

        jsonMock = jest.fn() as jest.Mock;
        statusMock = jest.fn().mockReturnValue({ json: jsonMock }) as jest.Mock;

        res = {
            status: statusMock as any,
            json: jsonMock as any
        };

        next = jest.fn() as jest.Mock;
        mockVerifyIdToken.mockClear();
    });

    describe('authenticateFirebase', () => {
        it('devrait rejeter une requête sans header Authorization', async () => {
            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Non autorisé',
                message: expect.stringContaining('Token d\'authentification manquant')
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter un header Authorization sans Bearer', async () => {
            req.headers = { authorization: 'InvalidFormat token123' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter un token vide', async () => {
            req.headers = { authorization: 'Bearer ' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Non autorisé',
                message: 'Token vide'
            });
        });

        it('devrait accepter un token valide et ajouter req.user', async () => {
            const mockDecodedToken = {
                uid: 'user123',
                email: 'test@example.com',
                email_verified: true,
                phone_number: '+33612345678',
                name: 'Test User',
                picture: 'https://example.com/photo.jpg'
            };

            mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
            req.headers = { authorization: 'Bearer valid_token_here' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(mockVerifyIdToken).toHaveBeenCalledWith('valid_token_here');
            expect(req.user).toEqual({
                uid: 'user123',
                email: 'test@example.com',
                email_verified: true,
                phone_number: '+33612345678',
                name: 'Test User',
                picture: 'https://example.com/photo.jpg',
                firebase: mockDecodedToken
            });
            expect(next).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('devrait gérer un token expiré', async () => {
            const error: any = new Error('Token expired');
            error.code = 'auth/id-token-expired';
            mockVerifyIdToken.mockRejectedValue(error);

            req.headers = { authorization: 'Bearer expired_token' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Token expiré',
                message: 'Votre session a expiré. Veuillez vous reconnecter.'
            });
        });

        it('devrait gérer un token invalide', async () => {
            const error: any = new Error('Invalid token');
            error.code = 'auth/argument-error';
            mockVerifyIdToken.mockRejectedValue(error);

            req.headers = { authorization: 'Bearer invalid_token' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Token invalide',
                message: 'Le format du token est incorrect'
            });
        });

        it('devrait gérer une erreur générique', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Unknown error'));
            req.headers = { authorization: 'Bearer some_token' };

            await authenticateFirebase(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Accès interdit',
                message: 'Token invalide ou révoqué'
            });
        });
    });

    describe('optionalFirebaseAuth', () => {
        it('devrait continuer sans erreur si aucun header Authorization', async () => {
            await optionalFirebaseAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('devrait continuer sans erreur si token vide', async () => {
            req.headers = { authorization: 'Bearer ' };

            await optionalFirebaseAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        });

        it('devrait ajouter req.user si token valide', async () => {
            const mockDecodedToken = {
                uid: 'user456',
                email: 'optional@example.com',
                email_verified: false
            };

            mockVerifyIdToken.mockResolvedValue(mockDecodedToken);
            req.headers = { authorization: 'Bearer valid_optional_token' };

            await optionalFirebaseAuth(req as AuthRequest, res as Response, next);

            expect(req.user?.uid).toBe('user456');
            expect(next).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('devrait continuer sans erreur si token invalide', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid'));
            req.headers = { authorization: 'Bearer invalid_optional_token' };

            await optionalFirebaseAuth(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeUndefined();
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe('requireEmailVerified', () => {
        it('devrait rejeter si req.user n\'existe pas', () => {
            requireEmailVerified(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Non autorisé',
                message: 'Authentification requise'
            });
        });

        it('devrait rejeter si email non vérifié', () => {
            req.user = {
                uid: 'user789',
                email: 'test@example.com',
                email_verified: false
            };

            requireEmailVerified(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Email non vérifié',
                message: 'Vous devez vérifier votre email pour accéder à cette ressource'
            });
        });

        it('devrait continuer si email vérifié', () => {
            req.user = {
                uid: 'user789',
                email: 'verified@example.com',
                email_verified: true
            };

            requireEmailVerified(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });
    });

    describe('requireRole', () => {
        it('devrait rejeter si req.user n\'existe pas', () => {
            const middleware = requireRole('admin');
            middleware(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Non autorisé',
                message: 'Authentification requise'
            });
        });

        it('devrait rejeter si rôle non autorisé', () => {
            req.user = {
                uid: 'user999',
                firebase: { role: 'user' }
            };

            const middleware = requireRole('admin', 'moderator');
            middleware(req as AuthRequest, res as Response, next);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Accès interdit',
                message: 'Rôle requis: admin ou moderator'
            });
        });

        it('devrait accepter si rôle autorisé', () => {
            req.user = {
                uid: 'admin123',
                firebase: { role: 'admin' }
            };

            const middleware = requireRole('admin', 'moderator');
            middleware(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(statusMock).not.toHaveBeenCalled();
        });

        it('devrait utiliser "user" comme rôle par défaut', () => {
            req.user = {
                uid: 'user999',
                firebase: {} // Pas de rôle défini
            };

            const middleware = requireRole('user');
            middleware(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
        });

        it('devrait accepter plusieurs rôles', () => {
            req.user = {
                uid: 'mod456',
                firebase: { role: 'moderator' }
            };

            const middleware = requireRole('admin', 'moderator', 'support');
            middleware(req as AuthRequest, res as Response, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

