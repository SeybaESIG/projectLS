import express from 'express';
import {
  getAllHistoriqueAnnonces,
  getHistoriqueAnnonceById,
  createHistoriqueAnnonce,
  updateHistoriqueAnnonce,
  deleteHistoriqueAnnonce,
} from '../controllers/historiqueAnnoncesController.js';

const router = express.Router();

router.get('/', getAllHistoriqueAnnonces);
router.get('/:id', getHistoriqueAnnonceById);
router.post('/', createHistoriqueAnnonce);
router.put('/:id', updateHistoriqueAnnonce);
router.delete('/:id', deleteHistoriqueAnnonce);

export default router;