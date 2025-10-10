import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les abonnements
 */
export const abonnementSchemas = {
    // Schéma de création d'abonnement
    create: Joi.object({
        id_util: commonSchemas.id,
        id_type_abonnement: commonSchemas.id,
        date_debut: commonSchemas.date.required()
            .messages({
                'any.required': 'La date de début est requise'
            }),
        date_fin: commonSchemas.date.required()
            .messages({
                'any.required': 'La date de fin est requise'
            })
    }).custom((value, helpers) => {
        // Valider que date_fin > date_debut
        if (value.date_debut && value.date_fin && value.date_fin <= value.date_debut) {
            return helpers.error('dates.invalid');
        }
        return value;
    }).messages({
        'dates.invalid': 'La date de fin doit être postérieure à la date de début'
    }),

    // Schéma de mise à jour d'abonnement
    update: Joi.object({
        id_type_abonnement: commonSchemas.id.optional(),
        date_debut: commonSchemas.date.optional(),
        date_fin: commonSchemas.date.optional()
    }).min(1).custom((value, helpers) => {
        // Valider la cohérence des dates si les deux sont fournies
        if (value.date_debut && value.date_fin && value.date_fin <= value.date_debut) {
            return helpers.error('dates.invalid');
        }
        return value;
    }).messages({
        'dates.invalid': 'La date de fin doit être postérieure à la date de début',
        'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
    }),

    // Schéma de paramètre ID abonnement
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Schéma de paramètre ID utilisateur
    userParams: Joi.object({
        id_util: commonSchemas.id
    }),

    // Paramètres de requête pour la recherche et liste
    query: Joi.object({
        // Filtres
        user: Joi.string().optional(), // Username pour recherche
        type: Joi.string().optional(), // Nom type abonnement pour recherche
        status: Joi.string().valid('actif', 'active', 'expiré', 'expire', 'expired').optional()
            .messages({
                'any.only': 'Le statut doit être "actif" ou "expiré"'
            }),
        date_debut_min: commonSchemas.date.optional(),
        date_debut_max: commonSchemas.date.optional(),
        date_fin_min: commonSchemas.date.optional(),
        date_fin_max: commonSchemas.date.optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('id_abonnement', 'date_debut', 'date_fin').default('date_debut'),
        sort: Joi.string().valid('asc', 'desc').default('desc')
    }).custom((value, helpers) => {
        // Valider les plages de dates
        if (value.date_debut_min && value.date_debut_max && value.date_debut_min > value.date_debut_max) {
            return helpers.error('date_debut.range');
        }
        if (value.date_fin_min && value.date_fin_max && value.date_fin_min > value.date_fin_max) {
            return helpers.error('date_fin.range');
        }
        return value;
    }).messages({
        'date_debut.range': 'La date de début minimum doit être antérieure à la date de début maximum',
        'date_fin.range': 'La date de fin minimum doit être antérieure à la date de fin maximum'
    })
};


