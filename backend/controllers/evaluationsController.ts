import type { Request, Response, NextFunction } from 'express';
import { Evaluation } from '../models/index.js';

// Récupérer toutes les évaluations
export const getAllEvaluations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evaluations = await Evaluation.findAll();
    res.json(evaluations);
  } catch (error) {
    next(error);
  }
};

// Récupérer une évaluation par son ID
export const getEvaluationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};

// Créer une nouvelle évaluation
export const createEvaluation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newEvaluation = await Evaluation.create(req.body);
    res.status(201).json(newEvaluation);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une évaluation existante
export const updateEvaluation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }
    await evaluation.update(req.body);
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};

// Supprimer une évaluation
export const deleteEvaluation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Évaluation non trouvée' });
    }
    await evaluation.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};