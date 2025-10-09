import type { Request, Response, NextFunction } from 'express';

// Middleware complet de gestion des erreurs
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    // Journaliser les détails de l'erreur
    console.error(err);

    // Gestion des erreurs de contrainte UNIQUE de Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors?.[0]?.path;
        if (field === 'email') {
            return res.status(409).json({ message: 'Cette adresse email est déjà utilisée' });
        } else if (field === 'tel') {
            return res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        } else if (field === 'username') {
            return res.status(409).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
        } else {
            return res.status(409).json({ message: `Le champ ${field} doit être unique` });
        }
    }

    // Gestion personnalisée des erreurs
    if (err.status === 400) {
        return res.status(400).json({ message: err.message || 'Mauvaise requête' });
    }
    if (err.status === 401) {
        return res.status(401).json({ message: err.message || 'Non autorisé' });
    }
    if (err.status === 403) {
        return res.status(403).json({ message: err.message || 'Interdit' });
    }
    if (err.status === 404) {
        return res.status(404).json({ message: err.message || 'Non trouvé' });
    }

    // Erreur de validation
    if (err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({ message: 'Erreur de validation', errors: err.errors });
    }

    // Par défaut, erreur 500
    res.status(500).json({ message: 'Erreur interne du serveur' });
}