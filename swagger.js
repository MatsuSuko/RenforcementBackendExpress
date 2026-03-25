const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AssurMoi API',
            version: '1.0.0',
            description: 'API de gestion des sinistres AssurMoi'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Serveur de développement' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        firstname: { type: 'string' },
                        lastname: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['administrateur', 'gestionnaire', 'charge_suivi', 'charge_clientele'] },
                        actif: { type: 'boolean' }
                    }
                },
                Sinistre: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        immatriculation: { type: 'string' },
                        conducteur_nom: { type: 'string' },
                        conducteur_prenom: { type: 'string' },
                        conducteur_est_assure: { type: 'boolean' },
                        date_appel: { type: 'string', format: 'date-time' },
                        date_accident: { type: 'string', format: 'date-time' },
                        contexte: { type: 'string' },
                        responsabilite_engagee: { type: 'boolean' },
                        pourcentage_responsabilite: { type: 'integer', enum: [0, 50, 100] },
                        statut: { type: 'string', enum: ['en_cours', 'complet', 'clos'] }
                    }
                },
                Dossier: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        numero_dossier: { type: 'string' },
                        sinistre_id: { type: 'integer' },
                        charge_suivi_id: { type: 'integer' },
                        statut: {
                            type: 'string',
                            enum: ['initialise', 'expertise_en_attente', 'expertise_planifiee', 'expertise_realisee', 'intervention_en_cours', 'vehicule_restitue', 'en_attente_facturation', 'en_attente_reglement', 'clos']
                        },
                        scenario: { type: 'string', enum: ['reparable', 'perte_totale'] }
                    }
                },
                EtapeDossier: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        dossier_id: { type: 'integer' },
                        libelle: { type: 'string' },
                        statut: { type: 'string', enum: ['en_attente', 'en_cours', 'complete', 'validee'] },
                        validation_requise: { type: 'boolean' },
                        valide: { type: 'boolean' },
                        commentaire: { type: 'string' },
                        date_echeance: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
        paths: {

            // ── AUTH ──────────────────────────────────────────────
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Connexion',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['username', 'password'],
                                    properties: {
                                        username: { type: 'string', example: 'jdupont' },
                                        password: { type: 'string', example: 'MotDeP@ss123' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Connexion réussie — retourne un token JWT ou demande le code 2FA' },
                        401: { description: 'Identifiants incorrects' },
                        403: { description: 'Compte désactivé' }
                    }
                }
            },
            '/auth/2fa/verify': {
                post: {
                    tags: ['Auth'],
                    summary: 'Vérification code 2FA',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['user_id', 'code'],
                                    properties: {
                                        user_id: { type: 'integer', example: 1 },
                                        code: { type: 'string', example: '123456' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Code valide — retourne le token JWT' },
                        401: { description: 'Code incorrect ou expiré' }
                    }
                }
            },
            '/auth/forgot-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Demande de réinitialisation de mot de passe',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email'],
                                    properties: {
                                        email: { type: 'string', example: 'jean.dupont@assurmoi.fr' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Email envoyé si le compte existe' }
                    }
                }
            },
            '/auth/reset-password': {
                post: {
                    tags: ['Auth'],
                    summary: 'Réinitialisation du mot de passe',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['token', 'password'],
                                    properties: {
                                        token: { type: 'string' },
                                        password: { type: 'string', example: 'NouveauMdp@123' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Mot de passe réinitialisé' },
                        400: { description: 'Token invalide ou expiré' }
                    }
                }
            },
            '/auth/change-password': {
                put: {
                    tags: ['Auth'],
                    summary: 'Changement de mot de passe (connecté)',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['current_password', 'new_password'],
                                    properties: {
                                        current_password: { type: 'string' },
                                        new_password: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Mot de passe modifié' },
                        401: { description: 'Mot de passe actuel incorrect' }
                    }
                }
            },

            // ── USERS ─────────────────────────────────────────────
            '/user': {
                get: {
                    tags: ['Users'],
                    summary: 'Liste tous les utilisateurs',
                    parameters: [
                        { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Recherche par prénom' }
                    ],
                    responses: {
                        200: { description: 'Liste des utilisateurs' }
                    }
                },
                post: {
                    tags: ['Users'],
                    summary: 'Créer un utilisateur',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['username', 'password'],
                                    properties: {
                                        username: { type: 'string' },
                                        password: { type: 'string' },
                                        firstname: { type: 'string' },
                                        lastname: { type: 'string' },
                                        email: { type: 'string' },
                                        role: { type: 'string', enum: ['administrateur', 'gestionnaire', 'charge_suivi', 'charge_clientele'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Utilisateur créé' },
                        400: { description: 'Données invalides' }
                    }
                }
            },
            '/user/{id}': {
                get: {
                    tags: ['Users'],
                    summary: 'Récupérer un utilisateur',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Utilisateur trouvé' },
                        404: { description: 'Introuvable' }
                    }
                },
                put: {
                    tags: ['Users'],
                    summary: 'Modifier un utilisateur',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Utilisateur modifié' }
                    }
                },
                delete: {
                    tags: ['Users'],
                    summary: 'Supprimer un utilisateur',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Utilisateur supprimé' }
                    }
                }
            },

            // ── SINISTRES ─────────────────────────────────────────
            '/sinistre': {
                get: {
                    tags: ['Sinistres'],
                    summary: 'Liste tous les sinistres',
                    responses: { 200: { description: 'Liste des sinistres' } }
                },
                post: {
                    tags: ['Sinistres'],
                    summary: 'Créer un sinistre',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['immatriculation', 'conducteur_nom', 'conducteur_prenom', 'date_appel', 'date_accident', 'contexte'],
                                    properties: {
                                        immatriculation: { type: 'string', example: 'AB-123-CD' },
                                        conducteur_nom: { type: 'string', example: 'Dupont' },
                                        conducteur_prenom: { type: 'string', example: 'Jean' },
                                        conducteur_est_assure: { type: 'boolean', example: true },
                                        date_appel: { type: 'string', format: 'date-time' },
                                        date_accident: { type: 'string', format: 'date-time' },
                                        contexte: { type: 'string', example: 'Collision au carrefour' },
                                        responsabilite_engagee: { type: 'boolean', example: true },
                                        pourcentage_responsabilite: { type: 'integer', enum: [0, 50, 100], example: 50 }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Sinistre créé' },
                        400: { description: 'Données invalides' }
                    }
                }
            },
            '/sinistre/{id}': {
                get: {
                    tags: ['Sinistres'],
                    summary: 'Récupérer un sinistre',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Sinistre trouvé' },
                        404: { description: 'Introuvable' }
                    }
                },
                put: {
                    tags: ['Sinistres'],
                    summary: 'Modifier un sinistre',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Sinistre' }
                            }
                        }
                    },
                    responses: { 200: { description: 'Sinistre modifié' } }
                },
                delete: {
                    tags: ['Sinistres'],
                    summary: 'Supprimer un sinistre',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: { 200: { description: 'Sinistre supprimé' } }
                }
            },

            // ── DOSSIERS ──────────────────────────────────────────
            '/dossier': {
                get: {
                    tags: ['Dossiers'],
                    summary: 'Liste tous les dossiers',
                    responses: { 200: { description: 'Liste des dossiers' } }
                },
                post: {
                    tags: ['Dossiers'],
                    summary: 'Créer un dossier',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['sinistre_id'],
                                    properties: {
                                        sinistre_id: { type: 'integer' },
                                        charge_suivi_id: { type: 'integer' },
                                        scenario: { type: 'string', enum: ['reparable', 'perte_totale'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Dossier créé' },
                        400: { description: 'Données invalides' }
                    }
                }
            },
            '/dossier/{id}': {
                get: {
                    tags: ['Dossiers'],
                    summary: 'Récupérer un dossier',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    responses: {
                        200: { description: 'Dossier trouvé' },
                        404: { description: 'Introuvable' }
                    }
                }
            },
            '/dossier/{id}/statut': {
                put: {
                    tags: ['Dossiers'],
                    summary: 'Changer le statut d\'un dossier',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['statut'],
                                    properties: {
                                        statut: {
                                            type: 'string',
                                            enum: ['initialise', 'expertise_en_attente', 'expertise_planifiee', 'expertise_realisee', 'intervention_en_cours', 'vehicule_restitue', 'en_attente_facturation', 'en_attente_reglement', 'clos']
                                        },
                                        scenario: { type: 'string', enum: ['reparable', 'perte_totale'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Statut mis à jour' } }
                }
            },

            // ── ETAPES ────────────────────────────────────────────
            '/dossier/{dossier_id}/etapes': {
                get: {
                    tags: ['Etapes'],
                    summary: 'Liste les étapes d\'un dossier',
                    parameters: [{ in: 'path', name: 'dossier_id', required: true, schema: { type: 'integer' } }],
                    responses: { 200: { description: 'Liste des étapes' } }
                },
                post: {
                    tags: ['Etapes'],
                    summary: 'Créer une étape',
                    parameters: [{ in: 'path', name: 'dossier_id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['dossier_id', 'libelle'],
                                    properties: {
                                        dossier_id: { type: 'integer' },
                                        libelle: { type: 'string', example: 'Expertise planifiée' },
                                        validation_requise: { type: 'boolean', example: false },
                                        date_echeance: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Étape créée' },
                        400: { description: 'Données invalides' }
                    }
                }
            },
            '/etape/{id}/valider': {
                put: {
                    tags: ['Etapes'],
                    summary: 'Valider une étape',
                    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        commentaire: { type: 'string', example: 'Expertise effectuée le 25/03/2026' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Étape validée' },
                        403: { description: 'Validation gestionnaire requise' },
                        404: { description: 'Étape introuvable' }
                    }
                }
            }
        }
    },
    apis: []
};

module.exports = swaggerJsdoc(options);