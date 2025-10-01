import type { Request, Response, NextFunction } from 'express';
import { Annonce } from '../models/index.js';

// Récupérer toutes les annonces
export const getAllAnnonces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonces = await Annonce.findAll();
    res.json(annonces);
  } catch (error) {
    next(error);
  }
};

// Récupérer une annonce par son ID
export const getAnnonceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    res.json(annonce);
  } catch (error) {
    next(error);
  }
};

// Créer une nouvelle annonce
export const createAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonce = await Annonce.create(req.body);
    res.status(201).json(annonce);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une annonce existante
export const updateAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    await annonce.update(req.body);
    res.json(annonce);
  } catch (error) {
    next(error);
  }
};

// Supprimer une annonce
export const deleteAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    await annonce.destroy();
    res.json({ message: 'Annonce supprimée' });
  } catch (error) {
    next(error);
  }
};