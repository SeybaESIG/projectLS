import type { Request, Response, NextFunction } from 'express';
import { Achat } from '../models/index.js';

// Récupérer tous les Achats
export const getAllAchats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achats = await Achat.findAll();
    res.json(achats);
  } catch (error) {
    next(error);
  }
};

// Récupérer un Achat par ID
export const getAchatById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achat = await Achat.findByPk(req.params.id);
    if (!achat) return res.status(404).json({ message: 'Achat non trouvé' });
    res.json(achat);
  } catch (error) {
    next(error);
  }
};

// Créer un Achat
export const createAchat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achat = await Achat.create(req.body);
    res.status(201).json(achat);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un Achat
export const updateAchat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [updated] = await Achat.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Achat non trouvé' });
    const updatedAchat = await Achat.findByPk(req.params.id);
    res.json(updatedAchat);
  } catch (error) {
    next(error);
  }
};

// Supprimer un Achat
export const deleteAchat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await Achat.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Achat non trouvé' });
    res.json({ message: 'Achat supprimé' });
  } catch (error) {
    next(error);
  }
};