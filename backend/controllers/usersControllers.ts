import type { Request, Response, NextFunction } from 'express';
import { Utilisateur, Role, Ville } from '../models/index.js';
import bcrypt from 'bcrypt';

// Récupérer tous les utilisateurs avec leurs rôles et villes associés
export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const users = await Utilisateur.findAll({ include: [Role, Ville] });
        res.json(users);
    } catch (err) {
        next(err);
    }
}

// Récupérer un utilisateur par ID avec rôle et ville associés
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const id = Number(req.params['id']);
        const user = await Utilisateur.findByPk(id, { include: [Role, Ville] });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
}

// Créer un nouvel utilisateur
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const {
            id_ville,
            id_role,
            username,
            nom,
            prenom,
            email,
            tel,
            mot_de_passe,
            piece_id,
            photo,
            adresse,
            detail_adresse,
        } = req.body ?? {};

        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        const created = await Utilisateur.create({
            id_ville,
            id_role,
            username,
            nom,
            prenom,
            email: email ?? null,
            tel: tel ?? null,
            mot_de_passe: hashedPassword,
            piece_id: piece_id ?? null,
            photo: photo ?? null,
            adresse: adresse ?? null,
            detail_adresse: detail_adresse ?? null,
        });
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

// Mettre à jour un utilisateur existant
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const id = Number(req.params['id']);
        const user = await Utilisateur.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        const updates = req.body ?? {};
        await user.update(updates);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

// Supprimer un utilisateur
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const id = Number(req.params['id']);
        const deleted = await Utilisateur.destroy({ where: { id_util: id } });
        if (deleted === 0) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
