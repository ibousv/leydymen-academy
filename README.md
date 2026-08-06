# LEYDYMEN Academy - Learning Management System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/leydymen/academy)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](https://github.com/leydymen/academy)
[![Integration](https://img.shields.io/badge/integration-80%25-success.svg)](./integration-contract.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

LEYDYMEN Academy est une plateforme complète de gestion d'apprentissage en ligne (LMS) conçue pour administrer des bootcamps informatiques. Elle offre une expérience utilisateur fluide pour les étudiants, instructeurs et administrateurs.

---

## Table des matières

- [Démarrage rapide](#-démarrage-rapide)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Déploiement](#-déploiement)
- [Intégration](#-intégration)
- [Sécurité](#-sécurité)
- [Support](#-support)

---

## Démarrage rapide

### Prérequis

- Docker 24.0+
- Docker Compose 2.20+
- Git

### Installation en 5 étapes

```bash
# 1. recuperer le code source
cd leydymen-academy/backend

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Démarrer les services backend
docker-compose up -d

# 4. naviger sur le dossier frontend
cd leydymen-academy/frontend

# 5. Démarrer le frontend
docker-compose up -d
```

### Accès aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| Frontend | http://localhost | - |
| Backend API | http://localhost:8080 | - |
| Swagger UI | http://localhost:8080/swagger-ui.html | - |
| phpMyAdmin | http://localhost:8081 | root / root_password |

---

## Documentation

### Documentation complète

La documentation technique détaillée est disponible dans [DOCUMENTATION_TECHNIQUE.md](./DOCUMENTATION_TECHNIQUE.md)

### Index de la documentation

| Section | Contenu |
|---------|---------|
| **[1. Vue d'ensemble](./DOCUMENTATION_TECHNIQUE.md#1-vue-densemble-de-larchitecture)** | Architecture globale, stack technique, principes |
| **[2. Configuration](./DOCUMENTATION_TECHNIQUE.md#2-configuration-de-lenvironnement-de-développement)** | Setup dev, Docker, variables d'environnement |
| **[3. Backend Structure](./DOCUMENTATION_TECHNIQUE.md#3-structure-du-projet-backend)** | Organisation des répertoires backend |
| **[4. Modèle de données](./DOCUMENTATION_TECHNIQUE.md#4-modèle-de-données)** | Entités JPA, schéma BD |
| **[5. Architecture applicative](./DOCUMENTATION_TECHNIQUE.md#5-architecture-applicative)** | Patterns, flux requêtes |
| **[6. Authentification](./DOCUMENTATION_TECHNIQUE.md#6-authentification-et-sécurité)** | JWT, Spring Security, configuration |
| **[7. Services](./DOCUMENTATION_TECHNIQUE.md#7-guide-dimplémentation-des-services)** | Couche métier, services |
| **[8. Endpoints API](./DOCUMENTATION_TECHNIQUE.md#8-endpoints-api)** | Tous les endpoints REST |
| **[9. Gestion erreurs](./DOCUMENTATION_TECHNIQUE.md#9-gestion-des-erreurs)** | Exception handling global |
| **[10. Déploiement](./DOCUMENTATION_TECHNIQUE.md#10-processus-de-déploiement)** | Docker, build, production |
| **[11. Maintenance](./DOCUMENTATION_TECHNIQUE.md#11-maintenance-et-monitoring)** | Monitoring, logs, backup |
| **[12. Frontend](./DOCUMENTATION_TECHNIQUE.md#12-architecture-et-configuration-frontend)** | Angular, services, composants |

---

## Stack technique

### Backend

| Composant | Version | Justification |
|-----------|---------|---------------|
| Spring Boot | 4.1.0 | Framework web moderne |
| Java | 21 | LTS avec virtual threads |
| Maven | 3.9.6 | Build tool standardisé |
| MySQL | 8.0 | Base de données robuste |
| Hibernate | 6.x | ORM complet |
| Spring Security | 6.x | Authentification & autorisation |
| JWT (JJWT) | 0.12.6 | Tokens stateless |
| SpringDoc OpenAPI | 2.7.0 | Documentation Swagger |

### Frontend

| Composant | Version | Justification |
|-----------|---------|---------------|
| Angular | 17+ | Framework moderne |
| TypeScript | 5+ | Typage fort |
| RxJS | 7+ | Programmation réactive |
| Nginx | Latest | Serveur web haute perf |
| Node.js | 20-Alpine | Runtime léger |

### Infrastructure

| Composant | Version | Justification |
|-----------|---------|---------------|
| Docker | 24.0+ | Conteneurisation |
| Docker Compose | 2.20+ | Orchestration |
| Git | Latest | Contrôle de version |

---

## Installation

### Installation locale (développement)

#### Prérequis

```bash
# Vérifier les versions
docker --version
docker-compose --version
git --version
```

#### Étapes

```bash
# 1. Cloner le repository
git clone https://<>.git
cd leydymen-academy

# 2. Copier et configurer .env
cp .env.example .env
# Éditer .env avec vos paramètres (surtout APP_JWT_SECRET)

# 3. Démarrer les services
docker-compose up -d

# 4. Vérifier le statut
docker-compose ps

# 5. Consulter les logs
docker-compose logs -f backend
```

#### Vérification

```bash
# Tester les endpoints
curl http://localhost:8080/swagger-ui.html
curl http://localhost/index.html

# Vérifier la santé des services
docker-compose ps
```

### Installation avec développement local

#### Backend (Java/Maven)

```bash
cd backend
mvn clean install
mvn spring-boot:run
# Accessible sur http://localhost:8080
```

#### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
# Accessible sur http://localhost:4200
```

---

## Déploiement

### Production avec Docker Compose

```bash
# Configurer pour production
export SPRING_PROFILES_ACTIVE=prod
export APP_JWT_SECRET=<votre-clé-sécurisée>
export MYSQL_PASSWORD=<mot-de-passe-fort>

# Démarrer
docker-compose up -d

# Vérifier
docker-compose ps
docker-compose logs backend
```

### Configuration production (.env)

```bash
SPRING_PROFILES_ACTIVE=prod
LOGGING_LEVEL_ROOT=WARN
LOGGING_LEVEL_COM_LEYDYMEN=INFO
BACKEND_PORT=8080
FRONTEND_PORT=80
```

### Considérations sécurité

- Changer tous les mots de passe par défaut
- Générer une clé JWT cryptographiquement sûre
- Configurer HTTPS/SSL
- Définir des limites de ressources Docker
- Activer les backups automatiques
- Configurer le monitoring/alertes

---

## Intégration

### Statut d'intégration: **80%**

**31 endpoints sur 39 fonctionnels**

| Domaine | Avant | Après | Statut |
|---------|-------|-------|--------|
| Authentification | 50% | 75% | OK |
| Formations | 62% | 100% | OK |
| Inscriptions | 60% | 100% | OK |
| Progression | 25% | 75% | OK |
| Utilisateurs | 33% | 75% | OK |
| Statistiques | 0% | 67% | OK |
| Modules/Leçons | 75% | 100% | OK |

### Corrections appliquées

1. Token refresh endpoint corrigé
2. LoginResponse structure adaptée
3. Progress tracking refactorisé
4. Statistics paths corrigés
5. Enrollment status method corrigé
6. Response wrapping standardisé

### Endpoints opérationnels

- **Authentification**: login, register, refresh, logout
- **Formations**: CRUD complet
- **Inscriptions**: Listage, création, statut
- **Progression**: Track, completion, stats
- **Statistiques**: Dashboard, rapports
- **Modules/Leçons**: CRUD complet

### Endpoints à implémenter (version 2)

- `/auth/forgot-password`
- `/users/change-password`
- `/users/profile-image`
- `/uploads/images`, `/uploads/videos`
- `/statistics/revenue`

---

## Sécurité

### Authentification

- **JWT**: Tokens stateless, expirant après 24h
- **Refresh Token**: Renouvellement automatique
- **Password Hashing**: BCrypt avec strength 12
- **Spring Security**: Configuration complète

### Autorisation

- **Role-Based Access Control (RBAC)**:
  - **ADMIN**: Accès complet
  - **INSTRUCTOR**: Gestion formations, voir stats
  - **STUDENT**: Accès lectures, inscriptions

### Sécurité de l'API

- CORS configuré
- HTTPS recommandé en production
- Validation inputs strictes
- Rate limiting 
- Exception handling sécurisé

### Bonnes pratiques

- Ne jamais committer `.env` avec secrets
- Utiliser variables d'environnement
- Rotation régulière JWT secret
- Logs sécurisés (pas de secrets)
- Backups réguliers avec chiffrement

---

## Support

### Documentation

- [Documentation Technique Complète](./DOCUMENTATION_TECHNIQUE.md)

### Commandes utiles

```bash
# Démarrage
docker-compose up -d

# Arrêt
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrage
docker-compose restart

# Inspection
docker-compose ps
docker-compose exec backend /bin/sh
docker-compose exec mysql mysql -u leydymen_user -p
```

### Structure du projet

```
leydymen-academy/
├── backend/                    # Spring Boot API
├── frontend/                   # Angular App
├── docker-compose.yml          # Orchestration
├── DOCUMENTATION_TECHNIQUE.md  # Documentation complète
└── README.md                   # Ce fichier
```

---

## Licence

MIT License - Voir [LICENSE](https://opensource.org/license/mit) pour détails

---
