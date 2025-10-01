import createError from 'http-errors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import usersRouter from './routes/usersRoutes.js';
import rolesRouter from './routes/rolesRoutes.js';
import abonnementsRouter from './routes/abonnementsRoutes.js';
import typesAbonnementRouter from './routes/typesAbonnementRoutes.js';
import historiqueAbonnementsRouter from './routes/historiqueAbonnementsRoutes.js';
import annoncesRouter from './routes/annoncesRoutes.js';
import messagesRouter from './routes/messagesRoutes.js';
import transactionsRouter from './routes/transactionsRoutes.js';
import paiementsRouter from './routes/paiementsRoutes.js';
import evaluationsRouter from './routes/evaluationsRoutes.js';
import historiqueAnnoncesRouter from './routes/historiqueAnnoncesRoutes.js';
import achatsRouter from './routes/achatsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// Configuration du moteur de vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/abonnements', abonnementsRouter);
app.use('/types_abonnement', typesAbonnementRouter);
app.use('/historique_abonnements', historiqueAbonnementsRouter);
app.use('/annonces', annoncesRouter);
app.use('/messages', messagesRouter);
app.use('/transactions', transactionsRouter);
app.use('/paiements', paiementsRouter);
app.use('/evaluations', evaluationsRouter);
app.use('/historique_annonces', historiqueAnnoncesRouter);
app.use('/achats', achatsRouter);

// // Intercepter les erreurs 404 et transférer au gestionnaire d'erreurs
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createError(404));
});

// Gestionnaire d'erreurs centralisé
app.use(errorHandler);

export default app;