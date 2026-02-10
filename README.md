# SUNUPARKING 🚗

Système de gestion de parc automobile avec réservation de véhicules, inspiré de Dakar Mobilité.

## 🎨 Charte Graphique

- **Vert Dakar Mobilité**: `#00843D`
- **Jaune Dakar Mobilité**: `#F2C300`
- **Blanc propre**: `#FFFFFF`
- **Gris clair premium**: `#F7F7F7`
- **Gris sombre**: `#1A1A1A`

## 🚀 Technologies

- **Frontend**: Next.js 14, React 18, TailwindCSS 3
- **Backend**: Next.js API Routes
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Calendrier**: FullCalendar 6
- **Graphiques**: Recharts
- **Icônes**: Lucide React

## 📋 Fonctionnalités

### 🔐 Authentification
- Inscription / Connexion
- Gestion des rôles (admin / user)
- Protection des routes
- Déconnexion sécurisée

### 📊 Dashboard Admin
- Statistiques en temps réel
- Nombre total de véhicules
- Nombre total de réservations
- Véhicules disponibles
- Graphique des réservations par mois
- Liste des réservations récentes

### 🚗 Gestion des Véhicules
- Liste complète des véhicules
- Ajouter un véhicule
- Modifier un véhicule
- Supprimer un véhicule
- Upload d'images (Supabase Storage)
- Filtres et recherche
- Statuts: Disponible, Réservé, En panne, Hors service

### 📅 Système de Réservations
- Calendrier interactif (FullCalendar)
- Vue mois / semaine / jour
- Créer une réservation
- Modifier une réservation
- Annuler une réservation
- Drag & drop pour déplacer les réservations
- Resize pour modifier la durée
- Détection de conflits (double-réservation)
- Statuts: En attente, Confirmée, Annulée

## 🛠️ Installation

### 1. Cloner ou décompresser le projet

```bash
cd SUNUPARKING
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

#### A. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les clés API dans Settings > API

#### B. Créer le fichier .env.local

```bash
cp .env.example .env.local
```

Puis modifier `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

#### C. Exécuter le schéma SQL

1. Aller dans l'éditeur SQL de Supabase
2. Copier tout le contenu de `schema.sql`
3. Exécuter le script

#### D. Créer le bucket de storage

1. Aller dans Storage
2. Créer un nouveau bucket nommé `images`
3. Le rendre **public**
4. Ajouter les policies (voir commentaires dans schema.sql)

### 4. Lancer le projet

```bash
npm run dev
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
SUNUPARKING/
├── app/
│   ├── layout.jsx              # Layout principal
│   ├── page.jsx                # Page d'accueil
│   ├── globals.css             # Styles globaux
│   ├── auth/
│   │   ├── login/page.jsx      # Page de connexion
│   │   └── register/page.jsx   # Page d'inscription
│   ├── dashboard/
│   │   └── page.jsx            # Dashboard admin
│   ├── vehicles/
│   │   ├── page.jsx            # Liste des véhicules
│   │   ├── new/page.jsx        # Nouveau véhicule
│   │   └── [id]/page.jsx       # Modifier véhicule
│   └── reservations/
│       └── page.jsx            # Calendrier des réservations
├── components/
│   ├── Navbar.jsx              # Barre de navigation
│   ├── VehicleCard.jsx         # Carte véhicule
│   ├── Calendar.jsx            # Calendrier FullCalendar
│   └── ReservationForm.jsx     # Formulaire de réservation
├── lib/
│   ├── supabaseClient.js       # Client Supabase
│   └── auth.js                 # Fonctions d'authentification
├── public/                     # Assets statiques
├── schema.sql                  # Schéma de base de données
├── tailwind.config.js          # Config Tailwind
├── next.config.js              # Config Next.js
├── package.json                # Dépendances
└── README.md                   # Documentation
```

## 🗄️ Base de Données

### Tables

#### `profiles`
- Extension de `auth.users` de Supabase
- Stocke le nom complet et le rôle (admin/user)

#### `vehicles`
- `id`: UUID (PK)
- `name`: Nom du véhicule
- `matricule`: Numéro d'immatriculation (unique)
- `type`: Type de véhicule (Berline, SUV, etc.)
- `status`: Statut (Disponible, Réservé, En panne, Hors service)
- `image_url`: URL de l'image
- `created_at`, `updated_at`: Timestamps

#### `reservations`
- `id`: UUID (PK)
- `vehicle_id`: UUID (FK → vehicles)
- `user_id`: UUID (FK → auth.users)
- `start_at`: Date/heure de début
- `end_at`: Date/heure de fin
- `description`: Description de la réservation
- `status`: Statut (En attente, Confirmée, Annulée)
- `created_at`, `updated_at`: Timestamps

### Sécurité (RLS)

Les Row Level Security policies sont configurées pour:
- Les utilisateurs peuvent voir tous les véhicules et réservations
- Les utilisateurs peuvent créer leurs propres réservations
- Les utilisateurs peuvent modifier/supprimer leurs propres réservations
- Seuls les admins peuvent gérer les véhicules

## 👤 Créer un Compte Admin

Par défaut, les nouveaux comptes ont le rôle `user`. Pour créer un admin:

1. S'inscrire via l'interface
2. Aller dans la table `profiles` de Supabase
3. Changer le champ `role` de `user` à `admin`

Ou exécuter ce SQL:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'USER_UUID';
```

## 🎯 Utilisation

### 1. Créer un compte
- Aller sur la page d'accueil
- Cliquer sur "S'inscrire"
- Remplir le formulaire

### 2. Ajouter des véhicules (Admin)
- Se connecter avec un compte admin
- Aller dans "Véhicules"
- Cliquer sur "Ajouter un véhicule"
- Remplir les informations
- (Optionnel) Uploader une image

### 3. Créer une réservation
- Aller dans "Réservations"
- Cliquer sur une date dans le calendrier OU cliquer sur "Nouvelle réservation"
- Sélectionner un véhicule disponible
- Définir les dates de début et fin
- Ajouter une description
- Valider

### 4. Gérer les réservations
- Cliquer sur une réservation dans le calendrier pour voir les détails
- Modifier ou supprimer une réservation
- Drag & drop pour déplacer une réservation
- Resize pour modifier la durée

## 🔧 Configuration Avancée

### Modifier les couleurs

Éditer `tailwind.config.js`:

```js
colors: {
  'dakar-green': '#00843D',
  'dakar-yellow': '#F2C300',
  // ...
}
```

### Ajouter des types de véhicules

Éditer les composants `app/vehicles/new/page.jsx` et `app/vehicles/[id]/page.jsx`:

```jsx
<option value="Nouveau Type">Nouveau Type</option>
```

### Personnaliser le calendrier

Éditer `components/Calendar.jsx` pour modifier les options de FullCalendar.

## 📦 Build pour Production

```bash
npm run build
npm start
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Pousser le code sur GitHub
2. Importer le projet sur [Vercel](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer

### Autres plateformes

Le projet peut être déployé sur toute plateforme supportant Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🐛 Résolution de Problèmes

### Erreur de connexion Supabase
- Vérifier les variables d'environnement dans `.env.local`
- Vérifier que le projet Supabase est actif

### Images ne s'affichent pas
- Vérifier que le bucket `images` existe
- Vérifier que le bucket est public
- Vérifier les policies du bucket

### Réservations ne se créent pas
- Vérifier les RLS policies dans Supabase
- Vérifier que l'utilisateur est authentifié
- Vérifier les logs du navigateur

## 📝 Licence

MIT License - Libre d'utilisation pour tout projet.

## 👨‍💻 Auteur

Projet SUNUPARKING - Inspiré de Dakar Mobilité

---

**Bon développement ! 🚀**
