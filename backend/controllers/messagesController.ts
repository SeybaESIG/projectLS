import type { Request, Response, NextFunction } from 'express';
import { Message, Utilisateur } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer tous les messages
export const getAllMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await Message.findAll();
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Récupérer un message par son ID
export const getMessageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    res.json(message);
  } catch (error) {
    next(error);
  }
};

// Créer un nouveau message
export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contenu, id_expediteur, id_destinataire, id_annon } = req.body;
    const newMessage = await Message.create({ contenu, id_expediteur, id_destinataire, id_annon });
    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un message existant
export const updateMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    await message.update(req.body);
    res.json(message);
  } catch (error) {
    next(error);
  }
};

// Supprimer un message
export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    await message.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Rechercher des messages (ex: /messages/search?sender=alice&content=vol&date=2025-10-09)
// Paramètres: sender (username expediteur), receiver (username destinataire), content, date
export const searchMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sender, receiver, content, date } = req.query;
    
    if (!sender && !receiver && !content && !date) {
      return res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (sender, receiver, content, date)' });
    }
    
    const whereClause: any = {};
    const includeClause: any[] = [];
    
    if (content) {
      whereClause.contenu = { [Op.iLike]: `%${content}%` };
    }
    
    if (date) {
      whereClause.dateenvoi = {
        [Op.gte]: new Date(date as string),
        [Op.lt]: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    // Recherche par expéditeur (sender)
    if (sender) {
      includeClause.push({
        model: Utilisateur,
        as: 'expediteur',
        where: {
          username: { [Op.iLike]: `%${sender}%` }
        },
        required: true
      });
    } else {
      includeClause.push({
        model: Utilisateur,
        as: 'expediteur'
      });
    }
    
    // Recherche par destinataire (receiver)
    if (receiver) {
      includeClause.push({
        model: Utilisateur,
        as: 'destinataire',
        where: {
          username: { [Op.iLike]: `%${receiver}%` }
        },
        required: true
      });
    } else {
      includeClause.push({
        model: Utilisateur,
        as: 'destinataire'
      });
    }
    
    const messages = await Message.findAll({
      where: whereClause,
      include: includeClause
    });
    
    res.json(messages);
  } catch (error) {
    next(error);
  }
};