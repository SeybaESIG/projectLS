import type { Request, Response, NextFunction } from 'express';
import { Abonnement, Utilisateur, TypeAbonnement } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer tous les abonnements avec pagination
export const getAllAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'date_debut';
        const sort = ((req.query.sort as string) || 'desc').toUpperCase();

        const { count, rows: abonnements } = await Abonnement.findAndCountAll({
            limit,
            offset,
            order: [[sortBy, sort]],
            include: [
                {
                    model: Utilisateur,
                    required: false
                },
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: abonnements,
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

// Récupérer un abonnement par son identifiant
export const getAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const abonnement = await Abonnement.findByPk(req.params.id, {
            include: [
                {
                    model: Utilisateur,
                    required: false
                },
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });
        if (!abonnement) {
            return res.status(404).json({ message: 'Abonnement non trouvé' });
        }
        res.json(abonnement);
    } catch (error) {
        next(error);
    }
};

// Récupérer l'abonnement d'un utilisateur spécifique
export const getAbonnementByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;
        
        const abonnement = await Abonnement.findOne({
            where: { id_util: Number(id_util) },
            include: [
                {
                    model: Utilisateur,
                    required: false
                },
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });

        if (!abonnement) {
            return res.status(404).json({ message: 'Aucun abonnement trouvé pour cet utilisateur' });
        }

        res.json(abonnement);
    } catch (error) {
        next(error);
    }
};

// Créer un nouvel abonnement
export const createAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newAbonnement = await Abonnement.create(req.body);
        
        // Récupérer l'abonnement avec les relations
        const abonnementComplet = await Abonnement.findByPk(newAbonnement.id_abonnement, {
            include: [
                {
                    model: Utilisateur,
                    required: false
                },
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });
        
        res.status(201).json(abonnementComplet);
    } catch (error) {
        next(error);
    }
};

// Mettre à jour un abonnement existant
export const updateAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const abonnement = await Abonnement.findByPk(req.params.id);
        if (!abonnement) {
            return res.status(404).json({ message: 'Abonnement non trouvé' });
        }
        
        await abonnement.update(req.body);
        
        // Récupérer l'abonnement mis à jour avec les relations
        const abonnementMisAJour = await Abonnement.findByPk(req.params.id, {
            include: [
                {
                    model: Utilisateur,
                    required: false
                },
                {
                    model: TypeAbonnement,
                    required: false
                }
            ]
        });
        
        res.json(abonnementMisAJour);
    } catch (error) {
        next(error);
    }
};

// Supprimer un abonnement
export const deleteAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const abonnement = await Abonnement.findByPk(req.params.id);
        if (!abonnement) {
            return res.status(404).json({ message: 'Abonnement non trouvé' });
        }
        await abonnement.destroy();
        res.json({ message: 'Abonnement supprimé' });
    } catch (error) {
        next(error);
    }
};

// Rechercher des abonnements
export const searchAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            user, 
            type, 
            status, 
            date_debut_min, 
            date_debut_max,
            date_fin_min,
            date_fin_max,
            page: pageParam,
            limit: limitParam,
            sortBy = 'date_debut',
            sort = 'desc'
        } = req.query;
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        // Recherche par statut (actif = date_fin > maintenant, expiré = date_fin <= maintenant)
        if (status) {
            const now = new Date();
            if (status === 'actif' || status === 'active') {
                whereClause.date_fin = { [Op.gt]: now };
            } else if (status === 'expiré' || status === 'expire' || status === 'expired') {
                whereClause.date_fin = { [Op.lte]: now };
            }
        }
        
        // Recherche par plage de date_debut
        if (date_debut_min || date_debut_max) {
            whereClause.date_debut = {};
            if (date_debut_min) {
                whereClause.date_debut[Op.gte] = new Date(date_debut_min as string);
            }
            if (date_debut_max) {
                whereClause.date_debut[Op.lte] = new Date(date_debut_max as string);
            }
        }
        
        // Recherche par plage de date_fin
        if (date_fin_min || date_fin_max) {
            if (!whereClause.date_fin) {
                whereClause.date_fin = {};
            }
            if (date_fin_min) {
                whereClause.date_fin[Op.gte] = new Date(date_fin_min as string);
            }
            if (date_fin_max) {
                whereClause.date_fin[Op.lte] = new Date(date_fin_max as string);
            }
        }
        
        // Recherche par user
        if (user) {
            includeClause.push({
                model: Utilisateur,
                where: {
                    username: { [Op.iLike]: `%${user}%` }
                },
                required: true
            });
        } else {
            includeClause.push(Utilisateur);
        }
        
        // Recherche par type d'abonnement
        if (type) {
            includeClause.push({
                model: TypeAbonnement,
                where: {
                    nom_type: { [Op.iLike]: `%${type}%` }
                },
                required: true
            });
        } else {
            includeClause.push(TypeAbonnement);
        }
        
        // Pagination
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
        const offset = (page - 1) * limit;

        // Ordre de tri
        const order: any[] = [[sortBy as string, sort === 'asc' ? 'ASC' : 'DESC']];
        
        const { count, rows: abonnements } = await Abonnement.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit,
            offset,
            order
        });

        const totalPages = Math.ceil(count / limit);
        
        res.json({
            data: abonnements,
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
