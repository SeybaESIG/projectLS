import express from 'express';
import {
  getAllAchats,
  getAchatById,
  createAchat,
  updateAchat,
  deleteAchat,
} from '../controllers/achatsController.js';

const router = express.Router();

router.get('/achats', getAllAchats);
router.get('/achats/:id', getAchatById);
router.post('/achats', createAchat);
router.put('/achats/:id', updateAchat);
router.delete('/achats/:id', deleteAchat);

export default router;