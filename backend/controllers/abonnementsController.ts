import type { Request, Response, NextFunction } from 'express';
import { Abonnement, Utilisateur, TypeAbonnement } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer tous les abonnements
export const getAllAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const abonnements = await Abonnement.findAll();
        res.json(abonnements);
    } catch (error) {
        next(error);
    }
};

// Récupérer un abonnement par son identifiant
export const getAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const abonnement = await Abonnement.findByPk(req.params.id);
        if (!abonnement) {
            return res.status(404).json({ message: 'Abonnement non trouvé' });
        }
        res.json(abonnement);
    } catch (error) {
        next(error);
    }
};

// Créer un nouvel abonnement
export const createAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util, id_type_abonnement, date_debut, date_fin } = req.body;
        const newAbonnement = await Abonnement.create({ id_util, id_type_abonnement, date_debut, date_fin });
        res.status(201).json(newAbonnement);
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
        res.json(abonnement);
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
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Rechercher des abonnements (ex: /abonnements/search?user=alice&type=premium&status=active)
// Paramètres: user (username), type (nom_type), status (actif/expiré), date_debut, date_fin
export const searchAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, type, status, date_debut, date_fin } = req.query;
        
        if (!user && !type && !status && !date_debut && !date_fin) {
            return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (user, type, status, date_debut, date_fin)' });
        }
        
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
        
        // Recherche par date de début
        if (date_debut) {
            whereClause.date_debut = { [Op.gte]: new Date(date_debut as string) };
        }
        
        // Recherche par date de fin
        if (date_fin) {
            if (!whereClause.date_fin) {
                whereClause.date_fin = {};
            }
            whereClause.date_fin[Op.lte] = new Date(date_fin as string);
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
        
        const abonnements = await Abonnement.findAll({
            where: whereClause,
            include: includeClause
        });
        
        res.json(abonnements);
    } catch (error) {
        next(error);
    }
};
