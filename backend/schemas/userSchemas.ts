import Joi from 'joi';
import { commonSchemas } from '../middlewares/validation.js';

/**
 * Schémas de validation pour les utilisateurs
 */
export const userSchemas = {
    // Schéma de création d'utilisateur
    create: Joi.object({
        id_ville: commonSchemas.id,
        id_role: commonSchemas.id,
        username: Joi.string().alphanum().min(3).max(30).required()
            .messages({
                'string.alphanum': 'Le nom d\'utilisateur ne doit contenir que des caractères alphanumériques',
                'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
                'string.max': 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères'
            }),
        nom: Joi.string().pattern(/^[a-zA-ZÀ-ÿ\s\-]+$/).min(2).max(100).required()
            .messages({
                'string.pattern.base': 'Le nom ne doit contenir que des lettres, espaces et tirets',
                'string.min': 'Le nom doit contenir au moins 2 caractères',
                'string.max': 'Le nom ne doit pas dépasser 100 caractères'
            }),
        prenom: Joi.string().pattern(/^[a-zA-ZÀ-ÿ\s\-]+$/).min(2).max(100).required()
            .messages({
                'string.pattern.base': 'Le prénom ne doit contenir que des lettres, espaces et tirets',
                'string.min': 'Le prénom doit contenir au moins 2 caractères',
                'string.max': 'Le prénom ne doit pas dépasser 100 caractères'
            }),
        email: commonSchemas.email.required(),
        tel: commonSchemas.phone.required(),
        mot_de_passe: commonSchemas.password.required(),
        piece_id: Joi.string().min(5).max(255).optional()
            .messages({
                'string.min': 'Le nom du fichier de pièce d\'identité doit contenir au moins 5 caractères',
                'string.max': 'Le nom du fichier de pièce d\'identité ne doit pas dépasser 255 caractères'
            }),
        photo: Joi.string().min(5).max(255).optional()
            .messages({
                'string.min': 'Le nom du fichier photo doit contenir au moins 5 caractères',
                'string.max': 'Le nom du fichier photo ne doit pas dépasser 255 caractères'
            }),
        adresse: Joi.string().min(5).max(255).required()
            .messages({
                'string.min': 'L\'adresse doit contenir au moins 5 caractères',
                'string.max': 'L\'adresse ne doit pas dépasser 255 caractères'
            }),
        detail_adresse: Joi.string().min(5).max(255).optional()
    }),

    // Schéma de mise à jour d'utilisateur
    update: Joi.object({
        id_ville: commonSchemas.id.optional(),
        id_role: commonSchemas.id.optional(),
        username: Joi.string().alphanum().min(3).max(30).optional(),
        nom: Joi.string().pattern(/^[a-zA-ZÀ-ÿ\s\-]+$/).min(2).max(100).optional(),
        prenom: Joi.string().pattern(/^[a-zA-ZÀ-ÿ\s\-]+$/).min(2).max(100).optional(),
        email: commonSchemas.email.optional(),
        tel: commonSchemas.phone.optional(),
        piece_id: Joi.string().min(5).max(255).optional(),
        photo: Joi.string().min(5).max(255).optional(),
        adresse: Joi.string().min(5).max(255).optional(),
        detail_adresse: Joi.string().min(5).max(255).optional()
    }).min(1), // Au moins un champ doit être fourni

    // Schéma de connexion
    login: Joi.object({
        username: Joi.string().required(),
        mot_de_passe: Joi.string().required()
    }),

    // Schéma de changement de mot de passe
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: commonSchemas.password.required()
    }),

    // Schéma de paramètre ID utilisateur
    params: Joi.object({
        id: commonSchemas.id
    }),

    // Paramètres de requête pour la liste des utilisateurs
    query: commonSchemas.pagination.keys({
        search: Joi.string().min(1).max(100).optional(),
        ville: commonSchemas.id.optional(),
        role: commonSchemas.id.optional(),
        sortBy: Joi.string().valid('nom', 'prenom', 'username', 'email', 'date_inscription').default('nom')
    })
};
