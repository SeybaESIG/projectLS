import express from 'express';
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../controllers/evaluationsController.js';

const router = express.Router();

router.get('/', getAllEvaluations);
router.get('/:id', getEvaluationById);
router.post('/', createEvaluation);
router.put('/:id', updateEvaluation);
router.delete('/:id', deleteEvaluation);

export default router;