# LEYDYMEN Academy - Plateforme de Gestion de Formations

Plateforme web complète de gestion de LEYDYMEN Academy, un centre de formation spécialisé dans les bootcamps en informatique.

## Vue d'ensemble

LEYDYMEN Academy est une application web moderne permettant de :
- Gérer les formations et bootcamps
- Gérer les étudiants et leurs inscriptions
- Suivre la progression des apprenants
- Consulter des statistiques et tableaux de bord
- Gérer le contenu pédagogique (modules et leçons)
- Générer des certificats de formation

## Architecture

Le projet est organisé en deux parties principales :

### 1. Backend (Spring Boot)
- leydymen-backend/ - API REST en Spring Boot
- Base de données : MySQL
- Authentification : JWT + Spring Security
- Documentation : Swagger/OpenAPI

### 2. Frontend (Angular)
- leydymen-frontend/ - Application Angular
- Design System : Inspiré d'OpenedX
- Responsive Design : Mobile, Tablet, Desktop
- Accessibility : WCAG 2.1 Level AA

## Documentation

- Specification Backend - Détail complet de l'API REST, entités, endpoints
- Specification Frontend - Components, design system, pages, services
- Projet Final - Contexte du projet et livrables

## Démarrage rapide

### Prérequis

Backend :
- Java 17+
- Maven 3.8+
- MySQL 8.0+

Frontend :
- Node.js 18+
- npm ou yarn
- Angular CLI 18+

### Installation Backend

```bash
cd leydymen-backend

# Installer les dépendances
mvn clean install

# Configurer la base de données
# Mettre à jour src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/leydymen_db
spring.datasource.username=root
spring.datasource.password=your_password

# Lancer l'application
mvn spring-boot:run

# L'API sera disponible sur http://localhost:8080
# Swagger UI : http://localhost:8080/swagger-ui.html
```

### Installation Frontend

```bash
cd leydymen-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve

# L'application sera disponible sur http://localhost:4200
```

## Structure du Projet

```
leydymen-academy/
├── leydymen-backend/              # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/leydymen/
│   │   │   │   ├── controller/    # Contrôleurs REST
│   │   │   │   ├── service/       # Logique métier
│   │   │   │   ├── repository/    # Accès données
│   │   │   │   ├── entity/        # Entités JPA
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── security/      # Configuration sécurité
│   │   │   │   └── config/        # Configurations
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/
│   │   └── test/
│   └── pom.xml
│
├── leydymen-frontend/             # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Services, guards, interceptors
│   │   │   ├── shared/           # Components, pipes, directives
│   │   │   ├── layout/           # Header, sidebar, footer
│   │   │   ├── features/         # Modules métier
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── formations/
│   │   │   │   ├── students/
│   │   │   │   ├── enrollments/
│   │   │   │   ├── my-courses/
│   │   │   │   ├── profile/
│   │   │   │   └── admin/
│   │   │   └── assets/           # Images, styles, fonts
│   │   └── environments/
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── Specification_Backend_SpringBoot.txt
├── Specification_Frontend_Angular.txt
├── projetFinal.md
└── README.md
```

## API Endpoints

### Authentification
```
POST   /api/auth/register         - Créer un compte
POST   /api/auth/login            - Se connecter
POST   /api/auth/refresh          - Rafraîchir le token
POST   /api/auth/logout           - Se déconnecter
```

### Formations
```
GET    /api/formations            - Récupérer toutes les formations
GET    /api/formations/{id}       - Détail d'une formation
POST   /api/formations            - Créer une formation
PUT    /api/formations/{id}       - Mettre à jour une formation
DELETE /api/formations/{id}       - Supprimer une formation
GET    /api/formations/search     - Rechercher des formations
```

### Utilisateurs
```
GET    /api/users                 - Récupérer tous les utilisateurs
GET    /api/users/{id}            - Détail d'un utilisateur
PUT    /api/users/{id}            - Mettre à jour un utilisateur
DELETE /api/users/{id}            - Supprimer un utilisateur
```

### Inscriptions
```
GET    /api/enrollments           - Mes inscriptions
POST   /api/enrollments           - S'inscrire à une formation
GET    /api/enrollments/{id}      - Détail d'une inscription
DELETE /api/enrollments/{id}      - Annuler une inscription
GET    /api/enrollments/{id}/progress - Progression
```

### Statistiques
```
GET    /api/statistics/dashboard  - Statistiques globales
GET    /api/statistics/formations/{id} - Stats d'une formation
GET    /api/statistics/students/{id}   - Stats d'un étudiant
```

Note : Tous les endpoints utilisent le header X-API-Version: 1.0 pour la versioning

Consultez Specification_Backend_SpringBoot.txt pour la liste complète des endpoints.

## Design System

L'interface utilise un design system inspiré d'OpenedX avec :

### Couleurs principales
- Primary : #1F72D1 (Bleu)
- Success : #00A86B (Vert)
- Warning : #FFA600 (Orange)
- Error : #D32F2F (Rouge)
- Neutral : Grises (#121212 à #F5F5F5)

### Typographie
- Font : Inter, Segoe UI, sans-serif
- Headings : H1-H6 avec poids 600
- Body : 14px régulier

### Composants réutilisables
- Button (variants: primary, secondary, tertiary, danger)
- Card, Input, Select, Table
- Modal, Badge, Progress, Toast
- Skeleton Loaders

Voir Specification_Frontend_Angular.txt pour plus de détails.

## Sécurité

- Authentification : JWT (JSON Web Tokens)
- Hashing : BCrypt (strength 12)
- CORS : Configuré pour Angular frontend
- HTTPS : Obligatoire en production
- RBAC : 3 rôles (ADMIN, INSTRUCTOR, STUDENT)

## Fonctionnalités principales

### Pour les ÉTUDIANTS
- Consulter les formations disponibles
- S'inscrire à des formations
- Suivre la progression de ses cours
- Accéder au lecteur de cours (course player)
- Voir son profil et statistiques

### Pour les INSTRUCTEURS
- Créer et gérer ses formations
- Organiser le contenu (modules, leçons)
- Suivre les inscriptions
- Voir les statistiques de ses formations
- Gérer les grades et certificats

### Pour les ADMINS
- Gérer tous les utilisateurs
- Gérer toutes les formations
- Accès complet aux statistiques
- Gestion des rôles et permissions

## Tests

### Backend
```bash
cd leydymen-backend
mvn test                    # Lancer tous les tests
mvn test -Dtest=UserServiceTest  # Test spécifique
```

### Frontend
```bash
cd leydymen-frontend
ng test                     # Lancer les tests
ng test --code-coverage    # Avec coverage
```

Objectif de couverture : 80%+ pour les tests unitaires

## Performance

### Backend
- Pagination par défaut : 10 éléments
- Pagination max : 100 éléments
- Cache des données statiques
- Lazy loading des relations

### Frontend
- Bundle size cible : < 500KB (main.js)
- Lazy loading des modules
- Images optimisées (WebP)
- Change detection : OnPush strategy

## Déploiement

### Backend
```bash
# Build de production
mvn clean package -DskipTests

# JAR généré dans target/
java -jar target/leydymen-backend.jar
```

### Frontend
```bash
# Build de production
ng build --prod

# Servir depuis dist/leydymen-frontend/
# Héberger sur Nginx, Apache, AWS S3, etc.
```

## Rôles et Responsabilités

### Groupe de développement
- 2 développeurs backend (Spring Boot)
- 2 développeurs frontend (Angular)

### Chef de projet
- Coordination entre les deux groupes
- Respect des deadlines

### QA
- Tests fonctionnels
- Tests de performance
- Tests d'accessibilité

## Checklist avant livraison

- Code source complet sur GitHub
- Documentation API complète (Swagger)
- Tous les tests passent (80%+ coverage)
- README actualisé
- Rapport technique (20-30 pages)
- Présentation PowerPoint
- Déploiement testé (dev et prod)
- Accessibilité validée (WCAG AA)

## Contribution

1. Cloner le repository
2. Créer une branche (git checkout -b feature/xyz)
3. Faire les modifications
4. Commiter (git commit -m 'Add feature xyz')
5. Pusher (git push origin feature/xyz)
6. Créer une Pull Request

## Support

Pour toute question ou problème :
1. Consulter la documentation (fichiers .txt)
2. Vérifier les issues GitHub
3. Contacter le chef de projet
4. Vérifier Swagger UI (backend)

## Licence

Propriété de LEYDYMEN Academy - 2026

## Ressources utiles

- Spring Boot : https://spring.io/projects/spring-boot
- Angular : https://angular.io
- MySQL : https://www.mysql.com/
- JWT : https://jwt.io
- OpenedX : https://openedx.org
- WCAG 2.1 : https://www.w3.org/WAI/WCAG21/quickref/

---

Dernière mise à jour : Juillet 2026

Version du projet : 1.0

Status : En développement
