import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les rôles
 */
export const roleSchemas = {
    // Schéma de création de rôle
    create: Joi.object({
        nom_role: Joi.string().trim().min(1).max(100).required()
            .messages({
                'string.min': 'Le nom du rôle doit contenir au moins 1 caractère',
                'string.max': 'Le nom du rôle ne doit pas dépasser 100 caractères'
            }),
        description_role: Joi.string().allow(null, '').optional()
    }),

    // Schéma de mise à jour de rôle
    update: Joi.object({
        nom_role: Joi.string().trim().min(1).max(100).optional(),
        description_role: Joi.string().allow(null, '').optional()
    }).min(1),

    // Schéma de paramètre ID rôle
    params: Joi.object({
        id: commonSchemas.id
    })
};

