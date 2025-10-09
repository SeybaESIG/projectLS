import express from 'express';
import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  searchAnnonces,
} from '../controllers/annoncesController.js';

const router = express.Router();

router.get('/', getAllAnnonces);
router.get('/search', searchAnnonces);
router.get('/:id', getAnnonceById);
router.post('/', createAnnonce);
router.put('/:id', updateAnnonce);
router.delete('/:id', deleteAnnonce);

export default router;