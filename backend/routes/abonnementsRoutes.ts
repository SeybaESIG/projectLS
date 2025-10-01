import express from 'express';
import {
    getAllAbonnements,
    getAbonnementById,
    createAbonnement,
    updateAbonnement,
    deleteAbonnement,
} from '../controllers/abonnementsController.js';

const router = express.Router();

router.get('/abonnements', getAllAbonnements);
router.get('/abonnements/:id', getAbonnementById);
router.post('/abonnements', createAbonnement);
router.patch('/abonnements/:id', updateAbonnement);
router.delete('/abonnements/:id', deleteAbonnement);

export default router;
