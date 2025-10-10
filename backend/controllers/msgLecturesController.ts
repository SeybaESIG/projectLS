import type { Request, Response, NextFunction } from 'express';
import { MsgLecture, Message, Utilisateur, Annonce } from '../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Marquer une conversation comme lue (UPSERT)
export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_expediteur, id_destinataire, id_annon } = req.body;

        // Upsert avec Sequelize
        const [lecture, created] = await MsgLecture.upsert({
            id_expediteur,
            id_destinataire,
            id_annon: id_annon || null,
            dernier_acces: new Date()
        }, {
            returning: true
        });

        res.json({
            message: created ? 'Conversation marquée comme lue' : 'Dernière lecture mise à jour',
            data: lecture
        });
    } catch (error) {
        next(error);
    }
};

// Obtenir le nombre de messages non lus par conversation pour un utilisateur
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;
        const userId = Number(id_util);

        // Requête pour compter les messages non lus par conversation
        const result = await sequelize.query(`
            SELECT 
                m.id_expediteur,
                m.id_annon,
                COUNT(*) as unread_count
            FROM tb_messages m
            LEFT JOIN tb_msg_lectures ml ON (
                ml.id_expediteur = m.id_expediteur
                AND ml.id_destinataire = m.id_destinataire
                AND (ml.id_annon = m.id_annon OR (ml.id_annon IS NULL AND m.id_annon IS NULL))
            )
            WHERE m.id_destinataire = :userId
              AND (ml.dernier_acces IS NULL OR m.dateenvoi > ml.dernier_acces)
            GROUP BY m.id_expediteur, m.id_annon
        `, {
            replacements: { userId },
            type: QueryTypes.SELECT
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Obtenir toutes les conversations avec messages non lus pour un utilisateur
export const getAllUnreadConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;
        const userId = Number(id_util);

        // Récupérer toutes les lectures de l'utilisateur
        const lectures = await MsgLecture.findAll({
            where: { id_destinataire: userId },
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Annonce, required: false }
            ]
        });

        // Pour chaque conversation, compter les messages non lus
        const conversations = await Promise.all(
            lectures.map(async (lecture) => {
                const count = await Message.count({
                    where: {
                        id_expediteur: lecture.id_expediteur,
                        id_destinataire: userId,
                        id_annon: lecture.id_annon,
                        dateenvoi: { [Op.gt]: lecture.dernier_acces }
                    }
                });

                return {
                    ...lecture.toJSON(),
                    unread_count: count
                };
            })
        );

        // Récupérer aussi les conversations jamais ouvertes
        const conversationsNonOuvertes = await sequelize.query(`
            SELECT DISTINCT
                m.id_expediteur,
                m.id_annon,
                COUNT(*) as unread_count
            FROM tb_messages m
            WHERE m.id_destinataire = :userId
              AND NOT EXISTS (
                SELECT 1 FROM tb_msg_lectures ml
                WHERE ml.id_expediteur = m.id_expediteur
                  AND ml.id_destinataire = m.id_destinataire
                  AND (ml.id_annon = m.id_annon OR (ml.id_annon IS NULL AND m.id_annon IS NULL))
              )
            GROUP BY m.id_expediteur, m.id_annon
        `, {
            replacements: { userId },
            type: QueryTypes.SELECT
        });

        res.json({
            conversations_ouvertes: conversations.filter(c => c.unread_count > 0),
            conversations_non_ouvertes: conversationsNonOuvertes
        });
    } catch (error) {
        next(error);
    }
};

// Obtenir toutes les lectures (pour debug/admin)
export const getAllMsgLectures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lectures = await MsgLecture.findAll({
            include: [
                { model: Utilisateur, as: 'expediteur', required: false },
                { model: Utilisateur, as: 'destinataire', required: false },
                { model: Annonce, required: false }
            ]
        });
        res.json(lectures);
    } catch (error) {
        next(error);
    }
};


