import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/firebaseAuth.js';
import { Utilisateur, Role, Ville } from '../models/index.js';

/**
 * Récupérer le profil de l'utilisateur connecté
 * Note: Utilise l'email Firebase pour trouver l'utilisateur dans la DB locale
 */
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const firebaseEmail = req.user?.email;

        if (!firebaseEmail) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        // Trouver l'utilisateur par son email (correspond à l'email Firebase)
        const utilisateur = await Utilisateur.findOne({
            where: { email: firebaseEmail },
            include: [
                { model: Role, attributes: ['id_role', 'nom_role'] },
                { model: Ville, attributes: ['id_ville', 'nom_ville'] }
            ]
        });

        if (!utilisateur) {
            return res.status(404).json({ 
                error: 'Profil non trouvé',
                message: 'Aucun utilisateur trouvé avec cet email dans la base de données'
            });
        }

        res.json(utilisateur);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const firebaseEmail = req.user?.email;

        if (!firebaseEmail) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        // Trouver l'utilisateur par son email
        const utilisateur = await Utilisateur.findOne({
            where: { email: firebaseEmail }
        });

        if (!utilisateur) {
            return res.status(404).json({ error: 'Profil non trouvé' });
        }

        // Empêcher la modification de certains champs sensibles
        const { id_util, id_role, date_inscription, note_moyenne, mot_de_passe, ...updateData } = req.body;

        // Mettre à jour le profil
        await utilisateur.update(updateData);

        // Recharger avec les associations
        const updatedUtilisateur = await Utilisateur.findOne({
            where: { email: firebaseEmail },
            include: [
                { model: Role, attributes: ['id_role', 'nom_role'] },
                { model: Ville, attributes: ['id_ville', 'nom_ville'] }
            ]
        });

        res.json(updatedUtilisateur);
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer le compte de l'utilisateur connecté
 */
export const deleteMyAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const firebaseEmail = req.user?.email;

        if (!firebaseEmail) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        // Trouver l'utilisateur par son email
        const utilisateur = await Utilisateur.findOne({
            where: { email: firebaseEmail }
        });

        if (!utilisateur) {
            return res.status(404).json({ error: 'Profil non trouvé' });
        }

        // Supprimer le compte
        await utilisateur.destroy();

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

