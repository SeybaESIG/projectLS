import type { Request, Response, NextFunction } from 'express';
import { Annonce, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

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

// Rechercher des annonces (ex: /annonces/search?titre=vol&statut=active&prix_min=100&prix_max=500)
// Paramètres: titre, description, user (username), statut, prix_min, prix_max
export const searchAnnonces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { titre, description, user, statut, prix_min, prix_max } = req.query;
    
    if (!titre && !description && !user && !statut && !prix_min && !prix_max) {
      return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (titre, description, user, statut, prix_min, prix_max)' });
    }
    
    const whereClause: any = {};
    const includeClause: any[] = [];
    
    if (titre) {
      whereClause.titre = { [Op.iLike]: `%${titre}%` };
    }
    if (description) {
      whereClause.description = { [Op.iLike]: `%${description}%` };
    }
    if (statut) {
      whereClause.statut = { [Op.iLike]: `%${statut}%` };
    }
    
    // Recherche par prix (fourchette)
    if (prix_min || prix_max) {
      whereClause.prix = {};
      if (prix_min) {
        whereClause.prix[Op.gte] = parseFloat(prix_min as string);
      }
      if (prix_max) {
        whereClause.prix[Op.lte] = parseFloat(prix_max as string);
      }
    }
    
    // Recherche par username
    if (user) {
      includeClause.push({
        model: Utilisateur,
        where: {
          username: { [Op.iLike]: `%${user}%` }
        },
        required: true
      });
    } else {
      includeClause.push(Utilisateur);
    }
    
    const annonces = await Annonce.findAll({
      where: whereClause,
      include: includeClause
    });
    
    res.json(annonces);
  } catch (error) {
    next(error);
  }
};