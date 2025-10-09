import type { Request, Response, NextFunction } from 'express';
import { Abonnement } from '../models/index.js';

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
