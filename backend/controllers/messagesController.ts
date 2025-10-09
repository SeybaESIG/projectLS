import type { Request, Response, NextFunction } from 'express';
import { Message } from '../models/index.js';

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