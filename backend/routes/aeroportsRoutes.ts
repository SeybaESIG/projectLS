import express from 'express';
import {
    getAllAeroports,
    getAeroportById,
    searchAeroport
} from '../controllers/aeroportsController.js';

const router = express.Router();

router.get('/', getAllAeroports);
router.get('/search', searchAeroport);
router.get('/:id', getAeroportById);

export default router;

/*
Additional route for external API call
import { getExternalAeroport } from '../controllers/aeroportsController.js';
router.get('/external', getExternalAeroport); // GET /api/aeroports/external?iata_code=CDG
 */