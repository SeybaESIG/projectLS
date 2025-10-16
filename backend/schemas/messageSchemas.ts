import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les messages
 */
export const messageSchemas = {
    // Schéma de création de message
    // Note: id_expediteur est optionnel car le controller le force automatiquement à l'utilisateur connecté
    create: Joi.object({
        id_expediteur: commonSchemas.id.optional(),  // Optionnel car forcé par le controller
        id_destinataire: commonSchemas.id,
        id_annon: commonSchemas.id.optional(),
        contenu: Joi.string().min(1).max(1000).required()
            .messages({
                'string.min': 'Le message ne peut pas être vide',
                'string.max': 'Le message ne doit pas dépasser 1000 caractères',
                'any.required': 'Le contenu du message est requis'
            }),
        url_image: Joi.string().uri().max(500).optional()
            .messages({
                'string.uri': 'L\'URL de l\'image doit être valide',
                'string.max': 'L\'URL ne doit pas dépasser 500 caractères'
            })
    }).custom((value, helpers) => {
        // Valider que l'expéditeur et le destinataire sont différents (si id_expediteur est fourni)
        if (value.id_expediteur && value.id_expediteur === value.id_destinataire) {
            return helpers.error('users.same');
        }
        return value;
    }).messages({
        'users.same': 'L\'expéditeur et le destinataire doivent être différents'
    }),

    // Schéma de paramètre ID message
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Schéma de paramètre ID utilisateur pour messages non lus
    userParams: Joi.object({
        id_util: commonSchemas.id
    }),

    // Schéma pour récupérer une conversation
    conversationQuery: Joi.object({
        id_expediteur: commonSchemas.id,
        id_destinataire: commonSchemas.id,
        id_annon: commonSchemas.id.optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50)
    }),

    // Paramètres de requête pour la recherche et liste
    query: Joi.object({
        // Filtres
        sender: Joi.string().optional(), // Username expéditeur
        receiver: Joi.string().optional(), // Username destinataire
        id_annon: commonSchemas.id.optional(),
        contenu: Joi.string().optional(), // Recherche dans le contenu (déchiffré côté serveur)
        dateFrom: commonSchemas.date.optional(),
        dateTo: commonSchemas.date.optional(),
        
        // Pagination
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        sortBy: Joi.string().valid('id_msg', 'dateenvoi').default('dateenvoi'),
        sort: Joi.string().valid('asc', 'desc').default('desc')
    }).custom((value, helpers) => {
        // Valider la plage de dates
        if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
            return helpers.error('date.range');
        }
        return value;
    }).messages({
        'date.range': 'La date de début doit être antérieure à la date de fin'
    })
};

