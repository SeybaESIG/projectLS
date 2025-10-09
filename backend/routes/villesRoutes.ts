import express from 'express';
import {
    getAllVilles,
    getVilleById,
    searchVille
} from '../controllers/villesController.js';

const router = express.Router();

router.get('/', getAllVilles);
router.get('/search', searchVille);
router.get('/:id', getVilleById);

export default router;