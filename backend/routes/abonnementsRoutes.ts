import express from 'express';
import {
    getAllAbonnements,
    getAbonnementById,
    createAbonnement,
    updateAbonnement,
    deleteAbonnement,
    searchAbonnements,
} from '../controllers/abonnementsController.js';

const router = express.Router();

router.get('/', getAllAbonnements);
router.get('/search', searchAbonnements);
router.get('/:id', getAbonnementById);
router.post('/', createAbonnement);
router.patch('/:id', updateAbonnement);
router.delete('/:id', deleteAbonnement);

export default router;
