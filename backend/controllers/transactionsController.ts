import type { Request, Response, NextFunction } from 'express';
import { Transaction, Utilisateur, Paiement } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

// Récupérer toutes les transactions avec pagination
export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      sortBy = 'date', 
      order = 'DESC',
      payeur,
      receveur,
      statut
    } = req.query;

    const whereClause: any = {};

    // Filtres optionnels
    if (payeur) {
      whereClause.id_payeur = Number(payeur);
    }
    if (receveur) {
      whereClause.id_receveur = Number(receveur);
    }
    if (statut) {
      whereClause.statut = statut;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [[sortBy as string, order as string]],
      include: [
        { model: Utilisateur, as: 'payeur', attributes: ['id_util', 'username', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'receveur', attributes: ['id_util', 'username', 'nom', 'prenom'] }
      ]
    });

    res.json({
      data: transactions,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une transaction par ID
export const getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: 'payeur', attributes: ['id_util', 'username', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'receveur', attributes: ['id_util', 'username', 'nom', 'prenom'] }
      ]
    });
    
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
    
    // Recharger avec les associations
    const transactionWithAssociations = await Transaction.findByPk(newTransaction.id_transa, {
      include: [
        { model: Utilisateur, as: 'payeur', attributes: ['id_util', 'username', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'receveur', attributes: ['id_util', 'username', 'nom', 'prenom'] }
      ]
    });
    
    res.status(201).json(transactionWithAssociations);
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
    
    // Recharger avec les associations
    const updatedTransaction = await Transaction.findByPk(transaction.id_transa, {
      include: [
        { model: Utilisateur, as: 'payeur', attributes: ['id_util', 'username', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'receveur', attributes: ['id_util', 'username', 'nom', 'prenom'] }
      ]
    });
    
    res.json(updatedTransaction);
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

// Rechercher des transactions avec pagination
export const searchTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      sortBy = 'date', 
      order = 'DESC',
      payeur,
      receveur,
      statut,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount
    } = req.query;
    
    const whereClause: any = {};
    
    // Filtres
    if (payeur) {
      whereClause.id_payeur = Number(payeur);
    }
    if (receveur) {
      whereClause.id_receveur = Number(receveur);
    }
    if (statut) {
      whereClause.statut = statut;
    }
    
    // Recherche par date (fourchette)
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.date[Op.lte] = new Date(dateTo as string);
      }
    }
    
    // Recherche par montant (fourchette)
    if (minAmount || maxAmount) {
      whereClause.montant = {};
      if (minAmount) {
        whereClause.montant[Op.gte] = parseFloat(minAmount as string);
      }
      if (maxAmount) {
        whereClause.montant[Op.lte] = parseFloat(maxAmount as string);
      }
    }
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: offset,
      order: [[sortBy as string, order as string]],
      include: [
        { model: Utilisateur, as: 'payeur', attributes: ['id_util', 'username', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'receveur', attributes: ['id_util', 'username', 'nom', 'prenom'] }
      ]
    });
    
    res.json({
      data: transactions,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut d'une transaction en fonction des paiements associés
 * Cette fonction est appelée automatiquement après chaque paiement validé/remboursé
 */
export const updateTransactionStatus = async (id_transa: number): Promise<void> => {
  try {
    const transaction = await Transaction.findByPk(id_transa);
    
    if (!transaction) {
      throw new Error(`Transaction ${id_transa} introuvable`);
    }
    
    // Récupérer tous les paiements validés pour cette transaction
    const paiementsValides = await Paiement.findAll({
      where: {
        id_transa,
        statut: 'validé'
      }
    });
    
    // Calculer le montant total payé
    const montantPaye = paiementsValides.reduce((sum, paiement) => {
      return sum + parseFloat(paiement.montant || '0');
    }, 0);
    
    const montantTotal = parseFloat(transaction.montant);
    
    // Déterminer le nouveau statut
    let nouveauStatut = transaction.statut;
    
    if (montantPaye >= montantTotal) {
      // Transaction complètement payée
      nouveauStatut = 'validée';
    } else if (montantPaye > 0) {
      // Paiement partiel en cours
      nouveauStatut = 'attente';
    }
    
    // Vérifier si des paiements ont été remboursés
    const paiementsRembourses = await Paiement.findAll({
      where: {
        id_transa,
        statut: 'remboursé'
      }
    });
    
    if (paiementsRembourses.length > 0) {
      const montantRembourse = paiementsRembourses.reduce((sum, paiement) => {
        return sum + parseFloat(paiement.montant || '0');
      }, 0);
      
      // Si tout est remboursé
      if (montantRembourse >= montantPaye) {
        nouveauStatut = 'remboursée';
      }
    }
    
    // Mettre à jour le statut si nécessaire
    if (nouveauStatut !== transaction.statut) {
      await transaction.update({ statut: nouveauStatut });
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la transaction ${id_transa}:`, error);
    throw error;
  }
};
