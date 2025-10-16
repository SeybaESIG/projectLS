import express from 'express';
import {
    getAllPays,
    getPaysById,
    searchPaysByName
} from '../controllers/paysController.js';

const router = express.Router();

/**
 * @swagger
 * /api/pays:
 *   get:
 *     summary: Récupérer tous les pays
 *     description: Liste complète des pays disponibles. Cette route est **publique** et utilise le cache Redis (24h).
 *     tags: [Pays]
 *     responses:
 *       200:
 *         description: Liste des pays récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pays'
 *             example:
 *               - id_pays: 1
 *                 nom_pays: "France"
 *                 code_iso_pays: "FR"
 *               - id_pays: 2
 *                 nom_pays: "Espagne"
 *                 code_iso_pays: "ES"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/', getAllPays);

/**
 * @swagger
 * /api/pays/search:
 *   get:
 *     summary: Rechercher des pays par nom
 *     description: Recherche de pays par nom (insensible à la casse). Route publique.
 *     tags: [Pays]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du pays à rechercher
 *         example: "Fran"
 *     responses:
 *       200:
 *         description: Pays trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pays'
 *             example:
 *               - id_pays: 1
 *                 nom_pays: "France"
 *                 code_iso_pays: "FR"
 *       400:
 *         description: Paramètre 'name' manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/search', searchPaysByName);

/**
 * @swagger
 * /api/pays/{id}:
 *   get:
 *     summary: Récupérer un pays par son ID
 *     description: Détails d'un pays spécifique. Route publique.
 *     tags: [Pays]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Pays trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pays'
 *             example:
 *               id_pays: 1
 *               nom_pays: "France"
 *               code_iso_pays: "FR"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/:id', getPaysById);

export default router;