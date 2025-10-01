import express from 'express';
import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
} from '../controllers/annoncesController';

const router = express.Router();

router.get('/annonces', getAllAnnonces);
router.get('/annonces/:id', getAnnonceById);
router.post('/annonces', createAnnonce);
router.put('/annonces/:id', updateAnnonce);
router.delete('/annonces/:id', deleteAnnonce);

export default router;