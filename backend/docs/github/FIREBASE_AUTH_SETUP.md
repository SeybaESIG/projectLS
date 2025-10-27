# Configuration Firebase Authentication

Guide complet pour configurer l'authentification Firebase JWT dans le backend.

---

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Firebase Console](#configuration-firebase-console)
3. [Configuration Backend](#configuration-backend)
4. [Utilisation](#utilisation)
5. [Middlewares disponibles](#middlewares-disponibles)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Tests](#tests)
8. [Dépannage](#dépannage)

---

## Prérequis

- Compte Firebase créé sur [console.firebase.google.com](https://console.firebase.google.com)
- Node.js >= 20.0.0
- Package `firebase-admin` installé

---

## Configuration Firebase Console

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Cliquer sur **"Ajouter un projet"**
3. Nommer votre projet (ex: `projetls-app`)
4. Activer Google Analytics (optionnel)
5. Cliquer sur **"Créer le projet"**

### 2. Activer Authentication

1. Dans le menu latéral, cliquer sur **"Authentication"**
2. Cliquer sur **"Commencer"**
3. Activer les méthodes de connexion souhaitées :
   - ✅ **Email/Password**
   - ✅ **Google**
   - ✅ **Téléphone** (optionnel)
   - ✅ **Anonyme** (optionnel)

### 3. Générer les credentials Admin

1. Cliquer sur l'icône ⚙️ → **"Paramètres du projet"**
2. Aller dans l'onglet **"Comptes de service"**
3. Cliquer sur **"Générer une nouvelle clé privée"**
4. Un fichier JSON sera téléchargé (ex: `projetls-firebase-adminsdk.json`)
5. **IMPORTANT** : Ne jamais commit ce fichier sur Git

---

## Configuration Backend

### Méthode 1 : Fichier Service Account (Recommandé pour développement)

1. **Placer le fichier JSON** dans votre projet :
   ```bash
   backend/
   └── config/
       └── firebase-service-account.json  # À ajouter dans .gitignore
   ```

2. **Ajouter dans `.gitignore`** :
   ```
   # Firebase credentials
   **/firebase-service-account.json
   config/*.json
   ```

3. **Créer/modifier `.env`** :
   ```env
   # Firebase Authentication
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```

### Méthode 2 : Variables d'environnement (Recommandé pour production)

Ouvrir le fichier JSON téléchargé et extraire ces valeurs :

```env
# Firebase Authentication (Production)
FIREBASE_PROJECT_ID=votre-projet-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE\n-----END PRIVATE KEY-----\n"
```

**Important** : La clé privée doit conserver les `\n` pour les retours à la ligne.

---

## Utilisation

### Routes publiques vs protégées

Dans `app.ts`, les routes sont organisées ainsi :

```typescript
// ========================================
// ROUTES PUBLIQUES (sans authentification)
// ========================================
app.use('/', indexRouter);

// Routes publiques avec auth optionnelle
app.use('/api/pays', optionalFirebaseAuth, paysRouter);
app.use('/api/villes', optionalFirebaseAuth, villesRouter);
app.use('/api/aeroports', optionalFirebaseAuth, aeroportsRouter);
app.use('/api/annonces', optionalFirebaseAuth, annoncesRouter);

// ========================================
// ROUTES PROTÉGÉES (authentification obligatoire)
// ========================================
app.use(authenticateFirebase); // ✅ Middleware global

app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/paiements', paiementsRouter);
// ... etc
```

### Format des requêtes

Pour accéder aux routes protégées, le client doit envoyer le token Firebase :

```http
GET /api/users HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Middlewares disponibles

### 1. `authenticateFirebase` (Authentification obligatoire)

Vérifie le token Firebase et rejette la requête si invalide.

**Utilisation** :
```typescript
import { authenticateFirebase } from './middlewares/firebaseAuth.js';

// Sur une route spécifique
router.get('/profile', authenticateFirebase, (req, res) => {
    res.json({ user: req.user });
});

// Ou globalement (déjà configuré dans app.ts)
app.use(authenticateFirebase);
```

**Réponses** :
- **200** : Token valide, `req.user` disponible
- **401** : Token manquant
- **403** : Token invalide/expiré

### 2. `optionalFirebaseAuth` (Authentification optionnelle)

Ajoute `req.user` si le token est valide, sinon continue sans erreur.

**Utilisation** :
```typescript
import { optionalFirebaseAuth } from './middlewares/firebaseAuth.js';

router.get('/annonces', optionalFirebaseAuth, (req, res) => {
    // req.user existe si l'utilisateur est connecté
    // sinon undefined
    if (req.user) {
        // Afficher les annonces favorites
    } else {
        // Afficher les annonces publiques
    }
});
```

### 3. `requireEmailVerified` (Email vérifié requis)

Vérifie que l'email de l'utilisateur est vérifié.

**Utilisation** :
```typescript
import { authenticateFirebase, requireEmailVerified } from './middlewares/firebaseAuth.js';

router.post('/annonces', authenticateFirebase, requireEmailVerified, (req, res) => {
    // L'utilisateur doit avoir un email vérifié
});
```

### 4. `requireRole(...roles)` (Vérification de rôle)

Vérifie que l'utilisateur a un des rôles spécifiés (via custom claims Firebase).

**Utilisation** :
```typescript
import { authenticateFirebase, requireRole } from './middlewares/firebaseAuth.js';

router.delete('/users/:id', 
    authenticateFirebase, 
    requireRole('admin', 'moderator'), 
    (req, res) => {
        // Seuls admin et moderator peuvent supprimer
    }
);
```

---

## Exemples d'utilisation

### Exemple 1 : Route protégée simple

```typescript
import { Router } from 'express';
import { authenticateFirebase, AuthRequest } from '../middlewares/firebaseAuth.js';

const router = Router();

router.get('/profile', authenticateFirebase, (req: AuthRequest, res) => {
    res.json({
        uid: req.user?.uid,
        email: req.user?.email,
        name: req.user?.name
    });
});

export default router;
```

### Exemple 2 : Route admin uniquement

```typescript
router.delete('/users/:id', 
    authenticateFirebase,
    requireRole('admin'),
    async (req: AuthRequest, res) => {
        const userId = req.params.id;
        await User.destroy({ where: { id_utilisateur: userId } });
        res.json({ message: 'Utilisateur supprimé' });
    }
);
```

### Exemple 3 : Vérification d'ownership

```typescript
router.patch('/annonces/:id', 
    authenticateFirebase,
    async (req: AuthRequest, res) => {
        const annonce = await Annonce.findByPk(req.params.id);
        
        if (!annonce) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }
        
        // Vérifier que l'utilisateur est le propriétaire
        if (annonce.firebase_uid !== req.user?.uid) {
            return res.status(403).json({ 
                error: 'Vous ne pouvez modifier que vos propres annonces' 
            });
        }
        
        await annonce.update(req.body);
        res.json(annonce);
    }
);
```

### Exemple 4 : Route publique avec personnalisation

```typescript
router.get('/annonces',
    optionalFirebaseAuth,
    async (req: AuthRequest, res) => {
        const where = req.user 
            ? {} // Utilisateur connecté : voir toutes les annonces
            : { statut: 'active' }; // Visiteur : seulement les actives
        
        const annonces = await Annonce.findAll({ where });
        res.json(annonces);
    }
);
```

---

## Tests

### Tester avec curl

```bash
# 1. Obtenir un token depuis Firebase (côté client)
# 2. Tester une route protégée

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Tester avec Postman

1. **Headers** → Ajouter :
   - Key: `Authorization`
   - Value: `Bearer YOUR_FIREBASE_TOKEN`

2. Envoyer la requête

### Tests automatisés

Les tests unitaires mockeront Firebase Admin :

```typescript
// Exemple de test (voir test/firebaseAuth.test.ts)
import { authenticateFirebase } from '../middlewares/firebaseAuth';

jest.mock('../config/firebase', () => ({
    auth: {
        verifyIdToken: jest.fn()
    }
}));
```

---

## Sécurité

### Custom Claims (Rôles personnalisés)

Pour ajouter un rôle à un utilisateur Firebase :

```typescript
// Script admin (à exécuter côté serveur)
import { auth } from './config/firebase.js';

async function setAdminRole(uid: string) {
    await auth.setCustomUserClaims(uid, { role: 'admin' });
    console.log(`Rôle admin ajouté pour ${uid}`);
}

setAdminRole('USER_UID_HERE');
```

### Révocation de tokens

```typescript
// Révoquer tous les tokens d'un utilisateur
await auth.revokeRefreshTokens(uid);
```

---

## Dépannage

### Erreur : "Firebase non configuré"

**Cause** : Variables d'environnement manquantes

**Solution** :
1. Vérifier `.env` contient `FIREBASE_SERVICE_ACCOUNT_PATH` OU les 3 variables individuelles
2. Redémarrer le serveur

### Erreur : "Token expiré"

**Cause** : Le token Firebase expire après 1 heure

**Solution** : 
- Côté client : Rafraîchir le token automatiquement
```javascript
// Firebase Client SDK
firebase.auth().currentUser.getIdToken(true);
```

### Erreur : "Token invalide"

**Causes possibles** :
1. Token malformé
2. Mauvais format (oubli de "Bearer ")
3. Token d'un autre projet Firebase

**Solution** :
- Vérifier que le `projectId` dans le service account correspond au projet client

### Erreur : "Module not found: firebase-admin"

**Solution** :
```bash
npm install firebase-admin
```

### Mode développement sans Firebase

Pour développer sans Firebase configuré, le middleware bypass automatiquement :

```typescript
// Dans config/firebase.ts
if (!process.env.FIREBASE_PROJECT_ID) {
    console.warn('⚠️ Firebase non configuré - Authentification désactivée');
}
```

---

## Architecture de sécurité

```
┌─────────────┐
│   Client    │
│  (Firebase  │
│   Auth SDK) │
└──────┬──────┘
       │ 1. Login (email/password)
       ▼
┌─────────────────┐
│ Firebase Auth   │
│   (Google)      │
└────────┬────────┘
         │ 2. ID Token JWT
         ▼
┌──────────────────┐
│  Frontend App    │
└────────┬─────────┘
         │ 3. API Request + Bearer Token
         ▼
┌──────────────────────────┐
│   Backend (Express)      │
│                          │
│  authenticateFirebase    │
│  ├─ Vérifier signature   │
│  ├─ Vérifier expiration  │
│  └─ Décoder claims       │
│                          │
│  req.user = {            │
│    uid, email, role...   │
│  }                       │
└────────┬─────────────────┘
         │ 4. Accès autorisé
         ▼
┌──────────────────┐
│   Controller     │
│   (Business      │
│    Logic)        │
└──────────────────┘
```

---

## Ressources

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)

---

## Checklist de déploiement

Production :
- [ ] Créer projet Firebase
- [ ] Activer Authentication
- [ ] Générer service account
- [ ] Configurer variables d'environnement
- [ ] Tester endpoints protégés
- [ ] Configurer CORS pour domaine production
- [ ] Configurer custom claims (rôles)
- [ ] Mettre en place rate limiting
- [ ] Logs de sécurité

---

**Le backend est sécurisé avec Firebase Authentication.**







