import type { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/index.js';

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