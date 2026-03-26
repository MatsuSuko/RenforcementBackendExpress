# AssurMoi API

API REST de gestion des sinistres automobiles pour la compagnie d'assurance AssurMoi.

---

## Stack technique

- **Runtime** : Node.js 24 (Alpine)
- **Framework** : Express 5
- **ORM** : Sequelize 6
- **Base de données** : MariaDB
- **Auth** : JWT + Bcrypt
- **Mail** : Nodemailer (Mailhog en dev)
- **Doc** : Swagger UI (`/api-docs`)
- **Environnement** : Docker + Docker Compose

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/) (optionnel, pour tester l'API)

---

## Installation

### 1. Cloner le repo et se placer dans le dossier

```bash
git clone <url-du-repo>
cd assurmoi-final
```

### 2. Créer le fichier `.env`

```bash
cp env.example .env
```

Contenu du `.env` :

```env
PORT=3000

# Base de données
DB_USERNAME=root
DB_PASSWORD=root
DB_HOST=db
DB_PORT=3306
DB_NAME=assurmoidb

# JWT
SECRET_KEY=change_this_secret_in_production

# Bcrypt
BCRYPT_SALT=10

# Mail (Mailhog en dev)
MAIL_HOST=mailhog
MAIL_PORT=1025

# URL de l'app
APP_URL=http://localhost:3000
```

### 3. Lancer les conteneurs

```bash
docker compose up -d
```

### 4. Lancer les migrations

```bash
docker compose run app-assurmoi-node npx sequelize-cli db:migrate
```

### 5. Lancer le seed (crée l'admin par défaut)

```bash
docker compose run app-assurmoi-node npx sequelize-cli db:seed:all
```

---

## Services disponibles

| Service | URL | Description |
|---|---|---|
| API | http://localhost:3000 | API REST |
| Swagger | http://localhost:3000/api-docs | Documentation interactive |
| Adminer | http://localhost:8080 | Interface base de données |
| Mailhog | http://localhost:8025 | Serveur mail de dev |

---

## Connexion Adminer

| Champ | Valeur |
|---|---|
| Système | MySQL / MariaDB |
| Serveur | `assurmoi-final-app-assurmoi-db-1` |
| Utilisateur | `root` |
| Mot de passe | `root` |
| Base de données | `assurmoidb` |

---

## Compte admin par défaut

| Champ | Valeur |
|---|---|
| Username | `admin` |
| Password | `MotDeP@ss123` |
| Rôle | `superadmin` |

---

## Rôles utilisateurs

| Rôle | Description |
|---|---|
| `superadmin` | Accès total |
| `manager` | Gestionnaire de portefeuille |
| `sinister_manager` | Chargé de suivi des dossiers |
| `request_manager` | Chargé de clientèle |
| `insured` | Assuré |

---

## Routes API

### Auth (publiques)

| Méthode | Route | Description |
|---|---|---|
| POST | `/login` | Connexion |
| POST | `/logout` | Déconnexion |
| POST | `/forgot-password` | Demande reset mot de passe |
| POST | `/reset-password` | Réinitialiser le mot de passe |
| PUT | `/change-password` | Changer le mot de passe |

### Users (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/user` | Liste tous les utilisateurs |
| GET | `/user/:id` | Récupérer un utilisateur |
| POST | `/user` | Créer un utilisateur |
| PUT | `/user/:id` | Modifier un utilisateur |
| DELETE | `/user/:id` | Supprimer un utilisateur |

### Sinistres (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/sinistre` | Liste tous les sinistres |
| GET | `/sinistre/:id` | Récupérer un sinistre |
| POST | `/sinistre` | Créer un sinistre |
| PUT | `/sinistre/:id` | Modifier un sinistre |
| DELETE | `/sinistre/:id` | Supprimer un sinistre |

### Dossiers (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/dossier` | Liste tous les dossiers |
| GET | `/dossier/:id` | Récupérer un dossier |
| POST | `/dossier` | Créer un dossier |
| PUT | `/dossier/:id/statut` | Changer le statut d'un dossier |

### Etapes (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/dossier/:dossier_id/etapes` | Liste les étapes d'un dossier |
| POST | `/dossier/:dossier_id/etapes` | Créer une étape |
| PUT | `/etape/:id/valider` | Valider une étape |

---

## Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```
Authorization: Bearer <token>
```

Le token est obtenu via `POST /login`.

---

## Structure du projet

```
assurmoi-final/
├── config/
│   └── config.js           # Config Sequelize
├── middlewares/
│   ├── auth.js             # Vérification JWT
│   ├── roles.js            # Vérification des rôles
│   └── users.js            # Validation des champs
├── migrations/             # Migrations Sequelize
├── models/                 # Modèles Sequelize
├── routes/                 # Définition des routes
├── seeders/                # Données initiales
├── services/               # Logique métier
├── app.js                  # Point d'entrée
├── swagger.js              # Config Swagger JS
├── swagger.yaml            # Doc Swagger YAML
├── docker-compose.yml
└── Dockerfile
```

---

## Commandes utiles

```bash
# Lancer l'environnement
docker compose up -d

# Arrêter l'environnement
docker compose down

# Voir les logs de l'API
docker logs app-assurmoi-nodejs

# Lancer les migrations
docker compose run app-assurmoi-node npx sequelize-cli db:migrate

# Annuler la dernière migration
docker compose run app-assurmoi-node npx sequelize-cli db:migrate:undo

# Lancer les seeders
docker compose run app-assurmoi-node npx sequelize-cli db:seed:all

# Installer un package
docker compose run app-assurmoi-node npm i <package>

# Générer un hash bcrypt manuellement
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('MonMotDePasse', 10).then(h => console.log(h))"
```

---

## Base de données

Le schéma comprend 6 tables :

- **User** — utilisateurs avec rôles et auth
- **Sinistre** — déclarations de sinistres
- **DocumentSinistre** — pièces jointes des sinistres
- **Dossier** — dossiers de prise en charge
- **EtapeDossier** — étapes du processus de traitement
- **Historique** — journal horodaté de toutes les actions
