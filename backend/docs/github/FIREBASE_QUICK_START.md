# 🚀 Firebase Authentication - Démarrage Rapide

## ⚡ En 5 minutes

### 1. Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquer sur **"Ajouter un projet"**
3. Nommer votre projet (ex: `projetls-app`)
4. Cliquer sur **"Créer le projet"**

### 2. Activer Authentication

1. Menu **"Authentication"** → **"Commencer"**
2. Activer **"Email/Password"**
3. (Optionnel) Activer **"Google"**, **"Téléphone"**, etc.

### 3. Télécharger les credentials

1. **Paramètres** (⚙️) → **"Paramètres du projet"**
2. Onglet **"Comptes de service"**
3. Cliquer sur **"Générer une nouvelle clé privée"**
4. Un fichier JSON sera téléchargé

### 4. Configurer le backend

**Option A : Fichier JSON (Recommandé pour dev)**

```bash
# 1. Placer le fichier dans config/
mv ~/Downloads/projetls-*-firebase-adminsdk-*.json backend/config/firebase-service-account.json

# 2. Ajouter dans .env
echo "FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json" >> .env
```

**Option B : Variables d'environnement (Production)**

Ouvrir le fichier JSON et copier ces 3 valeurs dans `.env` :

```env
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE\n-----END PRIVATE KEY-----\n"
```

### 5. Tester

```bash
# Démarrer le serveur
npm run dev

# Vous devriez voir :
# ✅ Firebase Admin initialisé avec fichier service account
```

---

## 🧪 Tester avec curl

### 1. Obtenir un token Firebase (côté client)

```javascript
// Dans votre app frontend (React, Vue, etc.)
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();

console.log('Token:', token);
```

### 2. Tester une route protégée

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

**Résultat attendu** : 
- ✅ 200 OK avec les données
- ❌ 401 si pas de token
- ❌ 403 si token invalide

---

## 📋 Routes disponibles

### Routes publiques (sans token)

```
GET  /api/pays
GET  /api/villes
GET  /api/aeroports
GET  /api/annonces
```

### Routes protégées (token requis)

```
GET    /api/users
POST   /api/messages
POST   /api/transactions
POST   /api/paiements
DELETE /api/users/:id
... etc
```

---

## 🔑 Utiliser req.user dans vos controllers

```typescript
import type { AuthRequest } from '../middlewares/firebaseAuth.js';

export const getProfile = async (req: AuthRequest, res: Response) => {
    // req.user est automatiquement disponible
    const uid = req.user?.uid;
    const email = req.user?.email;
    const isEmailVerified = req.user?.email_verified;
    
    res.json({
        message: `Bonjour ${email}!`,
        uid,
        isEmailVerified
    });
};
```

---

## 🛡️ Ajouter un rôle admin

### Script pour définir un admin (côté serveur)

```typescript
// scripts/setAdmin.ts
import { auth } from './config/firebase.js';

async function setAdminRole(userUid: string) {
    if (!auth) {
        console.error('Firebase non configuré');
        return;
    }
    
    await auth.setCustomUserClaims(userUid, { role: 'admin' });
    console.log(`✅ Rôle admin ajouté pour ${userUid}`);
}

// Utilisation
setAdminRole('UID_UTILISATEUR_ICI');
```

### Protéger une route admin

```typescript
import { authenticateFirebase, requireRole } from './middlewares/firebaseAuth.js';

router.delete('/users/:id', 
    authenticateFirebase,
    requireRole('admin'),  // ← Seuls les admins peuvent accéder
    deleteUser
);
```

---

## ❓ Problèmes courants

### Firebase non configuré

**Symptôme** : `⚠️ Firebase non configuré - Authentification désactivée`

**Solution** :
1. Vérifier que `.env` contient `FIREBASE_SERVICE_ACCOUNT_PATH` ou les 3 variables
2. Vérifier que le fichier JSON existe au bon emplacement
3. Redémarrer le serveur

### Token expiré

**Symptôme** : Erreur 403 "Token expiré"

**Solution** : Les tokens Firebase expirent après 1h. Rafraîchir côté client :

```javascript
const auth = getAuth();
const token = await auth.currentUser.getIdToken(true); // force refresh
```

### Erreur CORS

**Symptôme** : Requête bloquée par CORS

**Solution** : Vérifier `FRONTEND_URL` dans `.env` :

```env
FRONTEND_URL=http://localhost:3001
```

---

## 📚 Documentation complète

- **Guide détaillé** : [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) (280 lignes)
- **Configuration** : [ENV_VARIABLES.md](./ENV_VARIABLES.md)
- **Résumé complet** : [FIREBASE_IMPLEMENTATION_SUMMARY.md](./FIREBASE_IMPLEMENTATION_SUMMARY.md)

---

## ✅ Checklist

- [ ] Créer projet Firebase
- [ ] Activer Authentication
- [ ] Télécharger service account JSON
- [ ] Placer le fichier dans `config/`
- [ ] Ajouter `FIREBASE_SERVICE_ACCOUNT_PATH` dans `.env`
- [ ] Démarrer le serveur : `npm run dev`
- [ ] Vérifier : `✅ Firebase Admin initialisé`
- [ ] Tester une route protégée
- [ ] (Optionnel) Configurer un admin

---

**🎉 C'est tout ! Votre backend est maintenant sécurisé avec Firebase !**







