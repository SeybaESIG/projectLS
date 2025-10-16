import type { Request, Response, NextFunction } from 'express';
import { Pays } from '../models/index.js';
import { Op } from 'sequelize';
import { getPaysCache } from '../services/cacheService.js';

// Récupérer tous les pays (avec cache Redis - 24h)
export const getAllPays = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pays = await getPaysCache(() => Pays.findAll());
        res.json(pays);
    } catch (error) {
        next(error);
    }
};

// Récupérer un pays par son ID
export const getPaysById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pays = await Pays.findByPk(req.params.id);
        if (!pays) {
            const err: any = new Error('Pays non trouvé');
            err.status = 404;
            return next(err);
        }
        res.json(pays);
    } catch (error) {
        next(error);
    }
};

// Rechercher des pays par nom (ex: /api/pays/search?name=Mali)
export const searchPaysByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nameQuery = req.query.name as string;
        if (!nameQuery) {
            return res.status(400).json({ message: 'Le paramètre de requête "name" est requis' });
        }
        const pays = await Pays.findAll({
            where: {
                nom_pays: {
                    [Op.iLike]: `%${nameQuery}%`
                }
            }
        });
        res.json(pays);
    } catch (error) {
        next(error);
    }
};