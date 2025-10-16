import express from 'express';
import {
    getMyProfile,
    updateMyProfile,
    deleteMyAccount,
} from '../controllers/meController.js';
import { validate } from '../middlewares/validation.js';
import { userSchemas } from '../schemas/userSchemas.js';

const router = express.Router();

/**
 * Routes pour gérer le profil personnel de l'utilisateur connecté
 * Toutes ces routes nécessitent une authentification Firebase
 */

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Voir son propre profil
 *     description: Récupère le profil de l'utilisateur actuellement connecté. **Authentification requise**.
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *             example:
 *               id_util: 1
 *               nom: "Martin"
 *               prenom: "Alice"
 *               email: "alice.martin@example.com"
 *               tel: "+33612345678"
 *               username: "alice_m"
 *               date_inscription: "2025-01-15T10:30:00Z"
 *               note_moyenne: 4.5
 *               nb_voyages: 12
 *               bio: "Passionnée de voyages"
 *               role: { id_role: 1, nom_role: "user" }
 *               ville: { id_ville: 1, nom_ville: "Paris" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Utilisateur non trouvé (email Firebase pas dans la DB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/', getMyProfile);

/**
 * @swagger
 * /api/me:
 *   patch:
 *     summary: Modifier son propre profil
 *     description: Mettre à jour les informations de son profil. **Authentification requise**. Certains champs sont protégés (email, role, note_moyenne).
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               tel:
 *                 type: string
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               id_ville:
 *                 type: integer
 *           example:
 *             bio: "Voyageuse passionnée depuis 10 ans"
 *             tel: "+33698765432"
 *     responses:
 *       200:
 *         description: Profil modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.patch('/', validate(userSchemas.update, 'body'), updateMyProfile);

/**
 * @swagger
 * /api/me:
 *   delete:
 *     summary: Supprimer son propre compte
 *     description: Suppression définitive du compte utilisateur. **Authentification requise**. Cette action est irréversible.
 *     tags: [Profil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compte supprimé avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.delete('/', deleteMyAccount);

export default router;

