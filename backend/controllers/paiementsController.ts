import type { Request, Response, NextFunction } from 'express';
import { Paiement, Transaction } from '../models/index.js';
import { Op } from 'sequelize';
import { 
  createPaymentIntent as stripeCreatePaymentIntent,
  retrievePaymentIntent,
  refundPayment,
  constructWebhookEvent,
  eurosToCents,
  centsToEuros
} from '../services/stripeService.js';
import { updateTransactionStatus } from './transactionsController.js';
import type Stripe from 'stripe';

// Récupérer un paiement par son ID
export const getPaiementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id, {
      include: [
        { model: Transaction, attributes: ['id_transa', 'montant', 'statut', 'id_payeur', 'id_receveur'] }
      ]
    });
    
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    res.json(paiement);
  } catch (error) {
    next(error);
  }
};

// Créer un nouveau paiement (manuel, sans Stripe)
export const createPaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPaiement = await Paiement.create(req.body);
    
    // Recharger avec les associations
    const paiementWithAssociations = await Paiement.findByPk(newPaiement.id_paie, {
      include: [
        { model: Transaction, attributes: ['id_transa', 'montant', 'statut', 'id_payeur', 'id_receveur'] }
      ]
    });
    
    // Mettre à jour le statut de la transaction associée
    if (newPaiement.statut === 'validé') {
      await updateTransactionStatus(newPaiement.id_transa);
    }
    
    res.status(201).json(paiementWithAssociations);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un paiement existant
export const updatePaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    const oldStatut = paiement.statut;
    await paiement.update(req.body);
    
    // Si le statut a changé, mettre à jour le statut de la transaction
    if (req.body.statut && req.body.statut !== oldStatut) {
      await updateTransactionStatus(paiement.id_transa);
    }
    
    // Recharger avec les associations
    const updatedPaiement = await Paiement.findByPk(paiement.id_paie, {
      include: [
        { model: Transaction, attributes: ['id_transa', 'montant', 'statut', 'id_payeur', 'id_receveur'] }
      ]
    });
    
    res.json(updatedPaiement);
  } catch (error) {
    next(error);
  }
};

// Supprimer un paiement
export const deletePaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    const id_transa = paiement.id_transa;
    await paiement.destroy();
    
    // Mettre à jour le statut de la transaction après suppression
    await updateTransactionStatus(id_transa);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Rechercher des paiements avec pagination
export const searchPaiements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      sortBy = 'date', 
      order = 'DESC',
      id_transa,
      type,
      statut,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount
    } = req.query;
    
    const whereClause: any = {};
    
    // Filtres
    if (id_transa) {
      whereClause.id_transa = Number(id_transa);
    }
    if (type) {
      whereClause.type = type;
    }
    if (statut) {
      whereClause.statut = statut;
    }
    
    // Recherche par date (fourchette)
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.date[Op.lte] = new Date(dateTo as string);
      }
    }
    
    // Recherche par montant (fourchette)
    if (minAmount || maxAmount) {
      whereClause.montant = {};
      if (minAmount) {
        whereClause.montant[Op.gte] = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        whereClause.montant[Op.lte] = parseFloat(maxAmount as string);
      }
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const { count, rows: paiements } = await Paiement.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [[sortBy as string, order as string]],
      include: [
        { model: Transaction, attributes: ['id_transa', 'montant', 'statut', 'id_payeur', 'id_receveur'] }
      ]
    });
    
    res.json({
      data: paiements,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un PaymentIntent Stripe et enregistrer le paiement en attente
 * Cette fonction est appelée par le frontend pour initier un paiement
 */
export const createPaymentWithStripe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_transa, montant, currency = 'eur' } = req.body;
    
    // Vérifier que la transaction existe
    const transaction = await Transaction.findByPk(id_transa);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction introuvable' });
    }
    
    // Convertir le montant en centimes pour Stripe
    const amountInCents = eurosToCents(montant);
    
    // Créer le PaymentIntent Stripe
    const paymentIntent = await stripeCreatePaymentIntent(amountInCents, currency, {
      id_transa: id_transa.toString(),
      montant: montant.toString()
    });
    
    // Créer le paiement en BDD avec statut "attente"
    const paiement = await Paiement.create({
      id_transa,
      montant,
      type: 'carte',
      statut: 'attente',
      stripe_payment_intent_id: paymentIntent.id
    });
    
    // Retourner le client_secret pour le frontend
    res.status(201).json({
      paiement,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement Stripe:', error);
    next(error);
  }
};

/**
 * Gérer les webhooks Stripe
 * Cette fonction est appelée par Stripe pour notifier les événements de paiement
 */
export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET non configuré');
      return res.status(500).json({ message: 'Configuration webhook manquante' });
    }
    
    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error('Erreur de vérification de la signature webhook:', err);
      return res.status(400).json({ message: 'Signature webhook invalide' });
    }
    
    // Gérer les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Trouver le paiement associé
        const paiement = await Paiement.findOne({
          where: { stripe_payment_intent_id: paymentIntent.id }
        });
        
        if (paiement) {
          // Mettre à jour le statut du paiement
          await paiement.update({
            statut: 'validé',
            stripe_charge_id: paymentIntent.latest_charge as string || null
          });
          
          // Mettre à jour le statut de la transaction
          await updateTransactionStatus(paiement.id_transa);
          
          console.log(`Paiement ${paiement.id_paie} validé (PaymentIntent ${paymentIntent.id})`);
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Trouver le paiement associé
        const paiement = await Paiement.findOne({
          where: { stripe_payment_intent_id: paymentIntent.id }
        });
        
        if (paiement) {
          // Mettre à jour le statut du paiement
          await paiement.update({ statut: 'annulé' });
          
          // Mettre à jour le statut de la transaction
          await updateTransactionStatus(paiement.id_transa);
          
          console.log(`Paiement ${paiement.id_paie} échoué (PaymentIntent ${paymentIntent.id})`);
        }
        break;
      }
      
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Trouver le paiement associé via stripe_charge_id
        const paiement = await Paiement.findOne({
          where: { stripe_charge_id: charge.id }
        });
        
        if (paiement) {
          // Mettre à jour le statut du paiement
          await paiement.update({ statut: 'remboursé' });
          
          // Mettre à jour le statut de la transaction
          await updateTransactionStatus(paiement.id_transa);
          
          console.log(`Paiement ${paiement.id_paie} remboursé (Charge ${charge.id})`);
        }
        break;
      }
      
      default:
        console.log(`Événement webhook non géré: ${event.type}`);
    }
    
    // Répondre à Stripe
    res.json({ received: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    next(error);
  }
};
