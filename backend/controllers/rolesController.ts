import type {Request, Response, NextFunction} from 'express';
import { Role } from '../models/index.js';

// Récupérer tous les rôles
export const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roles = await Role.findAll();
        res.json(roles);
    } catch (error) {
        next(error);
    }
};

// Récupérer un rôle par son ID
export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle introuvable' });
        }
        res.json(role);
    } catch (error) {
        next(error);
    }
};

// Créer un rôle
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { nom_role, description_role } = req.body;
        if (!nom_role) {
            return res.status(400).json({ message: '`nom_role` est requis' });
        }
        const exists = await Role.findOne({ where: { nom_role } });
        if (exists) {
            return res.status(409).json({ message: 'Le nom du rôle existe déjà' });
        }
        const role = await Role.create({ nom_role, description_role });
        res.status(201).json(role);
    } catch (error) {
        next(error);
    }
};

// Mettre à jour un rôle
export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle introuvable' });
        }
        if (req.body.nom_role) {
            const exists = await Role.findOne({ where: { nom_role: req.body.nom_role, id_role: { $ne: role.id_role } } });
            if (exists) {
                return res.status(409).json({ message: 'Rôle déjà existant' });
            }
        }
        await role.update(req.body);
        res.json(role);
    } catch (error) {
        next(error);
    }
};

// Supprimer un rôle
export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle introuvable' });
        }
        await role.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};