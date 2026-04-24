# AssurMoi API

API REST de gestion des sinistres automobiles pour la compagnie d'assurance AssurMoi.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Runtime | Node.js 24 (Alpine) |
| Framework | Express 5 |
| ORM | Sequelize 6 |
| Base de données | MariaDB |
| Auth | JWT + Bcrypt |
| Upload fichiers | Formidable |
| Mail | Nodemailer (Mailhog en dev / Gmail SMTP en prod) |
| Documentation | Swagger UI (`/api-docs`) |
| Environnement | Docker + Docker Compose |

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/) ou le Swagger UI intégré pour tester l'API

---

## Installation

### 1. Cloner le repo

```bash
git clone <url-du-repo>
cd assurmoi-final
```

### 2. Créer le fichier `.env`

```bash
cp .env.example .env
```

Puis éditer `.env` selon votre environnement (voir section [Configuration mail](#configuration-mail)).

### 3. Lancer les conteneurs

```bash
docker compose up -d
```

### 4. Lancer les migrations

```bash
docker compose run app-assurmoi-node npx sequelize-cli db:migrate
```

### 5. Lancer les seeders (crée le compte admin par défaut)

```bash
docker compose run app-assurmoi-node npx sequelize-cli db:seed:all
```

---

## Services disponibles

| Service | URL | Description |
|---|---|---|
| API REST | http://localhost:3000 | Point d'entrée de l'API |
| Swagger UI | http://localhost:3000/api-docs | Documentation interactive |
| Adminer | http://localhost:8080 | Interface base de données |
| Mailhog | http://localhost:8025 | Visualisation des emails en dev |

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

## Compte admin par défaut (après seed)

| Champ | Valeur |
|---|---|
| Username | `root` |
| Password | `root` |
| Rôle | `superadmin` |

---

## Configuration mail

Deux modes disponibles dans `.env` :

**Mode dev — Mailhog (aucune config requise, emails visibles sur http://localhost:8025) :**
```env
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@assurmoi.fr
```

**Mode prod — Gmail SMTP :**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=votre.adresse@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx   # mot de passe d'application Google (pas votre vrai mdp)
MAIL_FROM=votre.adresse@gmail.com
```

> Pour créer un mot de passe d'application Google : activer la validation en 2 étapes → https://myaccount.google.com/apppasswords

---

## Rôles utilisateurs

| Rôle | Description |
|---|---|
| `superadmin` | Accès total |
| `manager` | Gestionnaire de portefeuille |
| `sinister_manager` | Chargé de suivi des sinistres |
| `request_manager` | Chargé de clientèle |
| `insured` | Assuré (rôle par défaut à l'inscription) |

---

## Routes API

### Auth (publiques — pas de token requis)

| Méthode | Route | Description |
|---|---|---|
| POST | `/login` | Connexion — retourne un JWT |
| POST | `/register` | Inscription (rôle `insured` automatique) |
| POST | `/forgot-password` | Demande de réinitialisation par email |
| POST | `/reset-password` | Réinitialiser le mot de passe avec le token reçu |

### Auth (protégées)

| Méthode | Route | Description |
|---|---|---|
| POST | `/logout` | Déconnexion |
| PUT | `/change-password` | Changer son mot de passe |

### Users (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/user` | Liste tous les utilisateurs (`?search=prénom`) |
| GET | `/user/:id` | Récupérer un utilisateur |
| POST | `/user` | Créer un utilisateur |
| PUT | `/user/:id` | Modifier un utilisateur |
| DELETE | `/user/:id` | Supprimer un utilisateur |

### Sinistres (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/sinistre` | Liste tous les sinistres (avec docs et dossier inclus) |
| GET | `/sinistre/:id` | Récupérer un sinistre |
| POST | `/sinistre` | Créer un sinistre |
| PUT | `/sinistre/:id` | Modifier un sinistre *(créateur ou gestionnaire uniquement)* |
| DELETE | `/sinistre/:id` | Supprimer un sinistre *(créateur ou gestionnaire uniquement)* |

### Documents sinistre (protégées)

| Méthode | Route | Description |
|---|---|---|
| POST | `/sinistre/:id/document` | Uploader un document (`multipart/form-data`) |
| GET | `/sinistre/download-docs/:pathname` | Télécharger / afficher un fichier |
| DELETE | `/sinistre/:id/document/:docId` | Supprimer un document |

Types de documents acceptés : `attestation_assurance`, `carte_grise`, `piece_identite`

### Notifications mail (protégées)

| Méthode | Route | Description |
|---|---|---|
| POST | `/sinistre/:id/request-documents` | Envoyer un email à l'assuré pour demander ses documents |
| POST | `/sinistre/:id/request-rib` | Envoyer un email à l'assuré pour demander son RIB |

### Dossiers (protégées)

| Méthode | Route | Description |
|---|---|---|
| GET | `/dossier` | Liste tous les dossiers |
| GET | `/dossier/:id` | Récupérer un dossier |
| POST | `/dossier` | Créer un dossier |
| PUT | `/dossier/:id/statut` | Changer le statut d'un dossier (workflow) |

Statuts disponibles : `initialise` → `expertise_en_attente` → `expertise_planifiee` → `expertise_realisee` → `intervention_en_cours` → `vehicule_restitue` → `en_attente_facturation` → `en_attente_reglement` → `clos`

### Étapes dossier (protégées)

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

Le token est obtenu via `POST /login` ou `POST /register`.

---

## Mails automatiques

| Déclencheur | Mail envoyé |
|---|---|
| Connexion réussie (`/login`) | Notification de nouvelle connexion |
| `POST /forgot-password` | Lien de réinitialisation de mot de passe (expire 1h) |
| `POST /sinistre/:id/request-documents` | Demande de documents à l'assuré |
| `POST /sinistre/:id/request-rib` | Demande de RIB à l'assuré |

---

## Structure du projet

```
assurmoi-final/
├── config/
│   └── config.js               # Config Sequelize (lit le .env)
├── middlewares/
│   ├── auth.js                 # JWT, canModifySinistre, isManager
│   └── users.js                # Validation express-validator
├── migrations/                 # Migrations Sequelize (versioning BDD)
├── models/
│   ├── user.js
│   ├── sinistre.js
│   ├── documentSinistre.js
│   ├── dossier.js
│   ├── etapeDossier.js
│   └── historique.js
├── routes/
│   ├── index.js                # Montage de toutes les routes
│   ├── auth.js                 # login, register, forgot/reset/change password
│   ├── users.js
│   ├── sinistres.js            # CRUD + upload docs + notifications mail
│   ├── dossiers.js
│   ├── etapes.js
│   └── mail.js
├── seeders/                    # Données initiales (compte admin)
├── services/                   # Logique métier
│   ├── auth.js
│   ├── users.js
│   ├── sinistres.js
│   ├── dossiers.js
│   └── etapes.js
├── uploads/                    # Fichiers uploadés (gitignored)
├── utils/
│   └── mailer.js               # Nodemailer + templates emails HTML
├── app.js                      # Point d'entrée Express
├── swagger.js                  # Documentation Swagger (format JS — utilisé par le serveur)
├── swagger.yaml                # Documentation Swagger (format YAML — lisible humainement)
├── .env.example                # Template de configuration à copier
├── docker-compose.yml
└── Dockerfile
```

---

## Base de données — schéma

| Table | Description |
|---|---|
| `User` | Utilisateurs avec rôles, auth JWT, 2FA, reset password |
| `Sinistre` | Déclarations de sinistres automobiles |
| `DocumentSinistre` | Pièces jointes (attestation, carte grise, pièce d'identité) |
| `Dossier` | Dossiers de prise en charge liés aux sinistres |
| `EtapeDossier` | Étapes du workflow de traitement |
| `Historique` | Journal horodaté de toutes les actions |

---

## Commandes utiles

```bash
# Démarrer l'environnement
docker compose up -d

# Arrêter l'environnement
docker compose down

# Voir les logs de l'API en temps réel
docker logs app-assurmoi-nodejs -f

# Redémarrer uniquement l'API (après modification du code)
docker compose restart app-assurmoi-node

# Lancer les migrations
docker compose run app-assurmoi-node npx sequelize-cli db:migrate

# Annuler la dernière migration
docker compose run app-assurmoi-node npx sequelize-cli db:migrate:undo

# Lancer les seeders
docker compose run app-assurmoi-node npx sequelize-cli db:seed:all

# Annuler tous les seeders
docker compose run app-assurmoi-node npx sequelize-cli db:seed:undo:all

# Installer un package npm dans le conteneur
docker compose run app-assurmoi-node npm install <package>
```
