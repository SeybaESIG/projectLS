import type { Request, Response, NextFunction } from 'express';
import { HistoriqueAnnonce, Annonce, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer tous les historiques d'annonce avec pagination
export const getAllHistoriqueAnnonces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const { count, rows: historiques } = await HistoriqueAnnonce.findAndCountAll({
      limit,
      offset,
      order: [['id_histo_annon', 'DESC']],
      include: [
        {
          model: Annonce,
          required: false
        },
        {
          model: Utilisateur,
          required: false
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: historiques,
      pagination: {
        total: count,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer un historique d'annonce par ID
export const getHistoriqueAnnonceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historique = await HistoriqueAnnonce.findByPk(req.params.id, {
      include: [
        {
          model: Annonce,
          required: false
        },
        {
          model: Utilisateur,
          required: false
        }
      ]
    });
    
    if (!historique) {
      return res.status(404).json({ message: 'Historique d\'annonce introuvable' });
    }
    
    res.json(historique);
  } catch (error) {
    next(error);
  }
};

// Récupérer l'historique d'une annonce spécifique
export const getHistoriqueByAnnonce = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_annon } = req.params;
    
    const historiques = await HistoriqueAnnonce.findAll({
      where: { id_annon: Number(id_annon) },
      order: [['id_histo_annon', 'DESC']],
      include: [
        {
          model: Utilisateur,
          required: false
        }
      ]
    });

    res.json(historiques);
  } catch (error) {
    next(error);
  }
};

// Rechercher dans l'historique des annonces
export const searchHistorique = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      id_annon, 
      action_histo, 
      statut, 
      prix_min, 
      prix_max, 
      dateFrom, 
      dateTo,
      page: pageParam,
      limit: limitParam,
      sortBy = 'id_histo_annon',
      sort = 'desc'
    } = req.query;

    // Construire la clause WHERE
    const whereClause: any = {};

    if (id_annon) {
      whereClause.id_annon = Number(id_annon);
    }

    if (action_histo) {
      whereClause.action_histo = action_histo;
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

    // Recherche par dates
    if (dateFrom || dateTo) {
      whereClause.datedepart = {};
      if (dateFrom) {
        whereClause.datedepart[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.datedepart[Op.lte] = new Date(dateTo as string);
      }
    }

    // Pagination
    const page = Math.max(1, Number(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
    const offset = (page - 1) * limit;

    // Ordre de tri
    const order: any[] = [[sortBy as string, sort === 'asc' ? 'ASC' : 'DESC']];

    const { count, rows: historiques } = await HistoriqueAnnonce.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order,
      include: [
        {
          model: Annonce,
          required: false
        },
        {
          model: Utilisateur,
          required: false
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: historiques,
      pagination: {
        total: count,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};
