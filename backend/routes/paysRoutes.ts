import express from 'express';
import {
    getAllPays,
    getPaysById
} from '../controllers/paysController.js';

const router = express.Router();

router.get('/', getAllPays);
router.get('/:id', getPaysById);

export default router;