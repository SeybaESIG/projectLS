import express from 'express';
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../controllers/evaluationsController';

const router = express.Router();

router.get('/evaluations', getAllEvaluations);
router.get('/evaluations/:id', getEvaluationById);
router.post('/evaluations', createEvaluation);
router.put('/evaluations/:id', updateEvaluation);
router.delete('/evaluations/:id', deleteEvaluation);

export default router;