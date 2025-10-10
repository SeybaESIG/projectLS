import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour l'historique des abonnements
 * Note: L'historique est en lecture seule (pas de create/update)
 */
export const historiqueAbonnementSchemas = {
    // Schéma de paramètre ID historique
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Schéma de paramètre ID type abonnement
    typeParams: Joi.object({
        id_type_abonnement: commonSchemas.id
    }),

    // Paramètres de requête pour la recherche d'historiques
    query: Joi.object({
        // Filtres
        id_type_abonnement: commonSchemas.id.optional(),
        action_histo: Joi.string().valid('insert', 'update', 'delete').optional()
            .messages({
                'any.only': 'action_histo doit être "insert", "update" ou "delete"'
            }),
        nom_type: Joi.string().optional(),
        prix_min: Joi.number().positive().precision(2).optional(),
        prix_max: Joi.number().positive().precision(2).optional(),
        duree_min: Joi.number().integer().min(1).optional(),
        duree_max: Joi.number().integer().min(1).optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('id_histo_abo', 'prix', 'duree_mois', 'nom_type').default('id_histo_abo'),
        sort: Joi.string().valid('asc', 'desc').default('desc')
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


