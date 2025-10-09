import type { Request, Response, NextFunction } from 'express';
import { Evaluation, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

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

// Rechercher des évaluations (ex: /evaluations/search?user=alice&note_min=4&date=2025-10-09)
// Paramètres: user (username qui donne ou reçoit), note_min, note_max, date
export const searchEvaluations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, note_min, note_max, date } = req.query;
    
    if (!user && !note_min && !note_max && !date) {
      return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (user, note_min, note_max, date)' });
    }
    
    const whereClause: any = {};
    const includeClause: any[] = [];
    
    // Recherche par note (fourchette)
    if (note_min || note_max) {
      whereClause.note = {};
      if (note_min) {
        whereClause.note[Op.gte] = parseFloat(note_min as string);
      }
      if (note_max) {
        whereClause.note[Op.lte] = parseFloat(note_max as string);
      }
    }
    
    if (date) {
      whereClause.date = {
        [Op.gte]: new Date(date as string),
        [Op.lt]: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    // Recherche par user (qui donne l'évaluation)
    if (user) {
      const userWhere = {
        username: { [Op.iLike]: `%${user}%` }
      };
      
      includeClause.push({
        model: Utilisateur,
        as: 'donneur',
        where: userWhere,
        required: false
      });
      
      includeClause.push({
        model: Utilisateur,
        as: 'receveur',
        where: userWhere,
        required: false
      });
    } else {
      includeClause.push({
        model: Utilisateur,
        as: 'donneur'
      });
      
      includeClause.push({
        model: Utilisateur,
        as: 'receveur'
      });
    }
    
    const evaluations = await Evaluation.findAll({
      where: whereClause,
      include: includeClause
    });
    
    res.json(evaluations);
  } catch (error) {
    next(error);
  }
};