import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/firebaseAuth.js';
import { Annonce, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Helper: Récupérer l'utilisateur connecté par son email Firebase
 */
async function getCurrentUser(req: AuthRequest): Promise<Utilisateur | null> {
    const firebaseEmail = req.user?.email;
    if (!firebaseEmail) return null;
    
    return await Utilisateur.findOne({ where: { email: firebaseEmail } });
}

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
export const createAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer l'utilisateur connecté
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentification requise pour créer une annonce' });
    }

    // Forcer l'id_util à être celui de l'utilisateur connecté (sécurité)
    const annonceData = {
      ...req.body,
      id_util: currentUser.id_util  // L'annonce appartient à l'utilisateur connecté
    };

    const annonce = await Annonce.create(annonceData);
    res.status(201).json(annonce);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une annonce existante
export const updateAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer l'utilisateur connecté
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const annonce = await Annonce.findByPk(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    if (annonce.id_util !== currentUser.id_util) {
      return res.status(403).json({ 
        error: 'Accès interdit', 
        message: 'Vous ne pouvez modifier que vos propres annonces' 
      });
    }

    await annonce.update(req.body);
    res.json(annonce);
  } catch (error) {
    next(error);
  }
};

// Supprimer une annonce
export const deleteAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer l'utilisateur connecté
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const annonce = await Annonce.findByPk(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    if (annonce.id_util !== currentUser.id_util) {
      return res.status(403).json({ 
        error: 'Accès interdit', 
        message: 'Vous ne pouvez supprimer que vos propres annonces' 
      });
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