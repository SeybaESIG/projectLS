import type { Request, Response, NextFunction } from 'express';
import { HistoriqueAbonnement } from '../models/index.js';

// Récupérer tous les historiques d'abonnement
export const getAllHistoriqueAbonnements = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const historiques = await HistoriqueAbonnement.findAll();
        res.json(historiques);
    } catch (error) {
        next(error);
    }
};

// Récupérer un historique d'abonnement par ID
export const getHistoriqueAbonnementById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params['id']);
        const historique = await HistoriqueAbonnement.findByPk(id);
        if (!historique) {
            return res.status(404).json({ message: 'Historique de l\'abonnement introuvable' });
        }
        res.json(historique);
    } catch (error) {
        next(error);
    }
};

// Créer un nouvel historique d'abonnement
export const createHistoriqueAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const historique = await HistoriqueAbonnement.create(req.body);
        res.status(201).json(historique);
    } catch (error) {
        next(error);
    }
};

// Mettre à jour un historique d'abonnement
export const updateHistoriqueAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params['id']);
        const historique = await HistoriqueAbonnement.findByPk(id);
        if (!historique) {
            return res.status(404).json({ message: 'Historique de l\'abonnement introuvable' });
        }
        await historique.update(req.body);
        res.json(historique);
    } catch (error) {
        next(error);
    }
};

// Supprimer un historique d'abonnement
export const deleteHistoriqueAbonnement = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params['id']);
        const historique = await HistoriqueAbonnement.findByPk(id);
        if (!historique) {
            return res.status(404).json({ message: 'Historique de l\'abonnement introuvable' });
        }
        await historique.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};