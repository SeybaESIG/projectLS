# 🔐 Permissions API - Guide Complet

Documentation complète des permissions et accès aux différentes routes de l'API.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Routes publiques](#routes-publiques)
3. [Routes utilisateurs authentifiés](#routes-utilisateurs-authentifiés)
4. [Routes admin uniquement](#routes-admin-uniquement)
5. [Matrice des permissions](#matrice-des-permissions)
6. [Sécurité et vérifications](#sécurité-et-vérifications)

---

## 🎯 Vue d'ensemble

### 3 niveaux de sécurité

```
🌐 PUBLIC
   ↓
🔐 UTILISATEUR AUTHENTIFIÉ
   ↓
👑 ADMIN
```

| Niveau | Icône | Accès | Vérification |
|--------|-------|-------|--------------|
| **Public** | 🌐 | Tout le monde | Aucune |
| **Authentifié** | 🔐 | Token Firebase requis | Email Firebase |
| **Admin** | 👑 | Token Firebase + rôle 'admin' | Custom claim |

---

## 🌐 Routes publiques

### Sans authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Page d'accueil |
| `POST` | `/api/webhook/stripe` | Webhook Stripe (serveurs Stripe) |

### Avec auth optionnelle (lecture publique)

| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|--------------|
| `GET` | `/api/pays` | Liste des pays | ❌ Non |
| `GET` | `/api/villes` | Liste des villes | ❌ Non |
| `GET` | `/api/aeroports` | Liste des aéroports | ❌ Non |
| `GET` | `/api/annonces` | Liste des annonces | ❌ Non |
| `GET` | `/api/annonces/:id` | Détails d'une annonce | ❌ Non |
| `POST` | `/api/annonces` | Créer une annonce | ✅ **Oui** |
| `PATCH` | `/api/annonces/:id` | Modifier son annonce | ✅ **Oui** |
| `DELETE` | `/api/annonces/:id` | Supprimer son annonce | ✅ **Oui** |

**Note** : Pour les annonces, la lecture est publique mais les actions CRUD nécessitent une authentification.

---

## 🔐 Routes utilisateurs authentifiés

**Authentification requise** : Header `Authorization: Bearer <firebase_token>`

### Profil personnel

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/me` | Voir SON profil | Son profil uniquement |
| `PATCH` | `/api/me` | Modifier SON profil | Son profil uniquement |
| `DELETE` | `/api/me` | Supprimer SON compte | Son compte uniquement |

**Champs protégés** : `id_util`, `id_role`, `date_inscription`, `note_moyenne`, `mot_de_passe` (non modifiables)

---

### Annonces

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `POST` | `/api/annonces` | Créer une annonce | Créée à son nom |
| `PATCH` | `/api/annonces/:id` | Modifier une annonce | Ses annonces uniquement |
| `DELETE` | `/api/annonces/:id` | Supprimer une annonce | Ses annonces uniquement |

**Vérification** : L'utilisateur doit être propriétaire de l'annonce (`annonce.id_util == utilisateur.id_util`)

---

### Messages

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/messages` | Liste de SES messages | Messages envoyés OU reçus uniquement |
| `GET` | `/api/messages/:id` | Détails d'un message | Ses messages uniquement |
| `POST` | `/api/messages` | Envoyer un message | Envoyé à son nom |
| `DELETE` | `/api/messages/:id` | Supprimer un message | Ses messages envoyés uniquement |
| `GET` | `/api/messages/conversation` | Conversation entre 2 users | Si participant uniquement |

**Vérification** : L'utilisateur doit être expéditeur OU destinataire du message

---

### Lectures de messages

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `POST` | `/api/msg_lectures/mark-read` | Marquer comme lu | Ses conversations |
| `GET` | `/api/msg_lectures/unread-count/:id_util` | Compter non lus | Son compte uniquement |
| `GET` | `/api/msg_lectures/unread-conversations/:id_util` | Conversations non lues | Ses conversations uniquement |

---

### Évaluations

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/evaluations/recues/:id_util` | Évaluations REÇUES | Ses évaluations uniquement |
| `GET` | `/api/evaluations/donnees/:id_util` | Évaluations DONNÉES | Ses évaluations uniquement |
| `POST` | `/api/evaluations` | Donner une évaluation | Donnée à son nom |
| `DELETE` | `/api/evaluations/:id_util_donne/:id_util_recoit/:id_transa` | Supprimer une évaluation | Ses évaluations données uniquement |

**Vérification** : L'utilisateur doit être celui qui donne OU reçoit l'évaluation

---

### Abonnements

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `GET` | `/api/abonnements` | Liste des abonnements | Tous les types disponibles |
| `GET` | `/api/abonnements/:id` | Détails d'un abonnement | Son abonnement uniquement |
| `POST` | `/api/abonnements` | Souscrire à un abonnement | Pour son compte |
| `PATCH` | `/api/abonnements/:id` | Modifier son abonnement | Son abonnement uniquement |
| `DELETE` | `/api/abonnements/:id` | Résilier son abonnement | Son abonnement uniquement |

---

### Paiements

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `POST` | `/api/payer` | Effectuer un paiement via Stripe | Payer pour soi |

**Note** : Les utilisateurs peuvent UNIQUEMENT payer (créer un PaymentIntent Stripe). Ils ne peuvent PAS voir l'historique des paiements ni les modifier.

---

### Upload

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| `POST` | `/api/upload/generate-signed-url` | Obtenir URL signée | Pour son profil/annonces |

**Limite** : 5 Mo max, formats JPEG/PNG/GIF/WEBP uniquement

---

## 👑 Routes admin uniquement

**Authentification requise** : Header `Authorization: Bearer <firebase_token>` + Custom claim `role: 'admin'`

### Utilisateurs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/users` | Liste de TOUS les utilisateurs |
| `GET` | `/api/users/:id` | Détails de N'IMPORTE QUEL utilisateur |
| `POST` | `/api/users` | Créer un utilisateur |
| `PATCH` | `/api/users/:id` | Modifier N'IMPORTE QUEL utilisateur |
| `DELETE` | `/api/users/:id` | Supprimer N'IMPORTE QUEL utilisateur |

---

### Rôles

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/roles` | Liste des rôles |
| `GET` | `/api/roles/:id` | Détails d'un rôle |
| `POST` | `/api/roles` | Créer un rôle |
| `PATCH` | `/api/roles/:id` | Modifier un rôle |
| `DELETE` | `/api/roles/:id` | Supprimer un rôle |

---

### Transactions

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/transactions` | Liste de TOUTES les transactions |
| `GET` | `/api/transactions/:id` | Détails de N'IMPORTE QUELLE transaction |
| `POST` | `/api/transactions` | Créer une transaction |
| `PATCH` | `/api/transactions/:id` | Modifier N'IMPORTE QUELLE transaction |
| `DELETE` | `/api/transactions/:id` | Supprimer N'IMPORTE QUELLE transaction |

---

### Paiements

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/paiements` | Liste de TOUS les paiements |
| `GET` | `/api/paiements/:id` | Détails de N'IMPORTE QUEL paiement |
| `POST` | `/api/paiements` | Créer un paiement manuel (bypass Stripe) |
| `PATCH` | `/api/paiements/:id` | Modifier N'IMPORTE QUEL paiement |
| `DELETE` | `/api/paiements/:id` | Supprimer N'IMPORTE QUEL paiement |

---

### Types d'abonnements

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/types_abonnement` | Liste des types |
| `POST` | `/api/types_abonnement` | Créer un type |
| `PATCH` | `/api/types_abonnement/:id` | Modifier un type |
| `DELETE` | `/api/types_abonnement/:id` | Supprimer un type |

---

### Historiques

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/historique_abonnements` | Historique COMPLET des abonnements |
| `GET` | `/api/historique_annonces` | Historique COMPLET des annonces |

---

## 📊 Matrice des permissions

| Action | 🌐 Public | 🔐 User | 👑 Admin |
|--------|-----------|---------|----------|
| **Voir les annonces** | ✅ | ✅ | ✅ |
| **Créer une annonce** | ❌ | ✅ (à son nom) | ✅ |
| **Modifier une annonce** | ❌ | ✅ (les siennes) | ✅ (toutes) |
| **Supprimer une annonce** | ❌ | ✅ (les siennes) | ✅ (toutes) |
| **Voir son profil** | ❌ | ✅ (le sien via `/me`) | ✅ (tous) |
| **Modifier son profil** | ❌ | ✅ (le sien via `/me`) | ✅ (tous) |
| **Voir tous les users** | ❌ | ❌ | ✅ |
| **Voir ses messages** | ❌ | ✅ (les siens) | ✅ (tous) |
| **Envoyer un message** | ❌ | ✅ | ✅ |
| **Supprimer un message** | ❌ | ✅ (envoyés uniquement) | ✅ (tous) |
| **Voir ses évaluations** | ❌ | ✅ (les siennes) | ✅ (toutes) |
| **Donner une évaluation** | ❌ | ✅ | ✅ |
| **Voir les abonnements** | ❌ | ✅ (types disponibles) | ✅ (tous) |
| **Souscrire un abonnement** | ❌ | ✅ (pour soi) | ✅ |
| **Résilier un abonnement** | ❌ | ✅ (le sien) | ✅ (tous) |
| **Effectuer un paiement** | ❌ | ✅ (via `/payer`) | ✅ |
| **Voir tous les paiements** | ❌ | ❌ | ✅ |
| **Modifier un paiement** | ❌ | ❌ | ✅ |
| **Voir les transactions** | ❌ | ❌ | ✅ |
| **Gérer les rôles** | ❌ | ❌ | ✅ |
| **Gérer types abonnements** | ❌ | ❌ | ✅ |
| **Voir historiques** | ❌ | ❌ | ✅ |

---

## 🔒 Sécurité et vérifications

### Vérifications automatiques dans les controllers

#### **Annonces**
```typescript
// Lors de la création
annonce.id_util = utilisateurConnecté.id_util;  // Forcé

// Lors de la modification/suppression
if (annonce.id_util !== utilisateurConnecté.id_util) {
    return 403 Forbidden;
}
```

#### **Messages**
```typescript
// Lors de la création
message.id_expediteur = utilisateurConnecté.id_util;  // Forcé

// Lors de la lecture
where: {
    [Op.or]: [
        { id_expediteur: utilisateurConnecté.id_util },
        { id_destinataire: utilisateurConnecté.id_util }
    ]
}

// Lors de la suppression
if (message.id_expediteur !== utilisateurConnecté.id_util) {
    return 403 Forbidden;
}
```

#### **Évaluations**
```typescript
// Lors de la création
evaluation.id_util_donne = utilisateurConnecté.id_util;  // Forcé

// Lors de la lecture
if (id_util !== utilisateurConnecté.id_util) {
    return 403 Forbidden;
}
```

#### **Profil (/me)**
```typescript
// Toujours basé sur l'email Firebase
utilisateur = findOne({ where: { email: firebaseEmail } });
```

---

## 🚦 Codes de réponse HTTP

| Code | Signification | Quand ? |
|------|---------------|---------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée |
| `204` | No Content | Suppression réussie |
| `400` | Bad Request | Données invalides |
| `401` | Unauthorized | Token manquant ou invalide |
| `403` | Forbidden | Accès interdit (rôle insuffisant ou pas propriétaire) |
| `404` | Not Found | Ressource non trouvée |
| `500` | Server Error | Erreur serveur |

---

## 💡 Exemples

### Exemple 1 : Utilisateur crée une annonce

**Requête** :
```bash
POST /api/annonces
Authorization: Bearer <user_token>

{
  "titre": "Vol Paris-Londres",
  "description": "Cherche compagnon de voyage",
  "prix": 50,
  "id_aero_depart": 1,
  "id_aero_arrivee": 2,
  "datedepart": "2025-11-01T10:00:00Z",
  "datearrivee": "2025-11-01T12:00:00Z"
}
```

**Traitement backend** :
```typescript
// Le backend force automatiquement :
annonce.id_util = utilisateurConnecté.id_util;
```

**Réponse** : `201 Created` avec l'annonce créée

---

### Exemple 2 : Utilisateur tente de modifier l'annonce d'un autre

**Requête** :
```bash
PATCH /api/annonces/123
Authorization: Bearer <user_token>

{
  "prix": 100
}
```

**Vérification backend** :
```typescript
if (annonce.id_util !== utilisateurConnecté.id_util) {
    return 403;
}
```

**Réponse** : `403 Forbidden`
```json
{
  "error": "Accès interdit",
  "message": "Vous ne pouvez modifier que vos propres annonces"
}
```

---

### Exemple 3 : Utilisateur voit ses messages

**Requête** :
```bash
GET /api/messages
Authorization: Bearer <user_token>
```

**Filtrage backend** :
```typescript
where: {
    [Op.or]: [
        { id_expediteur: utilisateurConnecté.id_util },
        { id_destinataire: utilisateurConnecté.id_util }
    ]
}
```

**Réponse** : `200 OK` avec UNIQUEMENT ses messages

---

### Exemple 4 : Utilisateur effectue un paiement

**Requête** :
```bash
POST /api/payer
Authorization: Bearer <user_token>

{
  "id_transa": 42,
  "montant": 50,
  "currency": "eur"
}
```

**Réponse** : `201 Created`
```json
{
  "paiement": { ... },
  "clientSecret": "pi_xxx_secret_yyy",
  "paymentIntentId": "pi_xxx"
}
```

L'utilisateur utilise ensuite le `clientSecret` avec Stripe Elements pour finaliser le paiement côté client.

---

### Exemple 5 : Admin voit tous les paiements

**Requête** :
```bash
GET /api/paiements
Authorization: Bearer <admin_token>
```

**Vérification backend** :
```typescript
if (req.user.firebase.role !== 'admin') {
    return 403;
}
```

**Réponse** : `200 OK` avec TOUS les paiements de la plateforme

---

## 🛡️ Sécurité

### Lien Firebase ↔ Base de données

```
Firebase User (Authentication)
    ↓
  email: user@example.com
    ↓
tb_utilisateurs (Base de données)
    ↓
  WHERE email = 'user@example.com'
    ↓
  id_util = 42
```

**Important** : L'email Firebase DOIT correspondre à un email dans `tb_utilisateurs` sinon l'utilisateur ne pourra rien faire.

---

### Champs protégés (non modifiables par les users)

| Champ | Table | Raison |
|-------|-------|--------|
| `id_util` | Utilisateur | ID système |
| `id_role` | Utilisateur | Géré par admin via Firebase custom claims |
| `date_inscription` | Utilisateur | Historique |
| `note_moyenne` | Utilisateur | Calculée automatiquement (trigger) |
| `mot_de_passe` | Utilisateur | Géré par Firebase |
| `id_util` | Annonce | Forcé à l'utilisateur connecté |
| `id_expediteur` | Message | Forcé à l'utilisateur connecté |
| `id_util_donne` | Evaluation | Forcé à l'utilisateur connecté |

---

## ⚠️ Cas d'erreur courants

### 1. Utilisateur non trouvé dans la DB

**Cause** : Email Firebase != Email dans `tb_utilisateurs`

**Solution** : Créer l'utilisateur dans la DB avec le même email que Firebase

---

### 2. Accès refusé à une ressource

**Cause** : Tentative d'accès à une ressource d'un autre utilisateur

**Réponse** :
```json
{
  "error": "Accès interdit",
  "message": "Vous ne pouvez modifier que vos propres annonces"
}
```

---

### 3. Rôle insuffisant

**Cause** : Utilisateur standard tente d'accéder à une route admin

**Réponse** :
```json
{
  "error": "Accès interdit",
  "message": "Rôle requis: admin"
}
```

---

## 📚 Documentation liée

- **Firebase Authentication** : [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md)
- **Gestion des rôles admin** : [ADMIN_ROLES_GUIDE.md](./ADMIN_ROLES_GUIDE.md)
- **Démarrage rapide Firebase** : [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md)

---

**🎉 Système de permissions complet et sécurisé !**



