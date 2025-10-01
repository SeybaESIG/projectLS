import express from 'express';
import {
  getAllHistoriqueAnnonces,
  getHistoriqueAnnonceById,
  createHistoriqueAnnonce,
  updateHistoriqueAnnonce,
  deleteHistoriqueAnnonce,
} from '../controllers/historiqueAnnoncesController';

const router = express.Router();

router.get('/historique-annonces', getAllHistoriqueAnnonces);
router.get('/historique-annonces/:id', getHistoriqueAnnonceById);
router.post('/historique-annonces', createHistoriqueAnnonce);
router.put('/historique-annonces/:id', updateHistoriqueAnnonce);
router.delete('/historique-annonces/:id', deleteHistoriqueAnnonce);

export default router;