import type {Request, Response, NextFunction} from 'express';
import { TypeAbonnement } from '../models/index.js';

// Récupérer tous les types d'abonnement
export const getAllTypesAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const types = await TypeAbonnement.findAll();
        res.json(types);
    } catch (error) {
        next(error);
    }
};

// Récupérer un type d'abonnement par ID
export const getTypeAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await TypeAbonnement.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Type d\'abonnement introuvable' });
        res.json(type);
    } catch (error) {
        next(error);
    }
};

// Créer un type d'abonnement
export const createTypeAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nom_type, prix, duree_mois, description } = req.body;
        const newType = await TypeAbonnement.create({ nom_type, prix, duree_mois, description });
        res.status(201).json(newType);
    } catch (error) {
        next(error);
    }
};

// Mettre à jour un type d'abonnement
export const updateTypeAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = await TypeAbonnement.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
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
        if (!type) return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
        await type.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};