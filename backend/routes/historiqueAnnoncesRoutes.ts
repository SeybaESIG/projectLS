import express from 'express';
import {
  getAllHistoriqueAnnonces,
  getHistoriqueAnnonceById,
  getHistoriqueByAnnonce,
  searchHistorique,
} from '../controllers/historiqueAnnoncesController.js';
import { validate } from '../middlewares/validation.js';
import { historiqueAnnonceSchemas } from '../schemas/historiqueAnnonceSchemas.js';

const router = express.Router();

// Routes de lecture uniquement (l'historique est créé automatiquement et est read-only)
router.get('/', validate(historiqueAnnonceSchemas.query, 'query'), getAllHistoriqueAnnonces);
router.get('/search', validate(historiqueAnnonceSchemas.query, 'query'), searchHistorique);
router.get('/annonce/:id_annon', validate(historiqueAnnonceSchemas.annonceParams, 'params'), getHistoriqueByAnnonce);
router.get('/:id', validate(historiqueAnnonceSchemas.params, 'params'), getHistoriqueAnnonceById);

export default router;
