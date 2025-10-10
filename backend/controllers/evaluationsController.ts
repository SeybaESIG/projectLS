import type { Request, Response, NextFunction } from 'express';
import { Evaluation, Utilisateur, Transaction } from '../models/index.js';
import { Op } from 'sequelize';

// Récupérer toutes les évaluations avec pagination
export const getAllEvaluations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const offset = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || 'date';
        const sort = ((req.query.sort as string) || 'desc').toUpperCase();

        const { count, rows: evaluations } = await Evaluation.findAndCountAll({
            limit,
            offset,
            order: [[sortBy, sort]],
            include: [
                { model: Utilisateur, as: 'utilDonne', required: false },
                { model: Utilisateur, as: 'utilRecoit', required: false },
                { model: Transaction, required: false }
            ]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            data: evaluations,
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

// Récupérer une évaluation par sa clé composite
export const getEvaluationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util_donne, id_util_recoit, id_transa } = req.params;

        const evaluation = await Evaluation.findOne({
            where: {
                id_util_donne: Number(id_util_donne),
                id_util_recoit: Number(id_util_recoit),
                id_transa: Number(id_transa)
            },
            include: [
                { model: Utilisateur, as: 'utilDonne', required: false },
                { model: Utilisateur, as: 'utilRecoit', required: false },
                { model: Transaction, required: false }
            ]
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Évaluation non trouvée' });
        }

        res.json(evaluation);
    } catch (error) {
        next(error);
    }
};

// Récupérer les évaluations reçues par un utilisateur
export const getEvaluationsRecues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;

        const evaluations = await Evaluation.findAll({
            where: { id_util_recoit: Number(id_util) },
            order: [['date', 'DESC']],
            include: [
                { model: Utilisateur, as: 'utilDonne', required: false },
                { model: Transaction, required: false }
            ]
        });

        res.json(evaluations);
    } catch (error) {
        next(error);
    }
};

// Récupérer les évaluations données par un utilisateur
export const getEvaluationsDonnees = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util } = req.params;

        const evaluations = await Evaluation.findAll({
            where: { id_util_donne: Number(id_util) },
            order: [['date', 'DESC']],
            include: [
                { model: Utilisateur, as: 'utilRecoit', required: false },
                { model: Transaction, required: false }
            ]
        });

        res.json(evaluations);
    } catch (error) {
        next(error);
    }
};

// Créer une nouvelle évaluation (la note_moyenne se met à jour automatiquement via trigger)
export const createEvaluation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newEvaluation = await Evaluation.create(req.body);

        // Récupérer l'évaluation avec les relations
        const evaluationComplete = await Evaluation.findOne({
            where: {
                id_util_donne: newEvaluation.id_util_donne,
                id_util_recoit: newEvaluation.id_util_recoit,
                id_transa: newEvaluation.id_transa
            },
            include: [
                { model: Utilisateur, as: 'utilDonne', required: false },
                { model: Utilisateur, as: 'utilRecoit', required: false },
                { model: Transaction, required: false }
            ]
        });

        res.status(201).json(evaluationComplete);
    } catch (error) {
        next(error);
    }
};

// Supprimer une évaluation (la note_moyenne se met à jour automatiquement via trigger)
export const deleteEvaluation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id_util_donne, id_util_recoit, id_transa } = req.params;

        const evaluation = await Evaluation.findOne({
            where: {
                id_util_donne: Number(id_util_donne),
                id_util_recoit: Number(id_util_recoit),
                id_transa: Number(id_transa)
            }
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Évaluation non trouvée' });
        }

        await evaluation.destroy();
        res.json({ message: 'Évaluation supprimée' });
    } catch (error) {
        next(error);
    }
};

// Rechercher des évaluations
export const searchEvaluations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { 
            user_donne, 
            user_recoit,
            id_util_donne,
            id_util_recoit,
            note_min, 
            note_max, 
            dateFrom,
            dateTo,
            page: pageParam,
            limit: limitParam,
            sortBy = 'date',
            sort = 'desc'
        } = req.query;
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        // Filtrer par id_util_donne
        if (id_util_donne) {
            whereClause.id_util_donne = Number(id_util_donne);
        }

        // Filtrer par id_util_recoit
        if (id_util_recoit) {
            whereClause.id_util_recoit = Number(id_util_recoit);
        }

        // Recherche par note (fourchette)
        if (note_min || note_max) {
            whereClause.note = {};
            if (note_min) {
                whereClause.note[Op.gte] = parseFloat(note_min as string);
            }
            if (note_max) {
                whereClause.note[Op.lte] = parseFloat(note_max as string);
            }
        }
        
        // Recherche par dates
        if (dateFrom || dateTo) {
            whereClause.date = {};
            if (dateFrom) {
                whereClause.date[Op.gte] = new Date(dateFrom as string);
            }
            if (dateTo) {
                whereClause.date[Op.lte] = new Date(dateTo as string);
            }
        }
        
        // Recherche par username de celui qui donne
        if (user_donne) {
            includeClause.push({
                model: Utilisateur,
                as: 'utilDonne',
                where: {
                    username: { [Op.iLike]: `%${user_donne}%` }
                },
                required: true
            });
        } else {
            includeClause.push({
                model: Utilisateur,
                as: 'utilDonne'
            });
        }
        
        // Recherche par username de celui qui reçoit
        if (user_recoit) {
            includeClause.push({
                model: Utilisateur,
                as: 'utilRecoit',
                where: {
                    username: { [Op.iLike]: `%${user_recoit}%` }
                },
                required: true
            });
        } else {
            includeClause.push({
                model: Utilisateur,
                as: 'utilRecoit'
            });
        }

        // Inclure la transaction
        includeClause.push({
            model: Transaction,
            required: false
        });
        
        // Pagination
        const page = Math.max(1, Number(pageParam) || 1);
        const limit = Math.min(100, Math.max(1, Number(limitParam) || 50));
        const offset = (page - 1) * limit;

        // Ordre de tri
        const order: any[] = [[sortBy as string, sort === 'asc' ? 'ASC' : 'DESC']];

        const { count, rows: evaluations } = await Evaluation.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit,
            offset,
            order
        });

        const totalPages = Math.ceil(count / limit);
        
        res.json({
            data: evaluations,
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
