import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/firebaseAuth.js';
import { Message, Utilisateur, MsgLecture } from '../models/index.js';
import { Op } from 'sequelize';
import { encryptMessage, decryptMessage } from '../services/encryptionService.js';

/**
 * Helper: Récupérer l'utilisateur connecté par son email Firebase
 */
async function getCurrentUser(req: AuthRequest): Promise<Utilisateur | null> {
    const firebaseEmail = req.user?.email;
    if (!firebaseEmail) return null;
    
    return await Utilisateur.findOne({ where: { email: firebaseEmail } });
}

/**
 * Décrypte le contenu d'un ou plusieurs messages
 */
async function decryptMessages(messages: any | any[]): Promise<any | any[]> {
    const isArray = Array.isArray(messages);
    const messagesToDecrypt = isArray ? messages : [messages];

    const decrypted = await Promise.all(
        messagesToDecrypt.map(async (msg) => {
            const msgObj = msg.toJSON ? msg.toJSON() : msg;
            try {
                msgObj.contenu = await decryptMessage(msgObj.contenu);
            } catch (error) {
                console.error('Erreur de déchiffrement du message:', error);
                msgObj.contenu = '[Message chiffré - erreur de déchiffrement]';
            }
            return msgObj;
        })
    );

    return isArray ? decrypted : decrypted[0];
}

// Récupérer tous les messages avec pagination (UNIQUEMENT les messages de l'utilisateur connecté)
export const getAllMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur connecté
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'dateenvoi';
        const sort = ((req.query.sort as string) || 'desc').toUpperCase();

        // Filtrer: seulement les messages envoyés OU reçus par l'utilisateur connecté
        const { count, rows: messages } = await Message.findAndCountAll({
            where: {
                [Op.or]: [
                    { id_expediteur: currentUser.id_util },
                    { id_destinataire: currentUser.id_util }
                ]
            },
            limit,
            offset,
            order: [[sortBy, sort]],
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        // Décrypter les messages
        const decryptedMessages = await decryptMessages(messages);

        res.json({
            data: decryptedMessages,
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

// Récupérer un message par son ID
export const getMessageById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur connecté
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const message = await Message.findByPk(req.params.id, {
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false }
            ]
        });
        
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }

        // Vérifier que l'utilisateur est l'expéditeur OU le destinataire
        if (message.id_expediteur !== currentUser.id_util && message.id_destinataire !== currentUser.id_util) {
            return res.status(403).json({ 
                error: 'Accès interdit', 
                message: 'Vous ne pouvez voir que vos propres messages' 
            });
        }

        // Décrypter le message
        const decryptedMessage = await decryptMessages(message);

        res.json(decryptedMessage);
    } catch (error) {
        next(error);
    }
};

// Créer un nouveau message (avec encryptage)
export const createMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur connecté
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const { contenu, id_destinataire, id_annon, url_image } = req.body;

        // Encrypter le contenu avant stockage
        const contenuCrypte = await encryptMessage(contenu);

        // Forcer l'id_expediteur à être celui de l'utilisateur connecté (sécurité)
        const newMessage = await Message.create({
            id_expediteur: currentUser.id_util,  // L'expéditeur est l'utilisateur connecté
            id_destinataire,
            id_annon,
            contenu: contenuCrypte,
            url_image
        });

        // Récupérer le message avec les relations
        const messageComplet = await Message.findByPk(newMessage.id_msg, {
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false }
            ]
        });

        // Décrypter avant de retourner
        const decryptedMessage = await decryptMessages(messageComplet);

        res.status(201).json(decryptedMessage);
    } catch (error) {
        next(error);
    }
};

// Supprimer un message
export const deleteMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur connecté
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const message = await Message.findByPk(req.params.id);
        
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }

        // Vérifier que l'utilisateur est l'expéditeur du message
        if (message.id_expediteur !== currentUser.id_util) {
            return res.status(403).json({ 
                error: 'Accès interdit', 
                message: 'Vous ne pouvez supprimer que les messages que vous avez envoyés' 
            });
        }

        await message.destroy();
        res.json({ message: 'Message supprimé' });
    } catch (error) {
        next(error);
    }
};

// Récupérer une conversation (messages entre 2 utilisateurs pour une annonce)
export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur connecté
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        const { id_expediteur, id_destinataire, id_annon, page: pageParam, limit: limitParam } = req.query;

        if (!id_expediteur || !id_destinataire) {
            return res.status(400).json({ message: 'id_expediteur et id_destinataire sont requis' });
        }

        // Vérifier que l'utilisateur connecté est l'un des participants de la conversation
        const expId = Number(id_expediteur);
        const destId = Number(id_destinataire);
        
        if (currentUser.id_util !== expId && currentUser.id_util !== destId) {
            return res.status(403).json({ 
                error: 'Accès interdit', 
                message: 'Vous ne pouvez voir que vos propres conversations' 
            });
        }

        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
        const offset = (page - 1) * limit;

        // Récupérer les messages dans les 2 sens (A→B et B→A)
        const whereClause: any = {
            [Op.or]: [
                {
                    id_expediteur: Number(id_expediteur),
                    id_destinataire: Number(id_destinataire)
                },
                {
                    id_expediteur: Number(id_destinataire),
                    id_destinataire: Number(id_expediteur)
                }
            ]
        };

        // Filtrer par annonce si fournie
        if (id_annon) {
            whereClause.id_annon = Number(id_annon);
        }

        const { count, rows: messages } = await Message.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['dateenvoi', 'ASC']],
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        // Décrypter les messages
        const decryptedMessages = await decryptMessages(messages);

        res.json({
            data: decryptedMessages,
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

// Récupérer les messages non lus pour un utilisateur
export const getUnreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;
        const userId = Number(id_util);

        // Récupérer toutes les conversations avec leurs derniers accès
        const lectures = await MsgLecture.findAll({
            where: { id_destinataire: userId }
        });

        // Construire les conditions pour les messages non lus
        const unreadConditions = lectures.map(lecture => ({
            id_expediteur: lecture.id_expediteur,
            id_destinataire: userId,
            id_annon: lecture.id_annon,
            dateenvoi: { [Op.gt]: lecture.dernier_acces }
        }));

        // Ajouter les messages des conversations jamais ouvertes
        const conversationsLues = lectures.map(l => ({
            exp: l.id_expediteur,
            dest: l.id_destinataire,
            annon: l.id_annon
        }));

        const whereClause: any = {
            id_destinataire: userId,
            [Op.or]: [
                // Messages plus récents que dernier_acces
                ...unreadConditions,
                // Messages de conversations jamais ouvertes
                {
                    [Op.not]: {
                        [Op.or]: conversationsLues.map(conv => ({
                            id_expediteur: conv.exp,
                            id_destinataire: conv.dest,
                            id_annon: conv.annon
                        }))
                    }
                }
            ]
        };

        // Si aucune lecture, tous les messages reçus sont non lus
        if (lectures.length === 0) {
            delete whereClause[Op.or];
        }

        const messages = await Message.findAll({
            where: whereClause,
            order: [['dateenvoi', 'DESC']],
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false }
            ]
        });

        // Décrypter les messages
        const decryptedMessages = await decryptMessages(messages);

        res.json(decryptedMessages);
    } catch (error) {
        next(error);
    }
};

// Rechercher des messages
export const searchMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            sender, 
            receiver, 
            id_annon,
            contenu,
            dateFrom, 
            dateTo,
            page: pageParam,
            limit: limitParam,
            sortBy = 'dateenvoi',
            sort = 'desc'
        } = req.query;
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        // Note: La recherche dans le contenu chiffré ne fonctionne pas
        // Il faudrait déchiffrer tous les messages (coûteux)
        // On recherche par les autres critères
        
        if (id_annon) {
            whereClause.id_annon = Number(id_annon);
        }

        // Recherche par dates
        if (dateFrom || dateTo) {
            whereClause.dateenvoi = {};
            if (dateFrom) {
                whereClause.dateenvoi[Op.gte] = new Date(dateFrom as string);
            }
            if (dateTo) {
                whereClause.dateenvoi[Op.lte] = new Date(dateTo as string);
            }
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
        
        // Pagination
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
        const offset = (page - 1) * limit;

        // Ordre de tri
        const order: any[] = [[sortBy as string, sort === 'asc' ? 'ASC' : 'DESC']];

        const { count, rows: messages } = await Message.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit,
            offset,
            order
        });

        const totalPages = Math.ceil(count / limit);

        // Décrypter les messages
        const decryptedMessages = await decryptMessages(messages);
        
        res.json({
            data: decryptedMessages,
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
