import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les évaluations
 */
export const evaluationSchemas = {
    // Schéma de création d'évaluation
    // Note: id_util_donne est optionnel car le controller le force automatiquement à l'utilisateur connecté
    create: Joi.object({
        id_util_donne: commonSchemas.id.optional(),  // Optionnel car forcé par le controller
        id_util_recoit: commonSchemas.id,
        id_transa: commonSchemas.id,
        note: Joi.number().min(0).max(5).required().custom((value, helpers) => {
                // Vérifier qu'il y a au maximum 1 décimale
                const decimalPlaces = (value.toString().split('.')[1] || '').length;
                if (decimalPlaces > 1) {
                    return helpers.error('note.precision');
                }
                return value;
            }).messages({
                'number.min': 'La note doit être au minimum 0',
                'number.max': 'La note doit être au maximum 5',
                'note.precision': 'La note doit avoir au maximum 1 décimale',
                'any.required': 'La note est requise'
            }),
        commentaire: Joi.string().max(100).allow(null, '').optional()
            .messages({
                'string.max': 'Le commentaire ne doit pas dépasser 100 caractères'
            })
    }).custom((value, helpers) => {
        // Valider que celui qui donne et celui qui reçoit sont différents
        if (value.id_util_donne === value.id_util_recoit) {
            return helpers.error('users.same');
        }
        return value;
    }).messages({
        'users.same': 'Un utilisateur ne peut pas s\'évaluer lui-même'
    }),

    // Schéma de paramètres (clé composite)
    params: Joi.object({
        id_util_donne: commonSchemas.id,
        id_util_recoit: commonSchemas.id,
        id_transa: commonSchemas.id
    }),

    // Schéma de paramètre ID utilisateur
    userParams: Joi.object({
        id_util: commonSchemas.id
    }),

    // Paramètres de requête pour la recherche et liste
    query: Joi.object({
        // Filtres
        user_donne: Joi.string().optional(), // Username de celui qui donne la note
        user_recoit: Joi.string().optional(), // Username de celui qui reçoit
        id_util_donne: commonSchemas.id.optional(),
        id_util_recoit: commonSchemas.id.optional(),
        note_min: Joi.number().min(0).max(5).optional(),
        note_max: Joi.number().min(0).max(5).optional(),
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('note', 'date').default('date'),
        sort: Joi.string().valid('asc', 'desc').default('desc')
    }).custom((value, helpers) => {
        // Valider la plage de notes
        if (value.note_min && value.note_max && value.note_min > value.note_max) {
            return helpers.error('note.range');
        }
        
        // Valider la plage de dates
        if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
            return helpers.error('date.range');
        }
        
        return value;
    }).messages({
        'note.range': 'La note minimum doit être inférieure à la note maximum',
        'date.range': 'La date de début doit être antérieure à la date de fin'
    })
};

