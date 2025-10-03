import express from 'express';
import {
    getAllHistoriqueAbonnements,
    getHistoriqueAbonnementById,
    createHistoriqueAbonnement,
    updateHistoriqueAbonnement,
    deleteHistoriqueAbonnement,
} from '../controllers/historiqueAbonnementsController.js';

const router = express.Router();

router.get('/', getAllHistoriqueAbonnements);
router.get('/:id', getHistoriqueAbonnementById);
router.post('/', createHistoriqueAbonnement);
router.put('/:id', updateHistoriqueAbonnement);
router.delete('/:id', deleteHistoriqueAbonnement);

export default router;