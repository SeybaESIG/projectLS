import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les types d'abonnement
 */
export const typeAbonnementSchemas = {
    // Schéma de création de type d'abonnement
    create: Joi.object({
        nom_type: Joi.string().trim().min(3).max(100).required()
            .messages({
                'string.min': 'Le nom du type doit contenir au moins 3 caractères',
                'string.max': 'Le nom du type ne doit pas dépasser 100 caractères',
                'any.required': 'Le nom du type est requis'
            }),
        prix: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Le prix doit être positif',
                'number.precision': 'Le prix doit avoir au maximum 2 décimales',
                'any.required': 'Le prix est requis'
            }),
        duree_mois: Joi.number().integer().min(1).required()
            .messages({
                'number.min': 'La durée doit être d\'au moins 1 mois',
                'number.integer': 'La durée doit être un nombre entier',
                'any.required': 'La durée est requise'
            }),
        description: Joi.string().allow(null, '').optional()
    }),

    // Schéma de mise à jour de type d'abonnement
    update: Joi.object({
        nom_type: Joi.string().trim().min(3).max(100).optional(),
        prix: Joi.number().positive().precision(2).optional(),
        duree_mois: Joi.number().integer().min(1).optional(),
        description: Joi.string().allow(null, '').optional()
    }).min(1).messages({
        'object.min': 'Au moins un champ doit être fourni pour la mise à jour'
    }),

    // Schéma de paramètre ID type abonnement
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Paramètres de requête pour la recherche et liste
    query: Joi.object({
        // Filtres
        nom_type: Joi.string().optional(),
        prix_min: Joi.number().positive().precision(2).optional(),
        prix_max: Joi.number().positive().precision(2).optional(),
        duree_min: Joi.number().integer().min(1).optional(),
        duree_max: Joi.number().integer().min(1).optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('id_type_abonnement', 'nom_type', 'prix', 'duree_mois').default('id_type_abonnement'),
        sort: Joi.string().valid('asc', 'desc').default('asc')
    }).custom((value, helpers) => {
        // Valider la plage de prix
        if (value.prix_min && value.prix_max && value.prix_min > value.prix_max) {
            return helpers.error('price.range');
        }
        
        // Valider la plage de durée
        if (value.duree_min && value.duree_max && value.duree_min > value.duree_max) {
            return helpers.error('duration.range');
        }
        
        return value;
    }).messages({
        'price.range': 'Le prix minimum doit être inférieur au prix maximum',
        'duration.range': 'La durée minimum doit être inférieure à la durée maximum'
    })
};


