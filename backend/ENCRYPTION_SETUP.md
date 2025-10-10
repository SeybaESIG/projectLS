# 🔐 Configuration de l'encryptage des messages

## Clé d'encryptage pour le développement

Ajoute cette ligne dans ton fichier `.env` (créer le fichier s'il n'existe pas) :

```env
MESSAGE_ENCRYPTION_KEY=vMj/hEvlkhXlRAxsjM8hhPSH2wyulNm4xvp3/wszvLg=
```

## ⚠️ IMPORTANT - Sécurité

### En développement :
- La clé ci-dessus est pour DEV uniquement
- Elle peut être partagée avec l'équipe de développement
- Les messages de test seront chiffrés avec cette clé

### En production :
1. **NE JAMAIS utiliser la clé de dev en production !**
2. **Générer une nouvelle clé pour la prod :**
   ```bash
   node -e "import('libsodium-wrappers').then(s => s.default.ready.then(() => console.log(s.default.to_base64(s.default.randombytes_buf(32), s.default.base64_variants.ORIGINAL))))"
   ```

3. **Sauvegarder la clé de prod dans plusieurs endroits sécurisés :**
   - Gestionnaire de secrets cloud (AWS Secrets Manager, Google Secret Manager, etc.)
   - Backup chiffré hors ligne (coffre-fort)
   - Variable d'environnement du serveur de production

### 🚨 ATTENTION : Si tu perds la clé, TOUS les messages sont irrécupérables !

Il est impossible de déchiffrer les messages sans la clé. Assure-toi de :
- Sauvegarder la clé dans au moins 2 endroits sécurisés différents
- Ne JAMAIS commit la clé dans git
- Ne JAMAIS partager la clé de production

## Comment ça fonctionne

- Tous les messages (champ `contenu`) sont automatiquement **chiffrés** avant stockage en DB
- Ils sont automatiquement **déchiffrés** lors de la récupération par l'API
- Le chiffrement utilise **libsodium** (NaCl crypto_secretbox)
- C'est transparent pour le frontend

## Structure du fichier `.env`

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=superbase
DB_USER=akslasj
DB_PASSWORD=your_password

# Encryptage des messages (32 bytes en base64)
MESSAGE_ENCRYPTION_KEY=vMj/hEvlkhXlRAxsjM8hhPSH2wyulNm4xvp3/wszvLg=
```

## Test de l'encryptage

Pour vérifier que l'encryptage fonctionne :

```typescript
import { encryptMessage, decryptMessage } from './services/encryptionService.js';

const original = "Message secret";
const encrypted = await encryptMessage(original);
console.log('Chiffré:', encrypted);

const decrypted = await decryptMessage(encrypted);
console.log('Déchiffré:', decrypted);
// Doit afficher: "Message secret"
```


