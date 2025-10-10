import express from 'express';
import {
    getAllTypesAbonnement,
    getTypeAbonnementById,
    createTypeAbonnement,
    updateTypeAbonnement,
    deleteTypeAbonnement,
    searchTypesAbonnement,
} from '../controllers/typesAbosController.js';
import { validate } from '../middlewares/validation.js';
import { typeAbonnementSchemas } from '../schemas/typeAbonnementSchemas.js';

const router = express.Router();

router.get('/', validate(typeAbonnementSchemas.query, 'query'), getAllTypesAbonnement);
router.get('/search', validate(typeAbonnementSchemas.query, 'query'), searchTypesAbonnement);
router.get('/:id', validate(typeAbonnementSchemas.params, 'params'), getTypeAbonnementById);
router.post('/', validate(typeAbonnementSchemas.create, 'body'), createTypeAbonnement);
router.patch('/:id', validate(typeAbonnementSchemas.params, 'params'), validate(typeAbonnementSchemas.update, 'body'), updateTypeAbonnement);
router.delete('/:id', validate(typeAbonnementSchemas.params, 'params'), deleteTypeAbonnement);

export default router;
