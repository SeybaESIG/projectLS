import express from 'express';
import {
    getAllTypesAbonnement,
    getTypeAbonnementById,
    createTypeAbonnement,
    updateTypeAbonnement,
    deleteTypeAbonnement,
} from '../controllers/typesAbosController.js';

const router = express.Router();

router.get('/', getAllTypesAbonnement);
router.get('/:id', getTypeAbonnementById);
router.post('/', createTypeAbonnement);
router.patch('/:id', updateTypeAbonnement);
router.delete('/:id', deleteTypeAbonnement);

export default router;
