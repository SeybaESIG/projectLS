# 📝 Guide Winston Logger

## Vue d'ensemble

Le logger Winston est configuré avec :
- ✅ **Logs structurés** (format JSON)
- ✅ **Rotation automatique** (daily, 30 jours de conservation)
- ✅ **Transports multiples** (console + fichiers)
- ✅ **Niveaux de log** (error, warn, info, debug)
- ✅ **Métadonnées contextuelles**

---

## 📊 Niveaux de log

| Niveau | Usage | Exemple |
|--------|-------|---------|
| **error** | Erreurs critiques | Connexion DB échouée, erreur 500 |
| **warn** | Avertissements | Authentification échouée, rate limit |
| **info** | Informations | Démarrage serveur, cache HIT |
| **debug** | Développement | Détails de requêtes, valeurs intermédiaires |

---

## 🚀 Utilisation

### Import

```typescript
import logger from './config/logger.js';
```

### Logs basiques

```typescript
// Info
logger.info('✅ Serveur démarré sur le port 3000');

// Warning
logger.warn('⚠️  Firebase non configuré');

// Error
logger.error('❌ Erreur de connexion à la base de données');

// Debug (seulement en développement)
logger.debug('Valeur du token:', { token: 'abc123' });
```

### Logs avec contexte

```typescript
logger.info('Utilisateur connecté', {
    userId: 123,
    email: 'user@example.com',
    ip: req.ip
});

logger.error('Requête échouée', {
    method: req.method,
    path: req.path,
    statusCode: 500,
    error: error.message
});
```

### Helpers disponibles

```typescript
import { logError, logWithContext, logRequest } from './config/logger.js';

// Logger une erreur avec stack trace
try {
    // code...
} catch (error) {
    logError(error, { userId: 123, action: 'create' });
}

// Logger une requête HTTP
logRequest(req, 'Requête reçue');

// Logger avec niveau personnalisé
logWithContext('warn', 'Cache Redis down', { service: 'redis' });
```

---

## 📁 Structure des fichiers de logs

```
logs/
├── app-2025-01-17.log          # Tous les logs du 17
├── app-2025-01-18.log          # Tous les logs du 18
├── app-2025-01-19.log          # Tous les logs du 19
├── error-2025-01-17.log        # Erreurs du 17
├── error-2025-01-18.log        # Erreurs du 18
├── error-2025-01-19.log        # Erreurs du 19
└── ...
```

### Rotation automatique

- **Daily** : Nouveau fichier chaque jour
- **Conservation** : 30 jours (après, suppression auto)
- **Compression** : Les anciens logs sont zippés (`.gz`)
- **Taille max** : 20 MB par fichier

---

## 🎯 Format des logs

### En développement (console)

```
12:34:56 [info]: ✅ Redis: Connexion établie
12:34:57 [warn]: ⚠️  Cache MISS: pays:all
12:34:58 [error]: ❌ Erreur Firebase: Token expired { code: 'auth/id-token-expired' }
```

### En production (fichier JSON)

```json
{
  "timestamp": "2025-01-17 12:34:56",
  "level": "info",
  "message": "✅ Redis: Connexion établie"
}

{
  "timestamp": "2025-01-17 12:34:58",
  "level": "error",
  "message": "❌ Erreur Firebase: Token expired",
  "code": "auth/id-token-expired",
  "stack": "Error: Token expired\n    at ..."
}
```

---

## ⚙️ Configuration

### Variables d'environnement

```env
# Niveau de log (error | warn | info | debug)
LOG_LEVEL=info

# Environnement
NODE_ENV=production
```

### Niveaux par environnement

| Environnement | Niveau par défaut | Transports |
|---------------|-------------------|------------|
| **development** | `debug` | Console (colorée) |
| **test** | `error` | Console uniquement |
| **production** | `info` | Console + Fichiers avec rotation |

---

## 🔍 Recherche dans les logs

### Logs du jour

```bash
tail -f logs/app-$(date +%Y-%m-%d).log
```

### Erreurs du jour

```bash
tail -f logs/error-$(date +%Y-%m-%d).log
```

### Rechercher un utilisateur

```bash
grep "user@example.com" logs/app-*.log
```

### Filtrer par niveau

```bash
grep '"level":"error"' logs/app-2025-01-17.log
```

### Compter les erreurs

```bash
grep -c '"level":"error"' logs/app-2025-01-17.log
```

---

## 📦 Intégration avec ELK/Datadog/CloudWatch

Le format JSON structuré facilite l'intégration :

### ELK Stack (Elasticsearch + Logstash + Kibana)

```bash
# Logstash input config
input {
  file {
    path => "/app/logs/app-*.log"
    codec => "json"
  }
}
```

### Datadog

```bash
# Datadog agent config
logs:
  - type: file
    path: /app/logs/app-*.log
    service: backend-api
    source: nodejs
```

### AWS CloudWatch

```typescript
// Ajouter transport CloudWatch
import { CloudWatch } from 'winston-cloudwatch';

logger.add(new CloudWatch({
  logGroupName: '/aws/api/backend',
  logStreamName: 'production'
}));
```

---

## 🧪 Tests

Les tests sont configurés pour **ne pas créer de fichiers** :

```typescript
// En mode test, seulement console
if (process.env.NODE_ENV !== 'test') {
    // Ajouter transports fichiers
}
```

### Tester le logger

```bash
npm test -- logger.test.ts
```

---

## 📈 Monitoring

### Logs à surveiller

| Pattern | Alerte | Action |
|---------|--------|--------|
| `"level":"error"` | Si > 10/min | Investiguer |
| `Brute-force détecté` | Immédiat | Bloquer IP |
| `Redis: Trop de tentatives` | Si présent | Vérifier Redis |
| `Firebase.*error` | Si > 5/min | Vérifier Firebase |

### Scripts utiles

```bash
# Compter erreurs par heure
grep '"level":"error"' logs/app-*.log | cut -d' ' -f2 | cut -d: -f1 | sort | uniq -c

# Top 10 erreurs
grep '"level":"error"' logs/app-*.log | jq -r '.message' | sort | uniq -c | sort -rn | head -10

# Logs d'un user spécifique
grep '"email":"user@example.com"' logs/app-*.log | jq .
```

---

## 🚨 Troubleshooting

### Les logs ne s'affichent pas

```bash
# Vérifier le niveau de log
echo $LOG_LEVEL

# Vérifier que le dossier logs existe
ls -la logs/

# Vérifier les permissions
chmod 755 logs/
```

### Fichiers de logs trop gros

```bash
# Vérifier la taille
du -sh logs/

# Compresser manuellement
gzip logs/app-2025-01-*.log

# Supprimer les anciens (> 30 jours)
find logs/ -name "*.log" -mtime +30 -delete
```

### Logs manquants en production

Vérifier que `NODE_ENV=production` et que le dossier `logs/` existe :

```bash
mkdir -p logs/
npm run build && npm start
```

---

## ✅ Checklist migration

- [x] Winston installé (`winston` + `winston-daily-rotate-file`)
- [x] `config/logger.ts` créé
- [x] `console.log/warn/error` remplacés par `logger.*`
- [x] Dossier `logs/` créé (`.gitignore` ajouté)
- [x] Tests passent
- [x] Documentation créée

---

## 🎉 Résultat

**Avant** :
```typescript
console.log('✅ Utilisateur connecté');
// Logs perdus au redémarrage
// Pas de structure
// Difficile à rechercher
```

**Après** :
```typescript
logger.info('✅ Utilisateur connecté', { userId: 123, ip: req.ip });
// Sauvegardé dans logs/app-2025-01-17.log
// Format JSON structuré
// Facile à rechercher et analyser
// Prêt pour ELK/Datadog
```

🚀 **Logs prêts pour la production !**



