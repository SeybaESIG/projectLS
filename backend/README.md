# Backend - Plateforme de Covoiturage Aérien

API REST backend pour une plateforme de mise en relation de voyageurs aériens.

## Table des matières

- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Scripts disponibles](#scripts-disponibles)
- [Base de données](#base-de-données)

---

## Technologies

- **Runtime :** Node.js 20+
- **Framework :** Express 4
- **Langage :** TypeScript 5
- **Base de données :** PostgreSQL 17
- **ORM :** Sequelize 6
- **Tests :** Jest 30
- **Validation :** Joi 18
- **Logging :** Winston 3
- **Authentification :** JWT (jsonwebtoken 9)
- **Sécurité :** bcrypt 6, CORS

---

## Prérequis

- Node.js >= 20.0.0
- PostgreSQL >= 17.0
- npm ou yarn

---

## Installation

### 1. Cloner le projet

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier `.env.example` en `.env` et renseigner les valeurs :

```bash
cp .env.example .env
```

Puis éditer `.env` avec vos configurations.

### 4. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE nom_de_la_base;

# Importer le schéma
\i database_script.sql
```

### 5. Importer les données de référence

```bash
# Importer les pays
npm run import:pays

# Importer les villes et aéroports
npm run import:villes
npm run import:aeroports
```

---

## Configuration

### Variables d'environnement (.env)

Voir le fichier `.env.example` pour la liste complète des variables.

**Variables essentielles :**

```env
DB_NAME=votre_base_de_donnees
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_long_et_aleatoire
AIRLABS_API_KEY=votre_cle_api_airlabs
FRONTEND_URL=http://localhost:3001
```

**Générer un JWT_SECRET sécurisé :**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Utilisation

### Démarrage en développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Démarrage en production

```bash
# Compiler TypeScript
npm run build

# Démarrer le serveur
npm start
```

---

## Structure du projet

```
backend/
├── bin/                    # Point d'entrée du serveur
├── config/                 # Configuration (BDD, etc.)
├── controllers/            # Logique métier (16 controllers)
├── middlewares/            # Middlewares (auth, validation, errors)
├── models/                 # Modèles Sequelize (17 modèles)
├── routes/                 # Routes Express (17 routes)
├── schemas/                # Schémas de validation Joi
├── scripts/                # Scripts d'import et migrations
│   ├── migrations/         # Migrations SQL
│   ├── importPays.ts       # Import des pays (API AirLabs)
│   ├── importVilles.ts     # Import des villes (CSV)
│   └── importAeroports.ts  # Import des aéroports (CSV)
├── test/                   # Tests Jest (24 fichiers)
├── logs/                   # Logs Winston
├── app.ts                  # Configuration Express
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── jest.config.mjs         # Configuration Jest
└── database_script.sql     # Schéma SQL complet
```

---

## API Endpoints

### Authentification

- `POST /login` - Connexion utilisateur

### Pays

- `GET /api/pays` - Liste tous les pays (252 pays)
- `GET /api/pays/:id` - Détails d'un pays

### Villes

- `GET /api/villes` - Liste toutes les villes (2 950 villes)
- `GET /api/villes/:id` - Détails d'une ville

### Aéroports

- `GET /api/aeroports` - Liste tous les aéroports (3 016 aéroports)
- `GET /api/aeroports/:id` - Détails d'un aéroport

### Utilisateurs

- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `POST /users` - Créer un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

### Rôles

- `GET /api/roles` - Liste des rôles
- `GET /api/roles/:id` - Détails d'un rôle

### Annonces

- `GET /annonces` - Liste des annonces
- `POST /annonces` - Créer une annonce
- `PUT /annonces/:id` - Modifier une annonce
- `DELETE /annonces/:id` - Supprimer une annonce

### Autres endpoints

- Messages, Transactions, Paiements, Évaluations, Abonnements, etc.

---

## Tests

### Lancer tous les tests unitaires

```bash
npm test
```

**Résultat actuel :** 136 tests passent (12 suites)

### Lancer les tests d'intégration

```bash
npm run test:integration
```

### Lancer tous les tests (unitaires + intégration)

```bash
npm run test:all
```

### Tests en mode watch

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

**Tests disponibles :**
- Controllers (pays, villes, aéroports, rôles, etc.)
- Routes (pays, villes, aéroports, rôles, etc.)
- Schemas (validation Joi)
- Scripts d'import

---

## Scripts disponibles

### Scripts de développement

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Compilation TypeScript
npm start            # Démarrage en production
```

### Scripts de tests

```bash
npm test                  # Tests unitaires
npm run test:integration  # Tests d'intégration
npm run test:all         # Tous les tests
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Coverage des tests
```

### Scripts d'import

```bash
npm run import:pays       # Importer les pays depuis API AirLabs
npm run import:villes     # Importer les villes depuis CSV
npm run import:aeroports  # Importer les aéroports depuis CSV
```

**Note :** L'import des villes et aéroports nécessite le fichier `AeroportsClean - airports.csv`

---

## Base de données

### Schéma

Le schéma complet est disponible dans `database_script.sql` (1045 lignes).

### Tables principales

| Table | Description | Nombre d'enregistrements |
|-------|-------------|-------------------------|
| `tb_pays` | Pays du monde | 252 |
| `tb_villes` | Villes avec aéroports | 2 950 |
| `tb_aeroports` | Aéroports internationaux | 3 016 |
| `tb_roles` | Rôles utilisateurs | 2 (admin, utilisateur) |
| `tb_utilisateurs` | Utilisateurs | - |
| `tb_annonces` | Annonces de covoiturage | - |
| `tb_messages` | Messages entre utilisateurs | - |
| `tb_transactions` | Transactions financières | - |
| `tb_paiements` | Paiements | - |
| `tb_evaluations` | Évaluations utilisateurs | - |
| `tb_abonnements` | Abonnements | - |
| `tb_types_abonnement` | Types d'abonnements | - |

### Relations principales

```
Pays (252)
  └─> Villes (2 950)
        └─> Aéroports (3 016)
              └─> Annonces
                    └─> Transactions
                          └─> Paiements
                          └─> Évaluations

Utilisateurs
  ├─> Annonces
  ├─> Messages
  ├─> Transactions
  ├─> Évaluations
  └─> Abonnements
```

### Migrations

Les migrations SQL sont dans `scripts/migrations/` :
- `002_update_villes_aeroports.sql` - Restructuration villes/aéroports
- `003_simplify_annonces.sql` - Simplification du modèle Annonce

---

## Sécurité

### Authentification

- JWT tokens (à activer dans `middlewares/loginMiddleware.ts`)
- Bcrypt pour le hachage des mots de passe
- Variables d'environnement pour les secrets

### Validation

- Joi pour la validation des données entrantes
- Validation personnalisée (téléphone, email, etc.)
- Sanitization automatique

### CORS

- Configuré pour accepter les requêtes du frontend
- Credentials autorisés
- Headers personnalisables

---

## Documentation du code

### Modèles (Sequelize)

Tous les modèles utilisent TypeScript strict avec inférence de types :

```typescript
export class Ville extends Model<InferAttributes<Ville>, InferCreationAttributes<Ville>> {
    declare id_ville: CreationOptional<number>;
    declare nom_ville: string;
    declare id_pays: number;
}
```

### Controllers

Pattern MVC standard avec gestion d'erreurs :

```typescript
export const getAllVilles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const villes = await Ville.findAll();
        res.json(villes);
    } catch (error) {
        next(error);
    }
};
```

### Associations

Définies centralement dans `models/associations.ts` :

```typescript
Aeroport.belongsTo(Ville, { foreignKey: 'id_ville' });
Ville.hasMany(Aeroport, { foreignKey: 'id_ville' });
```

---

## Dépannage

### Le serveur ne démarre pas

- Vérifier que PostgreSQL est démarré
- Vérifier les variables d'environnement dans `.env`
- Vérifier que le port 3000 est libre

### Erreur de connexion à la base de données

```bash
# Vérifier la connexion
psql -U votre_utilisateur -d votre_base -h localhost
```

### Les tests échouent

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## TODO

- [ ] Activer JWT dans `loginMiddleware.ts`
- [ ] Créer middleware d'autorisation basé sur rôles
- [ ] Ajouter rate limiting
- [ ] Ajouter Helmet pour la sécurité
- [ ] Ajouter documentation Swagger/OpenAPI
- [ ] Ajouter compression des réponses

---

## Licence

Propriétaire - Tous droits réservés

---

## Équipe

Projet réalisé dans le cadre de ProjetLS

---

## Support

Pour toute question ou problème, veuillez ouvrir une issue.

---

**Version :** 1.0.0  
**Dernière mise à jour :** Octobre 2025













