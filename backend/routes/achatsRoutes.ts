import express from 'express';
import {
  getAllAchats,
  getAchatById,
  createAchat,
  updateAchat,
  deleteAchat,
} from '../controllers/achatsController.js';

const router = express.Router();

router.get('/', getAllAchats);
router.get('/:id_util/:id_annon', getAchatById);
router.post('/', createAchat);
router.put('/:id_util/:id_annon', updateAchat);
router.delete('/:id_util/:id_annon', deleteAchat);

export default router;