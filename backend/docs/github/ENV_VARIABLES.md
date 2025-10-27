# 📝 Variables d'environnement - Configuration Backend

## 🔧 Créer votre fichier `.env`

Créez un fichier `.env` à la racine du dossier `backend/` avec les variables suivantes :

```env
# ===========================================
# CONFIGURATION BACKEND - ProjetLS
# ===========================================

# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=superbase
DB_USER=akslasj
DB_PASSWORD=your_password_here

# Serveur
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# ===========================================
# FIREBASE AUTHENTICATION ⭐ NOUVEAU
# ===========================================

# Méthode 1: Fichier Service Account (Développement)
# Télécharger depuis Firebase Console → Paramètres projet → Comptes de service
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Méthode 2: Variables individuelles (Production)
# Extraire ces valeurs du fichier JSON téléchargé
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ===========================================
# STRIPE (Paiements)
# ===========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ===========================================
# GOOGLE CLOUD STORAGE (Upload images)
# ===========================================
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-gcs-project-id
GCS_CREDENTIALS_PATH=./config/gcs-credentials.json

# ===========================================
# ENCRYPTION (Messages)
# ===========================================
# Générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
MESSAGE_ENCRYPTION_KEY=your_base64_encoded_32_byte_key

# ===========================================
# AIRLABS API (Import pays)
# ===========================================
AIRLABS_API_KEY=your_airlabs_api_key
```

## 🔥 Configuration Firebase - Détaillée

### Étape 1 : Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. Créer un nouveau projet
3. Activer **Authentication** → **Email/Password**

### Étape 2 : Télécharger le fichier Service Account

1. **Paramètres du projet** (⚙️) → **Comptes de service**
2. Cliquer sur **"Générer une nouvelle clé privée"**
3. Un fichier JSON sera téléchargé (ex: `projetls-firebase-adminsdk-xxxxx.json`)

### Étape 3 : Configurer le backend

**Option A : Fichier JSON (Développement)** 🏠

1. Placer le fichier dans `backend/config/firebase-service-account.json`
2. Ajouter dans `.env` :
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```

**Option B : Variables d'environnement (Production)** 🚀

1. Ouvrir le fichier JSON téléchargé
2. Extraire ces 3 valeurs :
   ```json
   {
     "project_id": "votre-projet-123456",
     "client_email": "firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```

3. Ajouter dans `.env` :
   ```env
   FIREBASE_PROJECT_ID=votre-projet-123456
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-projet.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_ICI\n-----END PRIVATE KEY-----\n"
   ```

⚠️ **Important** : La clé privée doit conserver les `\n` pour les retours à la ligne.

## 🔐 Sécurité

### Fichiers à NE JAMAIS commit sur Git :

```gitignore
# Firebase credentials
**/firebase-service-account.json
config/*.json

# Environment variables
.env
.env.local
.env.production
```

### Générer une clé d'encryption sécurisée :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copier le résultat dans `MESSAGE_ENCRYPTION_KEY`.

## ✅ Vérification

Pour tester que Firebase est bien configuré :

```bash
npm run dev
```

Vous devriez voir :
```
✅ Firebase Admin initialisé avec fichier service account
```

ou

```
✅ Firebase Admin initialisé avec variables d'environnement
```

## 📚 Documentation complète

- **Firebase** : Voir [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md)
- **Stripe** : Voir [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- **Google Cloud Storage** : Voir [GCS_UPLOAD_SETUP.md](./GCS_UPLOAD_SETUP.md)







