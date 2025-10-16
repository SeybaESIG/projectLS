import express from 'express';
import {
    getAllVilles,
    getVilleById,
    searchVille
} from '../controllers/villesController.js';

const router = express.Router();

/**
 * @swagger
 * /api/villes:
 *   get:
 *     summary: Récupérer toutes les villes
 *     description: Liste complète des villes disponibles. Route publique avec cache Redis (24h).
 *     tags: [Villes]
 *     responses:
 *       200:
 *         description: Liste des villes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ville'
 *             example:
 *               - id_ville: 1
 *                 nom_ville: "Paris"
 *                 id_pays: 1
 *                 pays: { id_pays: 1, nom_pays: "France", code_iso_pays: "FR" }
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/', getAllVilles);

/**
 * @swagger
 * /api/villes/search:
 *   get:
 *     summary: Rechercher des villes par nom ou pays
 *     description: Recherche de villes par nom (insensible à la casse) ou par pays. Route publique.
 *     tags: [Villes]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nom de la ville à rechercher
 *         example: "Par"
 *       - in: query
 *         name: pays
 *         schema:
 *           type: integer
 *         description: ID du pays pour filtrer
 *         example: 1
 *     responses:
 *       200:
 *         description: Villes trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ville'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/search', searchVille);

/**
 * @swagger
 * /api/villes/{id}:
 *   get:
 *     summary: Récupérer une ville par son ID
 *     description: Détails d'une ville spécifique. Route publique.
 *     tags: [Villes]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Ville trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ville'
 *             example:
 *               id_ville: 1
 *               nom_ville: "Paris"
 *               id_pays: 1
 *               pays: { id_pays: 1, nom_pays: "France", code_iso_pays: "FR" }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/:id', getVilleById);

export default router;