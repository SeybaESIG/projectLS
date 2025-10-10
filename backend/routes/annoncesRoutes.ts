import express from 'express';
import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  searchAnnonces,
} from '../controllers/annoncesController.js';
import { validate } from '../middlewares/validation.js';
import { annonceSchemas } from '../schemas/annonceSchemas.js';

const router = express.Router();

router.get('/', getAllAnnonces);
router.get('/search', searchAnnonces);
router.get('/:id', validate(annonceSchemas.params, 'params'), getAnnonceById);
router.post('/', validate(annonceSchemas.create, 'body'), createAnnonce);
router.patch('/:id', validate(annonceSchemas.params, 'params'), validate(annonceSchemas.update, 'body'), updateAnnonce);
router.delete('/:id', validate(annonceSchemas.params, 'params'), deleteAnnonce);

export default router;