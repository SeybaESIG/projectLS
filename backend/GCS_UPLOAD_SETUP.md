# 📸 Configuration Google Cloud Storage pour les Uploads d'Images

## 🎯 Vue d'ensemble

Le système d'upload d'images utilise **Google Cloud Storage (GCS)** avec des **Signed URLs** pour permettre aux utilisateurs d'uploader des images **directement vers GCS** sans passer par le serveur backend.

**✅ Limite de taille : 5 Mo par fichier**  
**✅ Types autorisés : JPEG, PNG, GIF, WEBP**  
**✅ Validation backend + GCS (double sécurité)**

---

## 🔧 Configuration

### 1. Créer un compte Google Cloud

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'API **Cloud Storage**

### 2. Créer un bucket GCS

```bash
# Via gcloud CLI
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l europe-west1 -b on gs://your-bucket-name/

# Ou via la console : Storage → Buckets → Create
```

**Configuration du bucket** :
- **Nom** : `your-app-images` (doit être unique globalement)
- **Région** : europe-west1 (proche de tes utilisateurs)
- **Classe de stockage** : Standard
- **Accès public** : Désactiver (utiliser des URLs signées)

### 3. Configurer CORS sur le bucket

```bash
# Créer cors-config.json
cat > cors-config.json << EOF
[
  {
    "origin": ["http://localhost:5173", "https://votre-domaine.com"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Appliquer la config CORS
gsutil cors set cors-config.json gs://your-bucket-name/
```

### 4. Créer un Service Account

1. IAM & Admin → Service Accounts → Create Service Account
2. Nom : `app-storage-manager`
3. Rôle : **Storage Object Admin** (pour créer/supprimer des fichiers)
4. Créer une clé JSON → Télécharger le fichier `credentials.json`

### 5. Configurer les variables d'environnement

Ajoutez dans `.env` :

```bash
# Google Cloud Storage
GCS_BUCKET_NAME=your-app-images
GCS_PROJECT_ID=your-project-id
GCS_CREDENTIALS_PATH=./credentials.json
```

**⚠️ IMPORTANT** : Ajoutez `credentials.json` dans `.gitignore` !

```bash
echo "credentials.json" >> .gitignore
```

---

## 🔄 Flow d'upload (3 requêtes)

### **Requête 1 : Demander une Signed URL**

```javascript
// Frontend
const response = await fetch('/api/upload/signed-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name, // 'photo.jpg'
    contentType: file.type, // 'image/jpeg'
    category: 'message-image' // ou 'user-photo'
  })
});

const { signedUrl, publicUrl, maxSize } = await response.json();

// signedUrl.url = URL pour uploader
// signedUrl.fields = Champs du formulaire
// publicUrl = URL finale de l'image (à stocker en DB)
// maxSize = 5242880 (5 Mo)
```

**Backend** :
- ✅ Valide le type de fichier
- ✅ Génère une Signed URL avec **limite de 5 Mo**
- ✅ URL expire dans 15 minutes

---

### **Requête 2 : Upload vers GCS**

```javascript
// Frontend - Créer FormData pour l'upload
const formData = new FormData();

// Ajouter les champs requis par GCS
Object.keys(signedUrl.fields).forEach(key => {
  formData.append(key, signedUrl.fields[key]);
});

// Ajouter le fichier
formData.append('file', file);

// Upload directement vers GCS
const uploadResponse = await fetch(signedUrl.url, {
  method: 'POST',
  body: formData
});

if (!uploadResponse.ok) {
  if (uploadResponse.status === 413) {
    alert('Fichier trop volumineux (max 5 Mo)');
  } else {
    alert('Erreur lors de l\'upload');
  }
  return;
}
```

**GCS** :
- ✅ Valide que la taille < 5 Mo
- ✅ Valide que le type MIME correspond
- ✅ Stocke l'image
- ❌ Refuse si fichier > 5 Mo (erreur 413)

---

### **Requête 3 : Enregistrer l'URL en DB**

```javascript
// Frontend - Créer le message avec l'URL de l'image
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_expediteur: 1,
    id_destinataire: 2,
    contenu: 'Regarde cette image',
    url_image: publicUrl // URL reçue à l'étape 1
  })
});
```

**Backend** :
- ✅ Valide que `url_image` est une URL valide (Joi)
- ✅ Enregistre le message avec l'URL

---

## 🛡️ Sécurité (Triple validation)

### **Validation 1 : Frontend (UX)**
```javascript
if (file.size > 5 * 1024 * 1024) {
  alert('Fichier trop volumineux (max 5 Mo)');
  return; // Bloque AVANT toute requête
}
```

### **Validation 2 : Backend (Signed URL)**
```typescript
conditions: [
  ['content-length-range', 0, 5242880], // MAX 5 Mo ✅
  ['eq', '$Content-Type', 'image/jpeg'] // Type strict ✅
]
```

### **Validation 3 : GCS (automatique)**
- GCS refuse automatiquement si :
  - Fichier > 5 Mo
  - Type MIME différent
  - URL expirée (> 15 min)

---

## 📋 Routes disponibles

### `POST /api/upload/signed-url`

**Body** :
```json
{
  "filename": "photo.jpg",
  "contentType": "image/jpeg",
  "category": "message-image"
}
```

**Response** :
```json
{
  "message": "Signed URL générée avec succès",
  "signedUrl": {
    "url": "https://storage.googleapis.com/...",
    "fields": { ... }
  },
  "publicUrl": "https://storage.googleapis.com/bucket/images/123-photo.jpg",
  "filename": "images/123-photo.jpg",
  "maxSize": 5242880,
  "expiresIn": "15 minutes"
}
```

### `GET /api/upload/health`

**Response** :
```json
{
  "configured": true,
  "bucketName": "your-app-images",
  "maxFileSize": "5 MB",
  "allowedTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
}
```

---

## 🧪 Tests

**Tests créés** :
- ✅ `uploadSchemas.test.ts` - 11 tests
- ✅ Validation des types de fichiers
- ✅ Validation des tailles de nom
- ✅ Validation des catégories

**Lancer les tests** :
```bash
npm test test/uploadSchemas.test.ts
```

---

## 💡 Exemple Frontend complet

```javascript
// Composant d'upload d'image
async function uploadImage(file) {
  // 1. Validation frontend (UX)
  if (file.size > 5 * 1024 * 1024) {
    alert('Fichier trop volumineux (max 5 Mo)');
    return null;
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    alert('Type de fichier non autorisé');
    return null;
  }
  
  try {
    // 2. Demander une Signed URL au backend
    const signedUrlResponse = await fetch('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        category: 'message-image'
      })
    });
    
    if (!signedUrlResponse.ok) {
      throw new Error('Erreur lors de la génération de l\'URL');
    }
    
    const { signedUrl, publicUrl } = await signedUrlResponse.json();
    
    // 3. Upload vers GCS
    const formData = new FormData();
    Object.keys(signedUrl.fields).forEach(key => {
      formData.append(key, signedUrl.fields[key]);
    });
    formData.append('file', file);
    
    const uploadResponse = await fetch(signedUrl.url, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      if (uploadResponse.status === 413) {
        alert('Fichier trop volumineux (max 5 Mo)');
      } else {
        alert('Erreur lors de l\'upload');
      }
      return null;
    }
    
    // 4. Retourner l'URL publique pour l'utiliser dans le message
    return publicUrl;
    
  } catch (error) {
    console.error('Erreur upload:', error);
    alert('Erreur lors de l\'upload de l\'image');
    return null;
  }
}

// Utilisation
const imageUrl = await uploadImage(file);
if (imageUrl) {
  // Créer le message avec l'URL
  await createMessage({
    contenu: 'Regarde cette image',
    url_image: imageUrl
  });
}
```

---

## 🆘 Dépannage

### Erreur : "Service de stockage non configuré"
- Vérifiez que `GCS_BUCKET_NAME`, `GCS_PROJECT_ID`, `GCS_CREDENTIALS_PATH` sont dans `.env`
- Vérifiez que le fichier `credentials.json` existe au bon endroit

### Erreur : "Permission denied"
- Vérifiez que le Service Account a le rôle **Storage Object Admin**
- Vérifiez que les credentials sont valides

### Erreur 413 côté GCS
- Le fichier dépasse 5 Mo
- C'est **normal** et **sécurisé** (validation GCS)

### CORS errors
- Vérifiez que votre frontend URL est dans la config CORS du bucket
- Utilisez `gsutil cors get gs://your-bucket/` pour vérifier

---

## 📚 Documentation

- [GCS Signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [GCS CORS](https://cloud.google.com/storage/docs/configuring-cors)
- [Storage Object Admin role](https://cloud.google.com/storage/docs/access-control/iam-roles)

---

**✅ Upload d'images avec limite de 5 Mo : IMPLÉMENTÉ !**


