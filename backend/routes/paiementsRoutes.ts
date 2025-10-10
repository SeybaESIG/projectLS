import express from 'express';
import {
  getPaiementById,
  createPaiement,
  updatePaiement,
  deletePaiement,
  searchPaiements,
  createPaymentWithStripe,
  handleStripeWebhook,
} from '../controllers/paiementsController.js';
import { validate } from '../middlewares/validation.js';
import { paiementSchemas } from '../schemas/paiementSchemas.js';

const router = express.Router();

// Routes publiques (sans authentification pour le webhook Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Routes protégées (avec validation)
router.get('/', validate(paiementSchemas.query, 'query'), searchPaiements);
router.get('/:id', validate(paiementSchemas.params, 'params'), getPaiementById);
router.post('/', validate(paiementSchemas.create, 'body'), createPaiement);
router.post('/create-payment-intent', validate(paiementSchemas.createPaymentIntent, 'body'), createPaymentWithStripe);
router.patch('/:id', validate(paiementSchemas.params, 'params'), validate(paiementSchemas.update, 'body'), updatePaiement);
router.delete('/:id', validate(paiementSchemas.params, 'params'), deletePaiement);

export default router;
