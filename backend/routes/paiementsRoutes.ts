import express from 'express';
import {
  getPaiementById,
  createPaiement,
  updatePaiement,
  deletePaiement,
  searchPaiements,
} from '../controllers/paiementsController.js';
import { validate } from '../middlewares/validation.js';
import { paiementSchemas } from '../schemas/paiementSchemas.js';

const router = express.Router();

/**
 * Routes ADMIN uniquement pour la gestion complète des paiements
 * Le webhook Stripe est maintenant dans webhookRoutes.ts
 * La route pour payer est dans payerRoutes.ts
 */

// Routes protégées ADMIN (avec validation)
router.get('/', validate(paiementSchemas.query, 'query'), searchPaiements);
router.get('/:id', validate(paiementSchemas.params, 'params'), getPaiementById);
router.post('/', validate(paiementSchemas.create, 'body'), createPaiement);
router.patch('/:id', validate(paiementSchemas.params, 'params'), validate(paiementSchemas.update, 'body'), updatePaiement);
router.delete('/:id', validate(paiementSchemas.params, 'params'), deletePaiement);

export default router;
