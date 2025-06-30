# 🗺️ Maps Agent IA

Assistant intelligent pour Google Maps avec analyse IA des lieux et itinéraires.

## 🚀 Fonctionnalités

- **🗺️ Carte Google Maps interactive** avec géolocalisation en temps réel
- **🔍 Recherche de lieux** intelligente (restaurants, attractions, commerces)
- **🛣️ Calcul d'itinéraires** avec directions détaillées
- **🤖 Analyse IA** des lieux et itinéraires via OpenAI GPT
- **💬 ChatBot géographique** pour questions contextuelles
- **📊 Statistiques** en temps réel
- **📱 Interface responsive** et moderne

## 🛠️ Technologies

- **Next.js 15** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le design
- **Google Maps API** (Places, Directions, Geocoding)
- **OpenAI API** pour l'analyse IA
- **React Hooks** optimisés

## 📋 Prérequis

- Node.js 18+ 
- Clé API Google Maps avec les services suivants activés :
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API
- Clé API OpenAI

## ⚙️ Installation

1. **Cloner le repository**
```bash
git clone https://github.com/flokiyf/Maps-Ai-Agent.git
cd Maps-Ai-Agent
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
OPENAI_API_KEY=votre_cle_openai
```

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🔧 Configuration Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer les APIs suivantes :
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Créer une clé API dans "Identifiants"
5. Configurer les restrictions d'API et de domaine

## 📁 Structure du projet

```
maps-agent/
├── src/
│   ├── app/
│   │   ├── api/maps/          # APIs pour Google Maps et OpenAI
│   │   ├── globals.css        # Styles globaux
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil
│   ├── components/
│   │   ├── GoogleMap.tsx      # Composant carte interactive
│   │   ├── PlaceCard.tsx      # Affichage des lieux
│   │   ├── RouteCard.tsx      # Affichage des itinéraires
│   │   └── MapsChatBot.tsx    # ChatBot IA
│   └── lib/
│       ├── maps.ts            # Service Google Maps
│       └── openai.ts          # Service OpenAI
├── public/                    # Assets statiques
├── package.json
└── README.md
```

## 🎯 Utilisation

### Recherche de lieux
1. Saisir un terme de recherche (restaurant, hôtel, attraction...)
2. Cliquer sur "Rechercher" ou appuyer sur Entrée
3. Les résultats s'affichent sur la carte avec des marqueurs
4. Cliquer sur un lieu pour voir les détails et l'analyse IA

### Calcul d'itinéraires
1. Saisir le point de départ et la destination
2. Cliquer sur "Itinéraire"
3. L'itinéraire s'affiche sur la carte
4. Voir les détails dans le panneau latéral

### Chat IA
1. Cliquer sur l'icône de chat flottant
2. Poser des questions sur les lieux ou itinéraires
3. Recevoir des réponses contextuelles basées sur votre position

## 🔍 APIs utilisées

### Google Maps APIs
- **Places API** : Recherche de lieux et détails
- **Directions API** : Calcul d'itinéraires
- **Geocoding API** : Conversion adresses ↔ coordonnées
- **Maps JavaScript API** : Affichage de la carte

### OpenAI API
- **GPT-3.5-turbo** : Analyse des lieux et itinéraires
- **Analyse contextuelle** : Recommandations personnalisées
- **Chat géographique** : Questions/réponses sur les lieux

## 🚨 Gestion d'erreurs

L'application inclut une gestion d'erreurs robuste :
- Validation des coordonnées GPS
- Fallback sur Paris en cas d'erreur de géolocalisation  
- Messages d'erreur informatifs pour l'utilisateur
- Retry automatique pour les requêtes API
- Interface de débogage intégrée

## 🎨 Interface utilisateur

- **Design moderne** avec Tailwind CSS
- **Responsive** : fonctionne sur mobile, tablette et desktop
- **Indicateurs visuels** : états de chargement, erreurs, succès
- **Accessibilité** : navigation au clavier, contrastes respectés
- **Performance** : composants optimisés avec React.memo et useCallback

## 📈 Performances

- **Lazy loading** des composants
- **Memoization** des fonctions et composants
- **Debouncing** des requêtes de recherche
- **Cache** des résultats API
- **Bundle splitting** automatique avec Next.js

## 🔒 Sécurité

- Variables d'environnement pour les clés API
- Validation côté client et serveur
- Restrictions d'API configurées
- Pas d'exposition des clés sensibles côté client

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Maps Agent IA** - Assistant intelligent pour Google Maps

---

⭐ N'hésitez pas à mettre une étoile si ce projet vous plaît !
