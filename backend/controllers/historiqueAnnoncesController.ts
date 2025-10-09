import type { Request, Response, NextFunction } from 'express';
import { HistoriqueAnnonce } from '../models/index.js';

// Récupérer tous les historiques d'annonce
export const getAllHistoriqueAnnonces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historiques = await HistoriqueAnnonce.findAll();
    res.json(historiques);
  } catch (error) {
    next(error);
  }
};

// Récupérer un historique d'annonce par ID
export const getHistoriqueAnnonceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historique = await HistoriqueAnnonce.findByPk(req.params.id);
    if (!historique) {
      return res.status(404).json({ message: 'Historique d\'annonce introuvable' });
    }
    res.json(historique);
  } catch (error) {
    next(error);
  }
};

// Créer un nouvel historique d'annonce
export const createHistoriqueAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newHistorique = await HistoriqueAnnonce.create(req.body);
    res.status(201).json(newHistorique);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un historique d'annonce
export const updateHistoriqueAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historique = await HistoriqueAnnonce.findByPk(req.params.id);
    if (!historique) {
      return res.status(404).json({ message: 'Historique d\'annonce introuvable' });
    }
    await historique.update(req.body);
    res.json(historique);
  } catch (error) {
    next(error);
  }
};

// Supprimer un historique d'annonce
export const deleteHistoriqueAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historique = await HistoriqueAnnonce.findByPk(req.params.id);
    if (!historique) {
      return res.status(404).json({ message: 'Historique d\'annonce introuvable' });
    }
    await historique.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};