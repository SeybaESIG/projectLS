import express from 'express';
import {
    getAllAbonnements,
    getAbonnementById,
    createAbonnement,
    updateAbonnement,
    deleteAbonnement,
    searchAbonnements,
    getAbonnementByUser,
} from '../controllers/abonnementsController.js';
import { validate } from '../middlewares/validation.js';
import { abonnementSchemas } from '../schemas/abonnementSchemas.js';

const router = express.Router();

router.get('/', validate(abonnementSchemas.query, 'query'), getAllAbonnements);
router.get('/search', validate(abonnementSchemas.query, 'query'), searchAbonnements);
router.get('/user/:id_util', validate(abonnementSchemas.userParams, 'params'), getAbonnementByUser);
router.get('/:id', validate(abonnementSchemas.params, 'params'), getAbonnementById);
router.post('/', validate(abonnementSchemas.create, 'body'), createAbonnement);
router.patch('/:id', validate(abonnementSchemas.params, 'params'), validate(abonnementSchemas.update, 'body'), updateAbonnement);
router.delete('/:id', validate(abonnementSchemas.params, 'params'), deleteAbonnement);

export default router;
