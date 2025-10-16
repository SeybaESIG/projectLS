import type {Request, Response, NextFunction} from 'express';
import { TypeAbonnement } from '../models/index.js';
import { Op } from 'sequelize';
import { getTypesAbonnementCache } from '../services/cacheService.js';

// Récupérer tous les types d'abonnement avec pagination
export const getAllTypesAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'id_type_abonnement';
        const sort = ((req.query.sort as string) || 'asc').toUpperCase();

        // Cache seulement si c'est la première page sans filtres
        const isFirstPageDefault = page === 1 && limit === 50 && sortBy === 'id_type_abonnement' && sort === 'ASC';
        
        let count: number;
        let types: any[];

        if (isFirstPageDefault) {
            // Utiliser le cache pour la requête par défaut (1h)
            const cached = await getTypesAbonnementCache(() => 
                TypeAbonnement.findAndCountAll({
                    limit,
                    offset,
                    order: [[sortBy, sort]]
                })
            );
            count = cached.count;
            types = cached.rows;
        } else {
            // Pas de cache pour les requêtes personnalisées
            const result = await TypeAbonnement.findAndCountAll({
                limit,
                offset,
                order: [[sortBy, sort]]
            });
            count = result.count;
            types = result.rows;
        }

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: types,
            pagination: {
                total: count,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        next(error);
    }
};

// Récupérer un type d'abonnement par ID
export const getTypeAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await TypeAbonnement.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type d\'abonnement introuvable' });
        }
        res.json(type);
    } catch (error) {
        next(error);
    }
};

// Rechercher des types d'abonnement
export const searchTypesAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            nom_type, 
            prix_min, 
            prix_max, 
            duree_min, 
            duree_max,
            page: pageParam,
            limit: limitParam,
            sortBy = 'id_type_abonnement',
            sort = 'asc'
        } = req.query;

        // Construire la clause WHERE
        const whereClause: any = {};

        if (nom_type) {
            whereClause.nom_type = { [Op.iLike]: `%${nom_type}%` };
        }

        // Recherche par prix (fourchette)
        if (prix_min || prix_max) {
            whereClause.prix = {};
            if (prix_min) {
                whereClause.prix[Op.gte] = parseFloat(prix_min as string);
            }
            if (prix_max) {
                whereClause.prix[Op.lte] = parseFloat(prix_max as string);
            }
        }

        // Recherche par durée (fourchette)
        if (duree_min || duree_max) {
            whereClause.duree_mois = {};
            if (duree_min) {
                whereClause.duree_mois[Op.gte] = parseInt(duree_min as string);
            }
            if (duree_max) {
                whereClause.duree_mois[Op.lte] = parseInt(duree_max as string);
            }
        }

        // Pagination
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
        const offset = (page - 1) * limit;

        // Ordre de tri
        const order: any[] = [[sortBy as string, sort === 'asc' ? 'ASC' : 'DESC']];

        const { count, rows: types } = await TypeAbonnement.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: types,
            pagination: {
                total: count,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        next(error);
    }
};

// Créer un type d'abonnement
export const createTypeAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newType = await TypeAbonnement.create(req.body);
        res.status(201).json(newType);
    } catch (error) {
        next(error);
    }
};

// Mettre à jour un type d'abonnement
export const updateTypeAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await TypeAbonnement.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
        }
        await type.update(req.body);
        res.json(type);
    } catch (error) {
        next(error);
    }
};

// Supprimer un type d'abonnement
export const deleteTypeAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await TypeAbonnement.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
        }
        await type.destroy();
        res.json({ message: 'Type d\'abonnement supprimé' });
    } catch (error) {
        next(error);
    }
};
