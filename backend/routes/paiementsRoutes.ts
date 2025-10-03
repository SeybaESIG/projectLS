import express from 'express';
import {
  getAllPaiements,
  getPaiementById,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from '../controllers/paiementsController.js';

const router = express.Router();

router.get('/', getAllPaiements);
router.get('/:id', getPaiementById);
router.post('/', createPaiement);
router.put('/:id', updatePaiement);
router.delete('/:id', deletePaiement);

export default router;