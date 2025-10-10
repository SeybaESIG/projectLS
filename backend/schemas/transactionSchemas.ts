import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les transactions
 */
export const transactionSchemas = {
    // Schéma de création de transaction
    create: Joi.object({
        id_payeur: commonSchemas.id,
        id_receveur: commonSchemas.id,
        id_annon: commonSchemas.id.optional(),
        montant: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Le montant doit être positif',
                'number.precision': 'Le montant doit avoir au maximum 2 décimales'
            }),
        statut: Joi.string().valid('attente', 'validée', 'annulée', 'remboursée').optional().default('attente')
            .messages({
                'any.only': 'Le statut doit être l\'un des suivants : attente, validée, annulée, remboursée'
            }),
        date: commonSchemas.date.optional()
    }).custom((value, helpers) => {
        // Valider que le payeur et le receveur sont différents
        if (value.id_payeur === value.id_receveur) {
            return helpers.error('users.same');
        }
        return value;
    }).messages({
        'users.same': 'Le payeur et le receveur doivent être différents'
    }),

    // Schéma de mise à jour de transaction
    update: Joi.object({
        montant: Joi.number().positive().precision(2).optional(),
        statut: Joi.string().valid('attente', 'validée', 'annulée', 'remboursée').optional(),
        date: commonSchemas.date.optional()
    }).min(1), // Au moins un champ doit être fourni

    // Schéma de paramètre ID transaction
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Paramètres de requête pour la liste des transactions
    query: commonSchemas.pagination.keys({
        payeur: commonSchemas.id.optional(),
        receveur: commonSchemas.id.optional(),
        statut: Joi.string().valid('attente', 'validée', 'annulée', 'remboursée').optional(),
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        minAmount: Joi.number().positive().precision(2).optional(),
        maxAmount: Joi.number().positive().precision(2).optional(),
        sortBy: Joi.string().valid('montant', 'date', 'statut').default('date'),
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
