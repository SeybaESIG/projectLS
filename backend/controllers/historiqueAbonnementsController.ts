import type { Request, Response, NextFunction } from 'express';
import { HistoriqueAbonnement, TypeAbonnement } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer tous les historiques d'abonnement avec pagination
export const getAllHistoriqueAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'id_histo_abo';
        const sort = ((req.query.sort as string) || 'desc').toUpperCase();

        const { count, rows: historiques } = await HistoriqueAbonnement.findAndCountAll({
            limit,
            offset,
            order: [[sortBy, sort]],
            include: [
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: historiques,
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

// Récupérer un historique d'abonnement par ID
export const getHistoriqueAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const historique = await HistoriqueAbonnement.findByPk(id, {
            include: [
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });
        
        if (!historique) {
            return res.status(404).json({ message: 'Historique de l\'abonnement introuvable' });
        }
        
        res.json(historique);
    } catch (error) {
        next(error);
    }
};

// Récupérer l'historique d'un type d'abonnement spécifique
export const getHistoriqueByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_type_abonnement } = req.params;
        
        const historiques = await HistoriqueAbonnement.findAll({
            where: { id_type_abonnement: Number(id_type_abonnement) },
            order: [['id_histo_abo', 'DESC']],
            include: [
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });

        res.json(historiques);
    } catch (error) {
        next(error);
    }
};

// Rechercher dans l'historique des abonnements
export const searchHistorique = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            id_type_abonnement, 
            action_histo, 
            nom_type,
            prix_min, 
            prix_max, 
            duree_min,
            duree_max,
            page: pageParam,
            limit: limitParam,
            sortBy = 'id_histo_abo',
            sort = 'desc'
        } = req.query;

        // Construire la clause WHERE
        const whereClause: any = {};

        if (id_type_abonnement) {
            whereClause.id_type_abonnement = Number(id_type_abonnement);
        }

        if (action_histo) {
            whereClause.action_histo = action_histo;
        }

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

        const { count, rows: historiques } = await HistoriqueAbonnement.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order,
            include: [
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: historiques,
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
