import type { Request, Response, NextFunction } from 'express';
import { Paiement } from '../models/index.js';

// Récupérer tous les paiements
export const getAllPaiements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiements = await Paiement.findAll();
    res.json(paiements);
  } catch (error) {
    next(error);
  }
};

// Récupérer un paiement par son ID
export const getPaiementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.json(paiement);
  } catch (error) {
    next(error);
  }
};

// Créer un nouveau paiement
export const createPaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPaiement = await Paiement.create(req.body);
    res.status(201).json(newPaiement);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un paiement existant
export const updatePaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    await paiement.update(req.body);
    res.json(paiement);
  } catch (error) {
    next(error);
  }
};

// Supprimer un paiement
export const deletePaiement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    await paiement.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};