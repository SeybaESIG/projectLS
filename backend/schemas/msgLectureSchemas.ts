import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les lectures de messages
 */
export const msgLectureSchemas = {
    // Schéma pour marquer une conversation comme lue
    markAsRead: Joi.object({
        id_expediteur: commonSchemas.id,
        id_destinataire: commonSchemas.id,
        id_annon: commonSchemas.id.optional()
    }),

    // Schéma de paramètre ID utilisateur
    userParams: Joi.object({
        id_util: commonSchemas.id
    }),

    // Schéma de paramètre ID lecture
    params: Joi.object({
        id: commonSchemas.id
    })
};


