import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour valider les données de requête en utilisant les schémas Joi
 * @param schema - Schéma de validation Joi
 * @param property - Propriété à valider ('body', 'query', 'params')
 */
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(400).json({
                success: false,
                message: 'Erreur de validation',
                errors: errorDetails
            });
        }

        // Remplacer la propriété originale par la valeur validée et nettoyée
        req[property] = value;
        next();
    };
};

/**
 * Schémas de validation communs
 */
export const commonSchemas = {
    // Validation d'ID
    id: Joi.number().integer().positive().required(),
    
    // Pagination
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sort: Joi.string().valid('asc', 'desc').default('desc'),
        sortBy: Joi.string().optional()
    }),

    // Validation de date
    date: Joi.date().iso(),
    
    // Validation d'email
    email: Joi.string().email().lowercase().trim(),
    
    // Validation de téléphone (format international E.164)
    // Accepte +[country code][1-15 digits]
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).messages({
        'string.pattern.base': 'Le numéro de téléphone doit être au format international (ex: +33612345678)'
    }),
    
    // Validation de mot de passe
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
            'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial'
        })
};

/**
 * Gestionnaire d'erreurs de validation
 */
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.isJoi) {
        const errorDetails = error.details.map((detail: any) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: errorDetails
        });
    }
    next(error);
};
