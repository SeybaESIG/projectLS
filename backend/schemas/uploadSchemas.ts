import Joi from 'joi';

/**
 * Schémas de validation pour les uploads de fichiers
 */
export const uploadSchemas = {
    // Schéma pour demander une Signed URL
    getSignedUrl: Joi.object({
        filename: Joi.string().min(1).max(255).required()
            .messages({
                'string.min': 'Le nom du fichier doit contenir au moins 1 caractère',
                'string.max': 'Le nom du fichier ne doit pas dépasser 255 caractères',
                'any.required': 'Le nom du fichier est requis'
            }),
        contentType: Joi.string()
            .valid('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp')
            .required()
            .messages({
                'any.only': 'Type de fichier non autorisé. Seules les images sont acceptées (JPEG, PNG, GIF, WEBP)',
                'any.required': 'Le type de contenu est requis'
            }),
        category: Joi.string().valid('user-photo', 'message-image').optional().default('message-image')
            .messages({
                'any.only': 'La catégorie doit être "user-photo" ou "message-image"'
            })
    })
};




