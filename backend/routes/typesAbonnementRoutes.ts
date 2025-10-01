import express from 'express';
import {
    getAllTypesAbonnement,
    getTypeAbonnementById,
    createTypeAbonnement,
    updateTypeAbonnement,
    deleteTypeAbonnement,
} from '../controllers/typesAbonnementController';

const router = express.Router();

router.get('/types-abonnement', getAllTypesAbonnement);
router.get('/types-abonnement/:id', getTypeAbonnementById);
router.post('/types-abonnement', createTypeAbonnement);
router.patch('/types-abonnement/:id', updateTypeAbonnement);
router.delete('/types-abonnement/:id', deleteTypeAbonnement);

export default router;
