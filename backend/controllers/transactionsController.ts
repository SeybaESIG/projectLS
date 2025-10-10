import type { Request, Response, NextFunction } from 'express';
import { Transaction, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer toutes les transactions
export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// Récupérer une transaction par ID
export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction introuvable' });
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

// Créer une transaction
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newTransaction = await Transaction.create(req.body);
    res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une transaction
export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction introuvable' });
    }
    await transaction.update(req.body);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

// Supprimer une transaction
export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction introuvable' });
    }
    await transaction.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Rechercher des transactions (ex: /transactions/search?user=alice&montant_min=100&date_debut=2025-01-01)
// Paramètres: user (username payeur ou receveur), date_debut, date_fin, montant_min, montant_max
export const searchTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, date_debut, date_fin, montant_min, montant_max } = req.query;
    
    if (!user && !date_debut && !date_fin && !montant_min && !montant_max) {
      return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (user, date_debut, date_fin, montant_min, montant_max)' });
    }
    
    const whereClause: any = {};
    const includeClause: any[] = [];
    
    // Recherche par date (fourchette)
    if (date_debut || date_fin) {
      whereClause.date = {};
      if (date_debut) {
        whereClause.date[Op.gte] = new Date(date_debut as string);
      }
      if (date_fin) {
        whereClause.date[Op.lte] = new Date(date_fin as string);
      }
    }
    
    // Recherche par montant (fourchette)
    if (montant_min || montant_max) {
      whereClause.montant = {};
      if (montant_min) {
        whereClause.montant[Op.gte] = parseFloat(montant_min as string);
      }
      if (montant_max) {
        whereClause.montant[Op.lte] = parseFloat(montant_max as string);
      }
    }
    
    // Recherche par user (payeur ou receveur)
    if (user) {
      const userWhere = {
        username: { [Op.iLike]: `%${user}%` }
      };
      
      includeClause.push({
        model: Utilisateur,
        as: 'payeur',
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
        as: 'payeur'
      });
      
      includeClause.push({
        model: Utilisateur,
        as: 'receveur'
      });
    }
    
    const transactions = await Transaction.findAll({
      where: whereClause,
      include: includeClause
    });
    
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};