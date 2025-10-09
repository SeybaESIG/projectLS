import express from 'express';
import {
    getAllVilles,
    getVilleById
} from '../controllers/villesController.js';

const router = express.Router();

router.get('/', getAllVilles);
router.get('/:id', getVilleById);

export default router;