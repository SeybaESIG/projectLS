import express from 'express';
import { createPaymentWithStripe } from '../controllers/paiementsController.js';
import { validate } from '../middlewares/validation.js';
import { paiementSchemas } from '../schemas/paiementSchemas.js';

const router = express.Router();

/**
 * Route pour les utilisateurs authentifiés pour effectuer un paiement via Stripe
 * 
 * POST /api/payer - Créer un PaymentIntent Stripe pour effectuer un paiement
 * 
 * Cette route est accessible aux utilisateurs authentifiés uniquement
 * Elle crée un PaymentIntent Stripe et retourne le client_secret pour finaliser le paiement côté client
 */
router.post('/', validate(paiementSchemas.createPaymentIntent, 'body'), createPaymentWithStripe);

export default router;







