import express from 'express';
import {
    getAllHistoriqueAbonnements,
    getHistoriqueAbonnementById,
    getHistoriqueByType,
    searchHistorique,
} from '../controllers/historiqueAbonnementsController.js';
import { validate } from '../middlewares/validation.js';
import { historiqueAbonnementSchemas } from '../schemas/historiqueAbonnementSchemas.js';

const router = express.Router();

// Routes de lecture uniquement (l'historique est créé automatiquement et est read-only)
router.get('/', validate(historiqueAbonnementSchemas.query, 'query'), getAllHistoriqueAbonnements);
router.get('/search', validate(historiqueAbonnementSchemas.query, 'query'), searchHistorique);
router.get('/type/:id_type_abonnement', validate(historiqueAbonnementSchemas.typeParams, 'params'), getHistoriqueByType);
router.get('/:id', validate(historiqueAbonnementSchemas.params, 'params'), getHistoriqueAbonnementById);

export default router;
