import express from 'express';
import {
    getAllAbonnements,
    getAbonnementById,
    createAbonnement,
    updateAbonnement,
    deleteAbonnement,
} from '../controllers/abonnementsController.js';

const router = express.Router();

router.get('/', getAllAbonnements);
router.get('/:id', getAbonnementById);
router.post('/', createAbonnement);
router.patch('/:id', updateAbonnement);
router.delete('/:id', deleteAbonnement);

export default router;
