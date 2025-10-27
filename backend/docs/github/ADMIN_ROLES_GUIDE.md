# Guide de Gestion des Rôles Admin

Guide complet pour gérer les rôles administrateurs dans l'application.

---

## Table des matières

1. [Architecture des rôles](#architecture-des-rôles)
2. [Routes protégées par rôle](#routes-protégées-par-rôle)
3. [Gestion des admins](#gestion-des-admins)
4. [Exemples d'utilisation](#exemples-dutilisation)
5. [Sécurité](#sécurité)

---

## Architecture des rôles

### 3 niveaux de sécurité

```
┌─────────────────────────────────────────┐
│  1. ROUTES PUBLIQUES                     │
│  Sans authentification ou optionnelle   │
│  - /api/pays                            │
│  - /api/villes                          │
│  - /api/aeroports                       │
│  - /api/annonces                        │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  2. ROUTES AUTHENTIFIÉES                 │
│  Token Firebase requis                  │
│  - /api/users                           │
│  - /api/abonnements                     │
│  - /api/messages                        │
│  - /api/transactions                    │
│  - /api/paiements                       │
│  - /api/evaluations                     │
│  - /api/upload                          │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│  3. ROUTES ADMIN UNIQUEMENT              │
│  Token Firebase + rôle 'admin'          │
│  - /api/roles                           │
│  - /api/types_abonnement                │
│  - /api/historique_abonnements          │
│  - /api/historique_annonces             │
└─────────────────────────────────────────┘
```

### Rôles disponibles

- **`user`** (défaut) : Utilisateur standard
- **`admin`** : Administrateur avec accès aux routes admin

---

## Routes protégées par rôle

### Routes publiques (sans authentification)

```
GET /api/pays          # Liste des pays
GET /api/villes        # Liste des villes
GET /api/aeroports     # Liste des aéroports
GET /api/annonces      # Liste des annonces
```

### Routes authentifiées (tous les utilisateurs)

```
GET    /api/users                # Profil utilisateur
POST   /api/messages             # Envoyer un message
GET    /api/transactions         # Voir ses transactions
POST   /api/paiements            # Effectuer un paiement
GET    /api/evaluations          # Voir les évaluations
POST   /api/upload               # Uploader une image
```

### Routes admin uniquement

```
GET    /api/roles                        # Gérer les rôles
POST   /api/roles                        # Créer un rôle

GET    /api/types_abonnement             # Types d'abonnements
POST   /api/types_abonnement             # Créer un type
PUT    /api/types_abonnement/:id         # Modifier un type
DELETE /api/types_abonnement/:id         # Supprimer un type

GET    /api/historique_abonnements       # Historique complet
GET    /api/historique_annonces          # Historique complet
```

**Réponse si non-admin :**
```json
{
  "error": "Accès interdit",
  "message": "Rôle requis: admin"
}
```

---

## Gestion des admins

### 1. Définir un utilisateur comme admin

```bash
npm run set-admin <firebase_uid>
```

**Exemple :**
```bash
npm run set-admin abc123xyz456

# Sortie :
# Définition du rôle admin pour l'utilisateur abc123xyz456...
# 
# Rôle admin défini avec succès.
# 
# Informations utilisateur :
#   - UID: abc123xyz456
#   - Email: admin@example.com
#   - Rôle: admin
# 
# Note: L'utilisateur doit se reconnecter pour que le nouveau rôle soit actif.
```

### 2. Retirer le rôle admin

```bash
npm run remove-admin <firebase_uid>
```

**Exemple :**
```bash
npm run remove-admin abc123xyz456

# Sortie :
# Retrait du rôle admin pour l'utilisateur abc123xyz456...
# 
# Rôle admin retiré avec succès.
# 
# Informations utilisateur :
#   - UID: abc123xyz456
#   - Email: user@example.com
#   - Rôle: user
```

### 3. Lister tous les utilisateurs

```bash
npm run list-users
```

**Exemple de sortie :**
```
Liste des utilisateurs Firebase

────────────────────────────────────────────────────────────────────────────────
   ADMIN
   UID:      abc123xyz456
   Email:    admin@example.com
   Créé:     01/10/2025
   Dernière: 13/10/2025
────────────────────────────────────────────────────────────────────────────────
   USER
   UID:      def789ghi012
   Email:    user@example.com
   Créé:     05/10/2025
   Dernière: 12/10/2025
────────────────────────────────────────────────────────────────────────────────

Statistiques:
   Total utilisateurs: 2
   Admins: 1
   Users: 1
```

---

## Exemples d'utilisation

### Exemple 1 : Utilisateur normal tente d'accéder à une route admin

**Requête :**
```bash
curl -X GET https://localhost:3443/api/historique_abonnements \
  -H "Authorization: Bearer USER_TOKEN"
```

**Réponse : 403 Forbidden**
```json
{
  "error": "Accès interdit",
  "message": "Rôle requis: admin"
}
```

### Exemple 2 : Admin accède à une route admin

**Requête :**
```bash
curl -X GET https://localhost:3443/api/historique_abonnements \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Réponse : 200 OK**
```json
{
  "data": [
    {
      "id_historique": 1,
      "id_abonnement": 5,
      "action": "creation",
      ...
    }
  ]
}
```

### Exemple 3 : Vérifier le rôle dans un controller

```typescript
import type { AuthRequest } from '../middlewares/firebaseAuth.js';

export const someController = async (req: AuthRequest, res: Response) => {
    // Le rôle est disponible dans req.user.firebase.role
    const userRole = req.user?.firebase?.role || 'user';
    
    if (userRole === 'admin') {
        // Fonctionnalité admin
        console.log('Admin détecté');
    } else {
        // Fonctionnalité utilisateur standard
        console.log('Utilisateur standard');
    }
    
    res.json({ role: userRole });
};
```

---

## Sécurité

### Custom Claims Firebase

Les rôles sont stockés dans les **Custom Claims** de Firebase, ce qui signifie :

- **Sécurisé** : Impossible de falsifier (vérifié par Firebase)
- **Inclus dans le token** : Pas de requête DB supplémentaire
- **Côté serveur** : Seul le backend peut modifier les rôles
- **Cache** : L'utilisateur doit se reconnecter après un changement de rôle

### Vérification côté serveur

```typescript
// middleware/firebaseAuth.ts (déjà implémenté)

export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user?.firebase) {
            res.status(401).json({
                error: 'Non autorisé',
                message: 'Authentification requise'
            });
            return;
        }

        const userRole = req.user.firebase.role || 'user';

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                error: 'Accès interdit',
                message: `Rôle requis: ${allowedRoles.join(' ou ')}`
            });
            return;
        }

        next();
    };
}
```

### Meilleures pratiques

1. **Ne jamais se fier au client** : Toujours vérifier le rôle côté serveur
2. **Limiter le nombre d'admins** : Privilège minimum
3. **Logger les actions admin** : Traçabilité
4. **Révision régulière** : Audit des rôles

---

## Déploiement

### Créer le premier admin

1. **Créer un utilisateur dans Firebase Console** :
   - https://console.firebase.google.com
   - Authentication → Utilisateurs → Ajouter un utilisateur

2. **Récupérer l'UID** :
   - Cliquer sur l'utilisateur dans la console
   - Copier l'UID (ex: `abc123xyz456`)

3. **Définir comme admin** :
   ```bash
   npm run set-admin abc123xyz456
   ```

4. **Vérifier** :
   ```bash
   npm run list-users
   ```

---

## Résumé

| Action | Commande | Exemple |
|--------|----------|---------|
| **Définir admin** | `npm run set-admin <uid>` | `npm run set-admin abc123` |
| **Retirer admin** | `npm run remove-admin <uid>` | `npm run remove-admin abc123` |
| **Lister users** | `npm run list-users` | `npm run list-users` |

---

## FAQ

### Q: Comment obtenir l'UID d'un utilisateur ?

**R:** Soit dans la Firebase Console (Authentication → Utilisateurs), soit via `npm run list-users`.

### Q: L'utilisateur doit-il se reconnecter après un changement de rôle ?

**R:** Oui, les custom claims sont inclus dans le token JWT. Le token doit être rafraîchi.

### Q: Peut-on avoir plusieurs rôles ?

**R:** Oui, modifiez `requireRole` pour accepter un tableau. Actuellement, un utilisateur a un seul rôle.

### Q: Comment protéger une seule route spécifique ?

**R:** Appliquez le middleware directement sur la route :

```typescript
router.delete('/users/:id', 
    authenticateFirebase,
    requireRole('admin'),
    deleteUser
);
```

---

**Le système de rôles est configuré et opérationnel.**







