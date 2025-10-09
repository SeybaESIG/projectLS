import Joi from 'joi';

export const roleSchema = Joi.object({
  nom_role: Joi.string().trim().min(1).max(100).required(),
  description_role: Joi.string().allow(null, '').optional(),
}).unknown(false).options({ stripUnknown: true });