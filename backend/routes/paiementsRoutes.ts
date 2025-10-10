import express from 'express';
import {
  getAllPaiements,
  getPaiementById,
  createPaiement,
  updatePaiement,
  deletePaiement,
  searchPaiements,
} from '../controllers/paiementsController.js';

const router = express.Router();

router.get('/', getAllPaiements);
router.get('/search', searchPaiements);
router.get('/:id', getPaiementById);
router.post('/', createPaiement);
router.put('/:id', updatePaiement);
router.delete('/:id', deletePaiement);

export default router;