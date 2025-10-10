import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour l'historique des annonces
 * Note: L'historique est en lecture seule (pas de create/update)
 */
export const historiqueAnnonceSchemas = {
    // Schéma de paramètre ID historique
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Schéma de paramètre ID annonce
    annonceParams: Joi.object({
        id_annon: commonSchemas.id
    }),

    // Paramètres de requête pour la recherche d'historiques
    query: Joi.object({
        // Filtres
        id_annon: commonSchemas.id.optional(),
        action_histo: Joi.string().valid('insert', 'update', 'delete').optional()
            .messages({
                'any.only': 'action_histo doit être "insert", "update" ou "delete"'
            }),
        statut: Joi.string().valid('active', 'vendue').optional(),
        prix_min: Joi.number().positive().precision(2).optional(),
        prix_max: Joi.number().positive().precision(2).optional(),
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('id_histo_annon', 'prix', 'datedepart', 'datearrivee', 'datepublication').default('id_histo_annon'),
        sort: Joi.string().valid('asc', 'desc').default('desc')
    }).custom((value, helpers) => {
        // Valider la plage de dates
        if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
            return helpers.error('date.range');
        }
        
        // Valider la plage de prix
        if (value.prix_min && value.prix_max && value.prix_min > value.prix_max) {
            return helpers.error('price.range');
        }
        
        return value;
    }).messages({
        'date.range': 'La date de début doit être antérieure à la date de fin',
        'price.range': 'Le prix minimum doit être inférieur au prix maximum'
    })
};


