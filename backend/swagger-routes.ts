/**
 * Documentation Swagger complète de tous les endpoints
 * 
 * Ce fichier est scanné par swagger-jsdoc pour générer la documentation OpenAPI
 * Accessible sur : http://localhost:3000/api-docs
 */

// Ce fichier contient uniquement des commentaires JSDoc pour Swagger
// Il n'est pas importé directement, mais scanné par swagger-jsdoc

/**
 * @swagger
 * components:
 *   examples:
 *     FakeToken:
 *       value: fake-token-for-testing
 *       summary: Token de test (ne fonctionne pas réellement)
 */

// ========================================
// ROUTES MESSAGES
// ========================================

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Récupérer tous ses messages
 *     description: Liste paginée des messages envoyés ou reçus par l'utilisateur connecté.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Messages récupérés
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Envoyer un message
 *     description: Créer un nouveau message. L'expéditeur est automatiquement l'utilisateur connecté.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_destinataire, contenu]
 *             properties:
 *               id_destinataire: { type: integer, example: 2 }
 *               id_annon: { type: integer, example: 1 }
 *               contenu: { type: string, example: "Bonjour!" }
 *     responses:
 *       201:
 *         description: Message envoyé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Récupérer un message
 *     description: Détails d'un message. L'utilisateur doit être expéditeur ou destinataire.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Message trouvé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Supprimer un message
 *     description: Supprimer un message envoyé. Seulement l'expéditeur peut supprimer.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Message supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/messages/conversation:
 *   get:
 *     summary: Récupérer une conversation
 *     description: Messages entre deux utilisateurs pour une annonce.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_expediteur
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: id_destinataire
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: id_annon
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Conversation récupérée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES ÉVALUATIONS
// ========================================

/**
 * @swagger
 * /api/evaluations/recues/{id_util}:
 *   get:
 *     summary: Évaluations reçues par un utilisateur
 *     description: Liste des évaluations reçues. L'utilisateur doit accéder à ses propres évaluations.
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_util
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Évaluations récupérées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/evaluations/donnees/{id_util}:
 *   get:
 *     summary: Évaluations données par un utilisateur
 *     description: Liste des évaluations données. L'utilisateur doit accéder à ses propres évaluations.
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_util
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Évaluations récupérées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/evaluations:
 *   post:
 *     summary: Créer une évaluation
 *     description: Évaluer un autre utilisateur après un voyage.
 *     tags: [Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_util_recoit, id_transa, note]
 *             properties:
 *               id_util_recoit: { type: integer, example: 2 }
 *               id_transa: { type: integer, example: 1 }
 *               note: { type: integer, minimum: 1, maximum: 5, example: 5 }
 *               commentaire: { type: string, example: "Excellent compagnon de voyage!" }
 *     responses:
 *       201:
 *         description: Évaluation créée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// ========================================
// ROUTES ABONNEMENTS
// ========================================

/**
 * @swagger
 * /api/abonnements:
 *   get:
 *     summary: Voir son abonnement
 *     description: Récupère l'abonnement de l'utilisateur connecté.
 *     tags: [Abonnements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Abonnement récupéré
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     summary: Créer un abonnement
 *     description: Souscrire à un type d'abonnement.
 *     tags: [Abonnements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_type_abonnement]
 *             properties:
 *               id_type_abonnement: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Abonnement créé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// ========================================
// ROUTES ADMIN - USERS
// ========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste de tous les utilisateurs (Admin)
 *     description: Récupère tous les utilisateurs. **Rôle admin requis**.
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Utilisateurs récupérés
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID (Admin)
 *     description: Détails d'un utilisateur. **Rôle admin requis**.
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Modifier un utilisateur (Admin)
 *     description: Modifier les informations d'un utilisateur. **Rôle admin requis**.
 *     tags: [Admin - Users]
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
 *               nom: { type: string }
 *               prenom: { type: string }
 *               email: { type: string }
 *               id_role: { type: integer }
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Supprimer un utilisateur (Admin)
 *     description: Suppression d'un utilisateur. **Rôle admin requis**.
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES ADMIN - HISTORIQUES
// ========================================

/**
 * @swagger
 * /api/historique_annonces:
 *   get:
 *     summary: Historique complet des annonces (Admin)
 *     description: Tous les changements d'annonces. **Rôle admin requis**.
 *     tags: [Admin - Historiques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Historique récupéré
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/historique_abonnements:
 *   get:
 *     summary: Historique complet des abonnements (Admin)
 *     description: Tous les changements d'abonnements. **Rôle admin requis**.
 *     tags: [Admin - Historiques]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Historique récupéré
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES ADMIN - TRANSACTIONS
// ========================================

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Liste de toutes les transactions (Admin)
 *     description: Toutes les transactions de la plateforme. **Rôle admin requis**.
 *     tags: [Admin - Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Transactions récupérées
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES ADMIN - PAIEMENTS
// ========================================

/**
 * @swagger
 * /api/paiements:
 *   get:
 *     summary: Liste de tous les paiements (Admin)
 *     description: Tous les paiements de la plateforme. **Rôle admin requis**.
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Paiements récupérés
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/payer:
 *   post:
 *     summary: Créer un paiement Stripe
 *     description: Initier un payment intent Stripe. **Authentification requise**.
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, example: 2550, description: "Montant en centimes (25.50€ = 2550)" }
 *               currency: { type: string, default: "eur", example: "eur" }
 *     responses:
 *       200:
 *         description: Payment intent créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// ========================================
// ROUTES ADMIN - TYPES ABONNEMENTS
// ========================================

/**
 * @swagger
 * /api/types_abonnement:
 *   get:
 *     summary: Liste des types d'abonnements (Admin)
 *     description: Tous les types d'abonnements disponibles. **Rôle admin requis**.
 *     tags: [Admin - Types Abonnements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *     responses:
 *       200:
 *         description: Types récupérés
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES ADMIN - RÔLES
// ========================================

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Liste de tous les rôles (Admin)
 *     description: Tous les rôles disponibles. **Rôle admin requis**.
 *     tags: [Admin - Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rôles récupérés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

// ========================================
// ROUTES UPLOAD
// ========================================

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload une image
 *     description: Upload d'une image vers Google Cloud Storage. **Authentification requise**. Rate limit 10/15min.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPG, PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Image uploadée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, example: "https://storage.googleapis.com/bucket/image.jpg" }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

// ========================================
// ROUTES WEBHOOK
// ========================================

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: Webhook Stripe
 *     description: Endpoint pour recevoir les événements Stripe (paiements, etc.). Route publique mais sécurisée par signature Stripe.
 *     tags: [Paiements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Événement Stripe
 *     responses:
 *       200:
 *         description: Webhook traité
 *       400:
 *         description: Signature invalide
 */



