import type { Request, Response, NextFunction } from 'express';
import { Paiement, Transaction, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

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

// Rechercher des paiements (ex: /paiements/search?user=alice&type=carte&date=2025-10-09)
// Paramètres: user (username via transaction), date, type (payment method), montant_min, montant_max
export const searchPaiements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, date, type, montant_min, montant_max } = req.query;
    
    if (!user && !date && !type && !montant_min && !montant_max) {
      return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (user, date, type, montant_min, montant_max)' });
    }
    
    const whereClause: any = {};
    const includeClause: any[] = [];
    
    if (type) {
      whereClause.type = { [Op.iLike]: `%${type}%` };
    }
    
    if (date) {
      whereClause.date = {
        [Op.gte]: new Date(date as string),
        [Op.lt]: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    // Recherche via transaction (pour user ou montant)
    const transactionInclude: any = {
      model: Transaction,
      required: true,
      include: []
    };
    
    // Recherche par montant dans la transaction
    if (montant_min || montant_max) {
      transactionInclude.where = {};
      if (montant_min) {
        transactionInclude.where.montant = { [Op.gte]: parseFloat(montant_min as string) };
      }
      if (montant_max) {
        if (!transactionInclude.where.montant) {
          transactionInclude.where.montant = {};
        }
        transactionInclude.where.montant[Op.lte] = parseFloat(montant_max as string);
      }
    }
    
    // Recherche par user dans la transaction (payeur ou receveur)
    if (user) {
      const userWhere = {
        username: { [Op.iLike]: `%${user}%` }
      };
      
      transactionInclude.include.push({
        model: Utilisateur,
        as: 'payeur',
        where: userWhere,
        required: false
      });
      
      transactionInclude.include.push({
        model: Utilisateur,
        as: 'receveur',
        where: userWhere,
        required: false
      });
    } else {
      transactionInclude.include.push({
        model: Utilisateur,
        as: 'payeur'
      });
      
      transactionInclude.include.push({
        model: Utilisateur,
        as: 'receveur'
      });
    }
    
    includeClause.push(transactionInclude);
    
    const paiements = await Paiement.findAll({
      where: whereClause,
      include: includeClause
    });
    
    res.json(paiements);
  } catch (error) {
    next(error);
  }
};