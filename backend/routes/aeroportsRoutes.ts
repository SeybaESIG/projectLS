import express from 'express';
import {
    getAllAeroports,
    getAeroportById,
    searchAeroport
} from '../controllers/aeroportsController.js';

const router = express.Router();

/**
 * @swagger
 * /api/aeroports:
 *   get:
 *     summary: Récupérer tous les aéroports
 *     description: Liste complète des aéroports disponibles. Route publique avec cache Redis (24h).
 *     tags: [Aéroports]
 *     responses:
 *       200:
 *         description: Liste des aéroports récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aeroport'
 *             example:
 *               - id_aeroport: 1
 *                 id_ville: 1
 *                 nom_aeroport: "Aéroport Charles de Gaulle"
 *                 code_iata: "CDG"
 *                 ville: { id_ville: 1, nom_ville: "Paris", id_pays: 1 }
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/', getAllAeroports);

/**
 * @swagger
 * /api/aeroports/search:
 *   get:
 *     summary: Rechercher des aéroports
 *     description: Recherche d'aéroports par nom, code IATA ou ville. Route publique.
 *     tags: [Aéroports]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nom de l'aéroport à rechercher
 *         example: "Charles"
 *       - in: query
 *         name: code_iata
 *         schema:
 *           type: string
 *         description: Code IATA de l'aéroport
 *         example: "CDG"
 *       - in: query
 *         name: ville
 *         schema:
 *           type: integer
 *         description: ID de la ville
 *         example: 1
 *     responses:
 *       200:
 *         description: Aéroports trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aeroport'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/search', searchAeroport);

/**
 * @swagger
 * /api/aeroports/{id}:
 *   get:
 *     summary: Récupérer un aéroport par son ID
 *     description: Détails d'un aéroport spécifique. Route publique.
 *     tags: [Aéroports]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Aéroport trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aeroport'
 *             example:
 *               id_aeroport: 1
 *               id_ville: 1
 *               nom_aeroport: "Aéroport Charles de Gaulle"
 *               code_iata: "CDG"
 *               ville: { id_ville: 1, nom_ville: "Paris", id_pays: 1 }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
router.get('/:id', getAeroportById);

export default router;

/*
Additional route for external API call
import { getExternalAeroport } from '../controllers/aeroportsController.js';
router.get('/external', getExternalAeroport); // GET /api/aeroports/external?iata_code=CDG
 */