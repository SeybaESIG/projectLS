import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète (uniquement si configuré)
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover' as any,
  });
}

/**
 * Créer un PaymentIntent Stripe
 * @param amount Montant en centimes (ex: 10050 pour 100.50€)
 * @param currency Devise (ex: 'eur', 'usd')
 * @param metadata Métadonnées supplémentaires (ex: id_transa, id_payeur, etc.)
 * @returns PaymentIntent Stripe
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    throw error;
  }
}

/**
 * Récupérer un PaymentIntent Stripe
 * @param paymentIntentId ID du PaymentIntent
 * @returns PaymentIntent Stripe
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la récupération du PaymentIntent:', error);
    throw error;
  }
}

/**
 * Confirmer un PaymentIntent Stripe (pour les paiements côté serveur)
 * @param paymentIntentId ID du PaymentIntent
 * @returns PaymentIntent confirmé
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de la confirmation du PaymentIntent:', error);
    throw error;
  }
}

/**
 * Rembourser un paiement Stripe
 * @param chargeId ID du Charge ou PaymentIntent
 * @param amount Montant à rembourser en centimes (optionnel, remboursement total par défaut)
 * @returns Refund Stripe
 */
export async function refundPayment(
  chargeId: string,
  amount?: number
): Promise<Stripe.Refund> {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const refundOptions: Stripe.RefundCreateParams = {
      payment_intent: chargeId,
    };
    
    if (amount) {
      refundOptions.amount = amount;
    }
    
    const refund = await stripe.refunds.create(refundOptions);
    return refund;
  } catch (error) {
    console.error('Erreur lors du remboursement:', error);
    throw error;
  }
}

/**
 * Annuler un PaymentIntent Stripe
 * @param paymentIntentId ID du PaymentIntent
 * @returns PaymentIntent annulé
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur lors de l\'annulation du PaymentIntent:', error);
    throw error;
  }
}

/**
 * Vérifier la signature d'un webhook Stripe
 * @param payload Corps de la requête brut
 * @param signature Signature Stripe (header stripe-signature)
 * @param webhookSecret Secret du webhook
 * @returns Événement Stripe vérifié
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    if (!stripe) {
      throw new Error('Stripe n\'est pas configuré. Veuillez ajouter STRIPE_SECRET_KEY dans .env');
    }
    
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Erreur lors de la vérification du webhook:', error);
    throw error;
  }
}

/**
 * Convertir un montant en euros vers des centimes
 * @param amount Montant en euros (ex: 100.50)
 * @returns Montant en centimes (ex: 10050)
 */
export function eurosToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convertir un montant en centimes vers des euros
 * @param amount Montant en centimes (ex: 10050)
 * @returns Montant en euros (ex: 100.50)
 */
export function centsToEuros(amount: number): number {
  return amount / 100;
}

export default stripe;

