import type { Request, Response, NextFunction } from 'express';
import { Ville } from '../models/index.js';

// Récupérer toutes les villes
export const getAllVilles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const villes = await Ville.findAll();
        res.json(villes);
    } catch (error) {
        next(error);
    }
};

// Récupérer une ville par son ID
export const getVilleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ville = await Ville.findByPk(req.params.id);
        if (!ville) return res.status(404).json({ message: 'Ville non trouvée' });
        res.json(ville);
    } catch (error) {
        next(error);
    }
};