import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuration Swagger/OpenAPI pour la documentation interactive de l'API
 * 
 * Accessible sur : http://localhost:3000/api-docs
 */

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Backend - Plateforme de mise en relation pour transport de colis',
      version: '1.0.0',
      description: `
# API Backend - Documentation complète

Cette API permet de gérer une plateforme qui met en relation des utilisateurs pour le transport de colis lors de leurs voyages. Avec:
- Gestion des utilisateurs et authentification Firebase
- Annonces de voyage
- Messagerie entre utilisateurs
- Système d'évaluations
- Abonnements et paiements (Stripe)
- Upload d'images (Google Cloud Storage)

## 🔐 Authentification

Les routes protégées nécessitent un **token Firebase JWT** dans le header :

\`\`\`
Authorization: Bearer YOUR_FIREBASE_TOKEN
\`\`\`

Pour tester avec un faux token dans Swagger : Utilisez \`fake-token-for-testing\`

## 🎯 Niveaux d'accès

- 🌐 **Public** : Pas d'authentification requise
- 🔐 **Authentifié** : Token Firebase requis
- 👑 **Admin** : Token Firebase + rôle admin requis
      `,
      contact: {
        name: 'Support API',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.votredomaine.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token Firebase JWT. Pour tester : utilisez "fake-token-for-testing"'
        }
      },
      schemas: {
        // ========================================
        // SCHÉMAS DES MODÈLES
        // ========================================
        
        Pays: {
          type: 'object',
          properties: {
            id_pays: { type: 'integer', example: 1 },
            nom_pays: { type: 'string', example: 'France' },
            code_iso_pays: { type: 'string', example: 'FR' }
          }
        },
        
        Ville: {
          type: 'object',
          properties: {
            id_ville: { type: 'integer', example: 1 },
            nom_ville: { type: 'string', example: 'Paris' },
            id_pays: { type: 'integer', example: 1 },
            pays: { $ref: '#/components/schemas/Pays' }
          }
        },
        
        Aeroport: {
          type: 'object',
          properties: {
            id_aeroport: { type: 'integer', example: 1 },
            id_ville: { type: 'integer', example: 1 },
            nom_aeroport: { type: 'string', example: 'Aéroport Charles de Gaulle' },
            code_iata: { type: 'string', example: 'CDG' },
            ville: { $ref: '#/components/schemas/Ville' }
          }
        },
        
        Role: {
          type: 'object',
          properties: {
            id_role: { type: 'integer', example: 1 },
            nom_role: { type: 'string', example: 'user' }
          }
        },
        
        Utilisateur: {
          type: 'object',
          properties: {
            id_util: { type: 'integer', example: 1 },
            nom: { type: 'string', example: 'Martin' },
            prenom: { type: 'string', example: 'Alice' },
            email: { type: 'string', format: 'email', example: 'alice.martin@example.com' },
            tel: { type: 'string', example: '+33612345678' },
            username: { type: 'string', example: 'alice_m' },
            date_inscription: { type: 'string', format: 'date-time', example: '2025-01-15T10:30:00Z' },
            note_moyenne: { type: 'number', format: 'float', example: 4.5 },
            nb_voyages: { type: 'integer', example: 12 },
            bio: { type: 'string', example: 'Passionnée de voyages' },
            id_role: { type: 'integer', example: 1 },
            id_ville: { type: 'integer', example: 1 },
            role: { $ref: '#/components/schemas/Role' },
            ville: { $ref: '#/components/schemas/Ville' }
          }
        },
        
        Annonce: {
          type: 'object',
          properties: {
            id_annon: { type: 'integer', example: 1 },
            titre: { type: 'string', example: 'Voyage Paris → Lyon' },
            description: { type: 'string', example: 'Covoiturage pour 3 personnes' },
            prix: { type: 'number', format: 'float', example: 25.50 },
            nbplaces: { type: 'integer', example: 3 },
            datedepart: { type: 'string', format: 'date-time', example: '2025-02-01T14:00:00Z' },
            datepublication: { type: 'string', format: 'date-time', example: '2025-01-15T10:00:00Z' },
            statut: { type: 'string', enum: ['active', 'completed', 'cancelled'], example: 'active' },
            id_util: { type: 'integer', example: 1 },
            id_aerodep: { type: 'integer', example: 1 },
            id_aeroarr: { type: 'integer', example: 2 },
            auteur: { $ref: '#/components/schemas/Utilisateur' },
            aeroportDepart: { $ref: '#/components/schemas/Aeroport' },
            aeroportArrivee: { $ref: '#/components/schemas/Aeroport' }
          }
        },
        
        Message: {
          type: 'object',
          properties: {
            id_msg: { type: 'integer', example: 1 },
            id_expediteur: { type: 'integer', example: 1 },
            id_destinataire: { type: 'integer', example: 2 },
            id_annon: { type: 'integer', example: 1 },
            contenu: { type: 'string', example: 'Bonjour, est-ce que cette annonce est toujours disponible ?' },
            dateenvoi: { type: 'string', format: 'date-time', example: '2025-01-15T14:30:00Z' },
            statut_msg: { type: 'string', enum: ['sent', 'delivered', 'read'], example: 'sent' },
            expediteur: { $ref: '#/components/schemas/Utilisateur' },
            destinataire: { $ref: '#/components/schemas/Utilisateur' },
            annonce: { $ref: '#/components/schemas/Annonce' }
          }
        },
        
        Evaluation: {
          type: 'object',
          properties: {
            id_util_donne: { type: 'integer', example: 1 },
            id_util_recoit: { type: 'integer', example: 2 },
            id_transa: { type: 'integer', example: 1 },
            note: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            commentaire: { type: 'string', example: 'Excellent compagnon de voyage !' },
            date: { type: 'string', format: 'date-time', example: '2025-01-16T10:00:00Z' },
            utilisateurDonne: { $ref: '#/components/schemas/Utilisateur' },
            utilisateurRecoit: { $ref: '#/components/schemas/Utilisateur' }
          }
        },
        
        TypeAbonnement: {
          type: 'object',
          properties: {
            id_type_abonnement: { type: 'integer', example: 1 },
            nom_type: { type: 'string', example: 'Premium' },
            prix: { type: 'number', format: 'float', example: 9.99 },
            duree_mois: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Abonnement mensuel avec tous les avantages' }
          }
        },
        
        Abonnement: {
          type: 'object',
          properties: {
            id_abo: { type: 'integer', example: 1 },
            id_util: { type: 'integer', example: 1 },
            id_type_abonnement: { type: 'integer', example: 1 },
            date_debut: { type: 'string', format: 'date', example: '2025-01-01' },
            date_fin: { type: 'string', format: 'date', example: '2025-02-01' },
            statut: { type: 'string', enum: ['actif', 'expiré', 'annulé'], example: 'actif' },
            utilisateur: { $ref: '#/components/schemas/Utilisateur' },
            typeAbonnement: { $ref: '#/components/schemas/TypeAbonnement' }
          }
        },
        
        Transaction: {
          type: 'object',
          properties: {
            id_transa: { type: 'integer', example: 1 },
            id_annon: { type: 'integer', example: 1 },
            id_payeur: { type: 'integer', example: 1 },
            id_receveur: { type: 'integer', example: 2 },
            montant: { type: 'number', format: 'float', example: 25.50 },
            date: { type: 'string', format: 'date-time', example: '2025-01-15T14:00:00Z' },
            statut: { type: 'string', enum: ['pending', 'completed', 'cancelled', 'refunded'], example: 'completed' },
            payeur: { $ref: '#/components/schemas/Utilisateur' },
            receveur: { $ref: '#/components/schemas/Utilisateur' },
            annonce: { $ref: '#/components/schemas/Annonce' }
          }
        },
        
        Paiement: {
          type: 'object',
          properties: {
            id_paiement: { type: 'integer', example: 1 },
            id_transa: { type: 'integer', example: 1 },
            montant: { type: 'number', format: 'float', example: 25.50 },
            date: { type: 'string', format: 'date-time', example: '2025-01-15T14:00:00Z' },
            methode: { type: 'string', example: 'stripe' },
            statut: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'refunded'], example: 'succeeded' },
            stripe_payment_intent_id: { type: 'string', example: 'pi_1234567890' },
            transaction: { $ref: '#/components/schemas/Transaction' }
          }
        },
        
        HistoriqueAbonnement: {
          type: 'object',
          properties: {
            id_histo_abo: { type: 'integer', example: 1 },
            id_util: { type: 'integer', example: 1 },
            id_type_abonnement: { type: 'integer', example: 1 },
            action_histo: { type: 'string', example: 'création' },
            date_histo: { type: 'string', format: 'date-time', example: '2025-01-15T10:00:00Z' },
            utilisateur: { $ref: '#/components/schemas/Utilisateur' },
            typeAbonnement: { $ref: '#/components/schemas/TypeAbonnement' }
          }
        },
        
        HistoriqueAnnonce: {
          type: 'object',
          properties: {
            id_histo_annon: { type: 'integer', example: 1 },
            id_annon: { type: 'integer', example: 1 },
            id_util: { type: 'integer', example: 1 },
            action_histo: { type: 'string', example: 'création' },
            datepublication: { type: 'string', format: 'date-time', example: '2025-01-15T10:00:00Z' },
            annonce: { $ref: '#/components/schemas/Annonce' },
            utilisateur: { $ref: '#/components/schemas/Utilisateur' }
          }
        },
        
        MsgLecture: {
          type: 'object',
          properties: {
            id_lecture: { type: 'integer', example: 1 },
            id_expediteur: { type: 'integer', example: 1 },
            id_destinataire: { type: 'integer', example: 2 },
            id_annon: { type: 'integer', example: 1 },
            derniere_lecture: { type: 'string', format: 'date-time', example: '2025-01-15T14:30:00Z' }
          }
        },
        
        // ========================================
        // SCHÉMAS DE RÉPONSES COMMUNES
        // ========================================
        
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Erreur de validation' },
            message: { type: 'string', example: 'Le champ email est requis' },
            details: { type: 'object' }
          }
        },
        
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 150 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 50 },
                totalPages: { type: 'integer', example: 3 }
              }
            }
          }
        },
        
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Opération réussie' },
            data: { type: 'object' }
          }
        }
      },
      
      // ========================================
      // PARAMÈTRES RÉUTILISABLES
      // ========================================
      
      parameters: {
        idParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'integer' },
          description: 'ID de la ressource'
        },
        pageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1, minimum: 1 },
          description: 'Numéro de page (pagination)'
        },
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 50, minimum: 1, maximum: 100 },
          description: 'Nombre d\'éléments par page'
        },
        sortByParam: {
          in: 'query',
          name: 'sortBy',
          schema: { type: 'string' },
          description: 'Colonne de tri'
        },
        sortParam: {
          in: 'query',
          name: 'sort',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          description: 'Ordre de tri (ascendant ou descendant)'
        }
      },
      
      // ========================================
      // RÉPONSES RÉUTILISABLES
      // ========================================
      
      responses: {
        Unauthorized: {
          description: 'Non authentifié - Token manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Non authentifié' },
                  message: { type: 'string', example: 'Token JWT manquant ou invalide' }
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Accès interdit - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Accès interdit' },
                  message: { type: 'string', example: 'Vous n\'avez pas les permissions nécessaires' }
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Non trouvé' },
                  message: { type: 'string', example: 'Ressource introuvable' }
                }
              }
            }
          }
        },
        TooManyRequests: {
          description: 'Trop de requêtes - Rate limit dépassé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Trop de requêtes' },
                  message: { type: 'string', example: 'Vous avez dépassé la limite de requêtes' },
                  retryAfter: { type: 'string', example: '15 minutes' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation des données',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Validation échouée' },
                  message: { type: 'string', example: 'Le champ email est requis' },
                  details: { type: 'object' }
                }
              }
            }
          }
        }
      }
    },
    
    // Tags pour organiser les endpoints
    tags: [
      { name: 'Pays', description: '🌍 Gestion des pays' },
      { name: 'Villes', description: '🏙️ Gestion des villes' },
      { name: 'Aéroports', description: '✈️ Gestion des aéroports' },
      { name: 'Annonces', description: '📢 Gestion des annonces de voyage' },
      { name: 'Messages', description: '💬 Messagerie entre utilisateurs' },
      { name: 'Evaluations', description: '⭐ Système d\'évaluations' },
      { name: 'Profil', description: '👤 Gestion du profil utilisateur' },
      { name: 'Abonnements', description: '💳 Gestion des abonnements' },
      { name: 'Paiements', description: '💰 Système de paiement (Stripe)' },
      { name: 'Upload', description: '📤 Upload de fichiers (GCS)' },
      { name: 'Admin - Users', description: '👥 Gestion des utilisateurs (Admin)' },
      { name: 'Admin - Roles', description: '🔑 Gestion des rôles (Admin)' },
      { name: 'Admin - Transactions', description: '💸 Gestion des transactions (Admin)' },
      { name: 'Admin - Historiques', description: '📜 Historiques (Admin)' },
      { name: 'Admin - Types Abonnements', description: '📋 Types d\'abonnements (Admin)' }
    ]
  },
  
  // Scan tous les fichiers routes pour générer la doc
  apis: [
    './routes/*.ts',
    './routes/*.js',
    './swagger-routes.ts' // Documentation centralisée
  ]
};

export default swaggerOptions;

