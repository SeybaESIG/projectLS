import express from 'express';
import { handleStripeWebhook } from '../controllers/paiementsController.js';

const router = express.Router();

/**
 * Webhook Stripe - Route publique (sans authentification)
 * Cette route doit être accessible par les serveurs Stripe
 * 
 * POST /api/webhook/stripe - Recevoir les événements Stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;







