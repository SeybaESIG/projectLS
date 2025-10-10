import express from 'express';
import {
    getAllEvaluations,
    getEvaluationById,
    createEvaluation,
    deleteEvaluation,
    searchEvaluations,
    getEvaluationsRecues,
    getEvaluationsDonnees,
} from '../controllers/evaluationsController.js';
import { validate } from '../middlewares/validation.js';
import { evaluationSchemas } from '../schemas/evaluationSchemas.js';

const router = express.Router();

router.get('/', validate(evaluationSchemas.query, 'query'), getAllEvaluations);
router.get('/search', validate(evaluationSchemas.query, 'query'), searchEvaluations);
router.get('/recues/:id_util', validate(evaluationSchemas.userParams, 'params'), getEvaluationsRecues);
router.get('/donnees/:id_util', validate(evaluationSchemas.userParams, 'params'), getEvaluationsDonnees);
router.get('/:id_util_donne/:id_util_recoit/:id_transa', validate(evaluationSchemas.params, 'params'), getEvaluationById);
router.post('/', validate(evaluationSchemas.create, 'body'), createEvaluation);
router.delete('/:id_util_donne/:id_util_recoit/:id_transa', validate(evaluationSchemas.params, 'params'), deleteEvaluation);

export default router;
