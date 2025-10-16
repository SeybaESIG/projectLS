import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les paiements
 */
export const paiementSchemas = {
    // Schéma de création de paiement
    create: Joi.object({
        id_transa: commonSchemas.id,
        montant: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Le montant doit être positif',
                'number.precision': 'Le montant doit avoir au maximum 2 décimales',
                'any.required': 'Le montant est requis'
            }),
        type: Joi.string().valid('carte', 'virement', 'especes', 'autre').required()
            .messages({
                'any.only': 'Le type doit être l\'un des suivants : carte, virement, especes, autre',
                'any.required': 'Le type de paiement est requis'
            }),
        statut: Joi.string().valid('attente', 'validé', 'annulé', 'remboursé').optional().default('attente')
            .messages({
                'any.only': 'Le statut doit être l\'un des suivants : attente, validé, annulé, remboursé'
            }),
        date: commonSchemas.date.optional()
    }),

    // Schéma de mise à jour de paiement
    update: Joi.object({
        montant: Joi.number().positive().precision(2).optional(),
        type: Joi.string().valid('carte', 'virement', 'especes', 'autre').optional(),
        statut: Joi.string().valid('attente', 'validé', 'annulé', 'remboursé').optional(),
        date: commonSchemas.date.optional()
    }).min(1), // Au moins un champ doit être fourni

    // Schéma de paramètre ID paiement
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Schéma pour la création d'un PaymentIntent Stripe
    createPaymentIntent: Joi.object({
        id_transa: commonSchemas.id,
        montant: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Le montant doit être positif',
                'number.precision': 'Le montant doit avoir au maximum 2 décimales',
                'any.required': 'Le montant est requis'
            }),
        currency: Joi.string().length(3).default('eur').optional()
            .messages({
                'string.length': 'La devise doit être un code ISO à 3 lettres (ex: eur, usd)'
            })
    }),

    // Paramètres de requête pour la liste des paiements
    query: commonSchemas.pagination.keys({
        id_transa: commonSchemas.id.optional(),
        type: Joi.string().valid('carte', 'virement', 'especes', 'autre').optional(),
        statut: Joi.string().valid('attente', 'validé', 'annulé', 'remboursé').optional(),
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        minAmount: Joi.number().positive().precision(2).optional(),
        maxAmount: Joi.number().positive().precision(2).optional(),
        sortBy: Joi.string().valid('montant', 'date', 'statut', 'type').default('date'),
        order: Joi.string().valid('ASC', 'DESC').default('DESC')
    }).custom((value, helpers) => {
        // Valider la plage de dates
        if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
            return helpers.error('date.range');
        }
        
        // Valider la plage de montants
        if (value.minAmount && value.maxAmount && value.minAmount > value.maxAmount) {
            return helpers.error('amount.range');
        }
        
        return value;
    }).messages({
        'date.range': 'La date de début doit être antérieure à la date de fin',
        'amount.range': 'Le montant minimum doit être inférieur au montant maximum'
    })
};




