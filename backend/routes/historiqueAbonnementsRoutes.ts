import express from 'express';
import {
    getAllHistoriqueAbonnements,
    getHistoriqueAbonnementById,
    createHistoriqueAbonnement,
    updateHistoriqueAbonnement,
    deleteHistoriqueAbonnement,
} from '../controllers/historiqueAbonnementsController';

const router = express.Router();

router.get('/historique-abonnements', getAllHistoriqueAbonnements);
router.get('/historique-abonnements/:id', getHistoriqueAbonnementById);
router.post('/historique-abonnements', createHistoriqueAbonnement);
router.put('/historique-abonnements/:id', updateHistoriqueAbonnement);
router.delete('/historique-abonnements/:id', deleteHistoriqueAbonnement);

export default router;