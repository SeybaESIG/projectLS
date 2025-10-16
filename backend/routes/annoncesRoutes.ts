import express from 'express';
import {
  getAllAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  searchAnnonces,
} from '../controllers/annoncesController.js';
import { validate } from '../middlewares/validation.js';
import { annonceSchemas } from '../schemas/annonceSchemas.js';

const router = express.Router();

/**
 * @swagger
 * /api/annonces:
 *   get:
 *     summary: Récupérer toutes les annonces
 *     description: Liste complète des annonces de voyage. Route publique (lecture), authentification requise pour créer/modifier/supprimer.
 *     tags: [Annonces]
 *     responses:
 *       200:
 *         description: Liste des annonces récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annonce'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/', getAllAnnonces);

/**
 * @swagger
 * /api/annonces/search:
 *   get:
 *     summary: Rechercher des annonces
 *     description: Recherche d'annonces par critères (ville départ/arrivée, date, prix, etc.). Route publique.
 *     tags: [Annonces]
 *     parameters:
 *       - in: query
 *         name: aerodep
 *         schema:
 *           type: integer
 *         description: ID aéroport de départ
 *       - in: query
 *         name: aeroarr
 *         schema:
 *           type: integer
 *         description: ID aéroport d'arrivée
 *       - in: query
 *         name: datedepart
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de départ (YYYY-MM-DD)
 *         example: "2025-02-01"
 *       - in: query
 *         name: prix_max
 *         schema:
 *           type: number
 *         description: Prix maximum
 *         example: 50
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Statut de l'annonce
 *     responses:
 *       200:
 *         description: Annonces trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annonce'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/search', searchAnnonces);

/**
 * @swagger
 * /api/annonces/{id}:
 *   get:
 *     summary: Récupérer une annonce par son ID
 *     description: Détails d'une annonce spécifique. Route publique.
 *     tags: [Annonces]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Annonce trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonce'
 *             example:
 *               id_annon: 1
 *               titre: "Voyage Paris → Lyon"
 *               description: "Covoiturage pour 3 personnes"
 *               prix: 25.50
 *               nbplaces: 3
 *               datedepart: "2025-02-01T14:00:00Z"
 *               statut: "active"
 *               auteur: { id_util: 1, nom: "Martin", prenom: "Alice" }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/:id', validate(annonceSchemas.params, 'params'), getAnnonceById);

/**
 * @swagger
 * /api/annonces:
 *   post:
 *     summary: Créer une nouvelle annonce
 *     description: Créer une annonce de voyage. **Authentification requise**. L'utilisateur sera automatiquement défini comme auteur.
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - prix
 *               - nbplaces
 *               - datedepart
 *               - id_aerodep
 *               - id_aeroarr
 *             properties:
 *               titre:
 *                 type: string
 *                 example: "Voyage Paris → Lyon"
 *               description:
 *                 type: string
 *                 example: "Covoiturage pour 3 personnes, départ 14h"
 *               prix:
 *                 type: number
 *                 example: 25.50
 *               nbplaces:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               datedepart:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-01T14:00:00Z"
 *               id_aerodep:
 *                 type: integer
 *                 example: 1
 *               id_aeroarr:
 *                 type: integer
 *                 example: 2
 *               statut:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *                 default: active
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonce'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.post('/', validate(annonceSchemas.create, 'body'), createAnnonce);

/**
 * @swagger
 * /api/annonces/{id}:
 *   patch:
 *     summary: Modifier une annonce
 *     description: Modifier une annonce existante. **Authentification requise**. Seulement l'auteur peut modifier son annonce.
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               nbplaces:
 *                 type: integer
 *               datedepart:
 *                 type: string
 *                 format: date-time
 *               statut:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *           example:
 *             prix: 30.00
 *             nbplaces: 2
 *     responses:
 *       200:
 *         description: Annonce modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonce'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.patch('/:id', validate(annonceSchemas.params, 'params'), validate(annonceSchemas.update, 'body'), updateAnnonce);

/**
 * @swagger
 * /api/annonces/{id}:
 *   delete:
 *     summary: Supprimer une annonce
 *     description: Supprimer une annonce existante. **Authentification requise**. Seulement l'auteur peut supprimer son annonce.
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Annonce supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce supprimée avec succès"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.delete('/:id', validate(annonceSchemas.params, 'params'), deleteAnnonce);

export default router;