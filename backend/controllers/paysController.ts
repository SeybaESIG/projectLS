import type { Request, Response, NextFunction } from 'express';
import { Pays } from '../models/index.js';

// Récupérer tous les pays
export const getAllPays = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pays = await Pays.findAll();
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