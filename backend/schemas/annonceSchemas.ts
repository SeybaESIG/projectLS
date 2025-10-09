import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les annonces
 */
export const annonceSchemas = {
    // Schéma de création d'annonce
    create: Joi.object({
        id_util: commonSchemas.id,
        id_ville_dep: commonSchemas.id,
        id_aerodep: commonSchemas.id,
        id_ville_arr: commonSchemas.id,
        id_aeroarr: commonSchemas.id,
        description: Joi.string().min(10).max(1000).optional()
            .messages({
                'string.min': 'La description doit contenir au moins 10 caractères',
                'string.max': 'La description ne doit pas dépasser 1000 caractères'
            }),
        prix: Joi.number().positive().precision(2).required()
            .messages({
                'number.positive': 'Le prix doit être positif',
                'number.precision': 'Le prix doit avoir au maximum 2 décimales'
            }),
        datedepart: commonSchemas.date.required(),
        datearrivee: commonSchemas.date.required(),
        titre: Joi.string().min(5).max(100).optional()
            .messages({
                'string.min': 'Le titre doit contenir au moins 5 caractères',
                'string.max': 'Le titre ne doit pas dépasser 100 caractères'
            }),
        statut: Joi.string().valid('active', 'inactive', 'completed', 'cancelled').default('active')
            .messages({
                'any.only': 'Le statut doit être l\'un des suivants : active, inactive, completed, cancelled'
            })
    }).custom((value, helpers) => {
        // Valider que la date d'arrivée est après la date de départ
        if (value.datedepart && value.datearrivee && value.datedepart >= value.datearrivee) {
            return helpers.error('date.arrival');
        }
        
        // Valider que les villes de départ et d'arrivée sont différentes
        if (value.id_ville_dep && value.id_ville_arr && value.id_ville_dep === value.id_ville_arr) {
            return helpers.error('city.same');
        }
        
        return value;
    }).messages({
        'date.arrival': 'La date d\'arrivée doit être postérieure à la date de départ',
        'city.same': 'Les villes de départ et d\'arrivée doivent être différentes'
    }),

    // Schéma de mise à jour d'annonce
    update: Joi.object({
        description: Joi.string().min(10).max(1000).optional(),
        prix: Joi.number().positive().precision(2).optional(),
        datedepart: commonSchemas.date.optional(),
        datearrivee: commonSchemas.date.optional(),
        titre: Joi.string().min(5).max(100).optional(),
        statut: Joi.string().valid('active', 'inactive', 'completed', 'cancelled').optional()
    }).min(1).custom((value, helpers) => {
        // Valider la plage de dates si les deux dates sont fournies
        if (value.datedepart && value.datearrivee && value.datedepart >= value.datearrivee) {
            return helpers.error('date.arrival');
        }
        
        return value;
    }),

    // Schéma de paramètre ID annonce
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Paramètres de requête pour la liste des annonces
    query: commonSchemas.pagination.keys({
        utilisateur: commonSchemas.id.optional(),
        ville_dep: commonSchemas.id.optional(),
        ville_arr: commonSchemas.id.optional(),
        aeroport_dep: commonSchemas.id.optional(),
        aeroport_arr: commonSchemas.id.optional(),
        statut: Joi.string().valid('active', 'inactive', 'completed', 'cancelled').optional(),
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        minPrice: Joi.number().positive().precision(2).optional(),
        maxPrice: Joi.number().positive().precision(2).optional(),
        search: Joi.string().min(1).max(100).optional(),
        sortBy: Joi.string().valid('prix', 'datedepart', 'datearrivee', 'datepublication').default('datepublication')
    }).custom((value, helpers) => {
        // Valider la plage de dates
        if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
            return helpers.error('date.range');
        }
        
        // Valider la plage de prix
        if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
            return helpers.error('price.range');
        }
        
        return value;
    }).messages({
        'date.range': 'La date de début doit être antérieure à la date de fin',
        'price.range': 'Le prix minimum doit être inférieur au prix maximum'
    })
};
