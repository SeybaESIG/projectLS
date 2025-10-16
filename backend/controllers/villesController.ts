import type { Request, Response, NextFunction } from 'express';
import { Ville } from '../models/index.js';
import {Op} from "sequelize";
import { getVillesCache } from '../services/cacheService.js';

// Récupérer toutes les villes (avec cache Redis - 24h)
export const getAllVilles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const villes = await getVillesCache(() => Ville.findAll());
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

// Rechercher des villes (ex: /api/villes/search?name=Bamako&pays=Mali)
// Paramètres: name (nom_ville), pays (nom_pays)
export const searchVille = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, pays } = req.query;
        
        if (!name && !pays) {
            return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (name, pays)' });
        }
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        if (name) {
            whereClause.nom_ville = { [Op.iLike]: `%${name}%` };
        }
        
        // Importer Pays pour pouvoir faire la recherche
        const { Pays } = await import('../models/index.js');
        
        if (pays) {
            includeClause.push({
                model: Pays,
                where: {
                    nom_pays: { [Op.iLike]: `%${pays}%` }
                },
                required: true
            });
        } else {
            includeClause.push(Pays);
        }
        
        const villes = await Ville.findAll({
            where: whereClause,
            include: includeClause
        });
        
        res.json(villes);
    } catch (error) {
        next(error);
    }
};