/**
 * Charger les variables d'environnement EN PREMIER
 * Essentiel pour Firebase et autres services
 */
import './init.js';

import createError from 'http-errors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticateFirebase, optionalFirebaseAuth, requireRole } from './middlewares/firebaseAuth.js';
import { rateLimitPublic, rateLimitAuth, rateLimitAdmin, rateLimitUpload } from './middlewares/rateLimiter.js';
import { cacheMiddleware, cacheKeys } from './middlewares/cache.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swagger.js';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';

import indexRouter from './routes/index.js';
import webhookRouter from './routes/webhookRoutes.js';
import meRouter from './routes/meRoutes.js';
import payerRouter from './routes/payerRoutes.js';
import usersRouter from './routes/usersRoutes.js';
import rolesRouter from './routes/rolesRoutes.js';
import paysRouter from './routes/paysRoutes.js';
import villesRouter from './routes/villesRoutes.js';
import aeroportsRouter from './routes/aeroportsRoutes.js';
import abonnementsRouter from './routes/abonnementsRoutes.js';
import typesAbonnementRouter from './routes/typesAbonnementRoutes.js';
import historiqueAbonnementsRouter from './routes/historiqueAbonnementsRoutes.js';
import annoncesRouter from './routes/annoncesRoutes.js';
import messagesRouter from './routes/messagesRoutes.js';
import msgLecturesRouter from './routes/msgLecturesRoutes.js';
import transactionsRouter from './routes/transactionsRoutes.js';
import paiementsRouter from './routes/paiementsRoutes.js';
import evaluationsRouter from './routes/evaluationsRoutes.js';
import historiqueAnnoncesRouter from './routes/historiqueAnnoncesRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Configuration du moteur de vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ========================================
// MIDDLEWARES DE SÉCURITÉ
// ========================================

// 1️⃣ Helmet - Sécurisation des headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: true
    }
}));

// 2️⃣ Configuration CORS
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Liste blanche des origines autorisées
        const allowedOrigins = process.env.FRONTEND_URL 
            ? process.env.FRONTEND_URL.split(',') 
            : ['http://localhost:3000', 'http://localhost:3001'];
        
        // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight 24h
};

app.use(cors(corsOptions));

// 3️⃣ Protection contre les injections NoSQL
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`⚠️  Tentative d'injection détectée : ${key} dans ${req.path}`);
    }
}));

// ========================================
// MIDDLEWARES STANDARDS
// ========================================

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4️⃣ Compression des réponses (gzip/brotli)
app.use(compression({
    // Compresse seulement les réponses > 1KB
    threshold: 1024,
    // Niveau de compression (0-9, 6 = bon compromis vitesse/taille)
    level: 6,
    // Filtre : Ne pas compresser les images déjà compressées
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// 📚 DOCUMENTATION API (Swagger/OpenAPI)
// ========================================
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation - Backend',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
    }
}));

// Route pour télécharger la spec OpenAPI en JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ========================================
// 1️⃣ ROUTES PUBLIQUES (sans authentification)
// ========================================
app.use('/', indexRouter);

// Webhook Stripe (DOIT être avant authenticateFirebase et sans rate limit)
app.use('/api/webhook', webhookRouter);

// Routes publiques avec auth optionnelle + rate limiting public
app.use('/api/pays', rateLimitPublic, optionalFirebaseAuth, paysRouter);
app.use('/api/villes', rateLimitPublic, optionalFirebaseAuth, villesRouter);
app.use('/api/aeroports', rateLimitPublic, optionalFirebaseAuth, aeroportsRouter);
app.use('/api/annonces', rateLimitPublic, optionalFirebaseAuth, annoncesRouter);  // Lecture publique, CRUD nécessite auth

// ========================================
// 2️⃣ ROUTES UTILISATEURS AUTHENTIFIÉS (token Firebase requis)
// ========================================
app.use(authenticateFirebase); // ✅ Authentification Firebase obligatoire pour toutes les routes suivantes
app.use(rateLimitAuth); // ✅ Rate limiting pour utilisateurs authentifiés (300 req/15min)

// Routes accessibles à tous les utilisateurs authentifiés
// Chaque controller doit vérifier que l'utilisateur accède SEULEMENT à ses propres données

// Profil personnel
app.use('/api/me', meRouter);

// Messages (filtrés par utilisateur connecté)
app.use('/api/messages', messagesRouter);
app.use('/api/msg_lectures', msgLecturesRouter);

// Évaluations (filtrées par utilisateur connecté)
app.use('/api/evaluations', evaluationsRouter);

// Abonnements (gestion de son propre abonnement)
app.use('/api/abonnements', abonnementsRouter);

// Paiements (effectuer un paiement uniquement)
app.use('/api/payer', payerRouter);

// Upload (pour son profil/annonces uniquement) - Rate limit spécifique
app.use('/api/upload', rateLimitUpload, uploadRouter);

// ========================================
// 3️⃣ ROUTES ADMIN UNIQUEMENT (rôle admin requis)
// ========================================
// Routes accessibles uniquement aux administrateurs
// Rate limit plus élevé pour les admins (1000 req/15min)

// Gestion complète des utilisateurs
app.use('/api/users', rateLimitAdmin, requireRole('admin'), usersRouter);

// Gestion complète des rôles
app.use('/api/roles', rateLimitAdmin, requireRole('admin'), rolesRouter);

// Gestion complète des transactions
app.use('/api/transactions', rateLimitAdmin, requireRole('admin'), transactionsRouter);

// Gestion complète des paiements
app.use('/api/paiements', rateLimitAdmin, requireRole('admin'), paiementsRouter);

// Gestion des types d'abonnements
app.use('/api/types_abonnement', rateLimitAdmin, requireRole('admin'), typesAbonnementRouter);

// Historiques complets
app.use('/api/historique_abonnements', rateLimitAdmin, requireRole('admin'), historiqueAbonnementsRouter);
app.use('/api/historique_annonces', rateLimitAdmin, requireRole('admin'), historiqueAnnoncesRouter);

// // Intercepter les erreurs 404 et transférer au gestionnaire d'erreurs
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// Gestionnaire d'erreurs centralisé
app.use(errorHandler);

export default app;