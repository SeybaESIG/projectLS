import type { Request, Response, NextFunction } from 'express';
import { Utilisateur, Role, Ville } from '../models/index.js';
import bcrypt from 'bcrypt';
import { userSchemas } from '../schemas/index.js';
import { Op } from 'sequelize';

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
        // Validation des données d'entrée
        const { error } = userSchemas.create.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details?.[0]?.message ?? error.message });
            return;
        }

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

        // Hachage du mot de passe
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
    } catch (err: any) {
        // Gestion des erreurs de contrainte UNIQUE
        if (err.name === 'SequelizeUniqueConstraintError') {
            const field = err.errors?.[0]?.path;
            if (field === 'email') {
                res.status(409).json({ message: 'Cette adresse email est déjà utilisée' });
                return;
            } else if (field === 'tel') {
                res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
                return;
            } else if (field === 'username') {
                res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
                return;
            }
        }
        next(err);
    }
}

// Mettre à jour un utilisateur existant
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Validation des données d'entrée
        const { error } = userSchemas.update.validate(req.body);
        if (error) {
            res.status(400).json({ message: error.details?.[0]?.message ?? error.message });
            return;
        }

        const id = Number(req.params['id']);
        const user = await Utilisateur.findByPk(id);
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        const updates = { ...req.body };

        // Si le mot de passe est présent, le hacher avant la mise à jour
        if (updates.mot_de_passe) {
            updates.mot_de_passe = await bcrypt.hash(updates.mot_de_passe, 10);
        }

        await user.update(updates);
        res.json(user);
    } catch (err: any) {
        // Gestion des erreurs de contrainte UNIQUE
        if (err.name === 'SequelizeUniqueConstraintError') {
            const field = err.errors?.[0]?.path;
            if (field === 'email') {
                res.status(409).json({ message: 'Cette adresse email est déjà utilisée' });
                return;
            } else if (field === 'tel') {
                res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
                return;
            } else if (field === 'username') {
                res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
                return;
            }
        }
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

// Récupérer les utilisateurs par rôle
export async function getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const roleId = Number(req.params['roleId']);
        const users = await Utilisateur.findAll({ where: { id_role: roleId }, include: [Role, Ville] });
        res.json(users);
    } catch (err) {
        next(err);
    }
}

// Récupérer les utilisateurs par ville
export async function getUsersByVille(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const villeId = Number(req.params['villeId']);
        const users = await Utilisateur.findAll({ where: { id_ville: villeId }, include: [Role, Ville] });
        res.json(users);
    } catch (err) {
        next(err);
    }
}

// Rechercher des utilisateurs (ex: /api/users/search?username=alice&ville=Bamako&role=admin)
// Paramètres possibles: username, nom, prenom, email, tel, date_inscription, ville, role
export async function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { username, nom, prenom, email, tel, date_inscription, ville, role } = req.query;
        
        const whereClause: any = {};
        const includeClause: any[] = [];
        
        if (username) {
            whereClause.username = { [Op.iLike]: `%${username}%` };
        }
        if (nom) {
            whereClause.nom = { [Op.iLike]: `%${nom}%` };
        }
        if (prenom) {
            whereClause.prenom = { [Op.iLike]: `%${prenom}%` };
        }
        if (email) {
            whereClause.email = { [Op.iLike]: `%${email}%` };
        }
        if (tel) {
            whereClause.tel = { [Op.iLike]: `%${tel}%` };
        }
        if (date_inscription) {
            // Recherche par date exacte ou par année-mois-jour
            whereClause.date_inscription = {
                [Op.gte]: new Date(date_inscription as string),
                [Op.lt]: new Date(new Date(date_inscription as string).getTime() + 24 * 60 * 60 * 1000)
            };
        }
        
        // Recherche par nom de rôle
        if (role) {
            includeClause.push({
                model: Role,
                where: {
                    nom_role: { [Op.iLike]: `%${role}%` }
                },
                required: true
            });
        } else {
            includeClause.push(Role);
        }
        
        // Recherche par nom de ville
        if (ville) {
            includeClause.push({
                model: Ville,
                where: {
                    nom_ville: { [Op.iLike]: `%${ville}%` }
                },
                required: true
            });
        } else {
            includeClause.push(Ville);
        }
        
        if (Object.keys(whereClause).length === 0 && !ville && !role) {
            res.status(400).json({ message: 'Au moins un paramètre de recherche est requis (username, nom, prenom, email, tel, date_inscription, ville, role)' });
            return;
        }
        
        const users = await Utilisateur.findAll({
            where: whereClause,
            include: includeClause
        });
        
        res.json(users);
    } catch (err) {
        next(err);
    }
}
