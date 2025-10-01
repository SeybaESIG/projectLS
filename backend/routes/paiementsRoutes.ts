import express from 'express';
import {
  getAllPaiements,
  getPaiementById,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from '../controllers/paiementsController.js';

const router = express.Router();

router.get('/paiements', getAllPaiements);
router.get('/paiements/:id', getPaiementById);
router.post('/paiements', createPaiement);
router.put('/paiements/:id', updatePaiement);
router.delete('/paiements/:id', deletePaiement);

export default router;