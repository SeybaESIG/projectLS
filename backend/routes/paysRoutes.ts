import express from 'express';
import {
    getAllPays,
    getPaysById,
    searchPaysByName
} from '../controllers/paysController.js';

const router = express.Router();

router.get('/', getAllPays);
router.get('/search', searchPaysByName);
router.get('/:id', getPaysById);

export default router;