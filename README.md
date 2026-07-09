# Site de mariage — Manuela & Jorel

Site web d'invitation (page unique) pour le mariage de **Manuela & Jorel**
le **6 février 2027 à 10h00**, aux **Jardins de René, Yaoundé (Cameroun)**.

Conçu pour être **léger et rapide sur mobile** (3G/4G), fidèle à la maquette Claude Design
et à la palette *Dusty Pink / Coral / Peach / Nude / Champagne*.

> **Architecture** : une application Node (`dev-server.js`) qui sert le site **et** l'API RSVP,
> avec une base **MongoDB** (externe) via la variable `MONGODB_URI`. La base étant hébergée
> par MongoDB Atlas, l'application tourne sur **n'importe quel hébergeur Node**
> (LWS Node.js, Render, Railway, VPS…), sans dépendre du disque de l'hébergeur.

---

## Base de données : MongoDB Atlas (gratuit)

### 1. Créer la base (une seule fois)
1. Créez un compte sur **https://www.mongodb.com/atlas** → créez un **cluster gratuit (M0)**.
2. **Database Access** → *Add New Database User* → notez l'utilisateur + mot de passe.
3. **Network Access** → *Add IP Address* → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Database → Connect → Drivers** → copiez la **chaîne de connexion** (`mongodb+srv://…`)
   et remplacez `<password>` par le mot de passe de l'étape 2.

### 2. Configurer l'application
Copiez le fichier **`.env.example`** en **`.env`** et remplissez :
```
MONGODB_URI=mongodb+srv://UTILISATEUR:MOTDEPASSE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
ADMIN_TOKEN=un-mot-de-passe-secret     # protège le tableau de bord /admin.html
```
> En local, `.env` suffit. En ligne, ces mêmes valeurs se mettent dans les **variables
> d'environnement** de l'hébergeur (pas de fichier `.env` en production).

### Tableau de bord
- **En local** : `npm start`, puis **http://localhost:3000/admin.html** (mot de passe = `ADMIN_TOKEN`, ou `admin` si non défini).
- **En ligne** : **`https://VOTRE-SITE/admin.html`**.

Il affiche : présents / absents, la liste complète (nom, téléphone, présence, message, date
à l'heure de Yaoundé), la **recherche**, les **filtres**, l'**export PDF** et la **suppression**.

---

## Mise en ligne (hébergeur Node)

Comme la base est chez MongoDB Atlas, **n'importe quel hébergeur qui exécute Node.js** convient
(LWS « Hébergement Node.js », Render, Railway, un VPS…), **sans disque persistant requis**.

Étapes types :
1. Envoyer le code sur GitHub (`git add -A && git commit -m "..." && git push`).
2. Sur l'hébergeur, créer une **application Node** reliée au dépôt :
   - Installation : `npm install` · Démarrage : `npm start`
3. Définir les **variables d'environnement** : `MONGODB_URI` et `ADMIN_TOKEN`
   (le `PORT` est fourni automatiquement par l'hébergeur).

> Le formulaire enregistre pour de vrai (`DEMO_MODE = false` dans `public/js/main.js`).
> Pour une simple démo visuelle sans base, repasser `DEMO_MODE = true`.

> ⚠️ La vidéo `save-the-date.mp4` est déjà compressée (~18 Mo, 720p).

---

## 1. Lancer le site (pour tester)

Il faut avoir **Node.js** installé (version 18 ou plus récente).

Dans un terminal, placez-vous dans le dossier du projet puis :

```bash
npm start
```

Ouvrez ensuite votre navigateur sur :

> **http://localhost:3000**

Pour l'arrêter : `Ctrl + C` dans le terminal.

### Tester depuis un téléphone (même Wi-Fi)
1. Trouvez l'adresse IP locale de l'ordinateur
   (Windows : tapez `ipconfig` et repérez « Adresse IPv4 », ex. `192.168.1.20`).
2. Sur le téléphone, ouvrez `http://192.168.1.20:3000`.

> Avant le premier lancement : `npm install` (installe le pilote MongoDB), puis créez
> votre fichier `.env` (voir « Base de données : MongoDB Atlas » ci-dessus).

---

## 2. Où déposer la vidéo « Save the Date »

Déposez votre vidéo ici, avec **exactement ce nom** :

```
public/assets/video/save-the-date.mp4
```

Elle se lancera automatiquement en fond du hero, **en boucle et sans son**.
Si la vidéo est absente ou ne charge pas (mobile lent), une **image de secours**
s'affiche automatiquement à la place (`public/assets/images/poster.jpg`).

**Conseils pour un chargement rapide au Cameroun :**
- Format **MP4 (H.264)**, résolution **720p** suffisante.
- Vidéo **courte** (10–20 s en boucle) et **compressée** : visez **moins de 5–8 Mo**.
- Pas besoin de piste audio (le son est coupé de toute façon).

Pour changer l'image de secours, remplacez `public/assets/images/poster.jpg`
(ou changez la photo source dans `scripts/build-images.js` puis relancez `npm run images`).

---

## 3. Où déposer les photos

Les photos d'origine sont dans le dossier **`images/`**.
Les versions **optimisées** (légères) utilisées par le site sont dans
**`public/assets/images/`**.

### Méthode simple (recommandée)
1. Ajoutez / remplacez vos photos dans le dossier `images/`.
2. Ouvrez `scripts/build-images.js` et vérifiez la liste `MAP` : elle indique
   quelle photo va à quel emplacement (hero, « Notre histoire », galerie).
   Il suffit de changer le **nom du fichier source** à gauche.
3. Régénérez les versions optimisées :

```bash
npm run images
```

Rôles des images :
| Emplacement                    | Fichier généré                         |
|--------------------------------|----------------------------------------|
| Image de secours du hero       | `poster.jpg`                           |
| « Notre histoire » — rencontre | `story-1.jpg`                          |
| « Notre histoire » — la demande| `story-2.jpg`                          |
| Galerie (7 photos)             | `gallery-1.jpg` … `gallery-7.jpg`      |

### Méthode directe
Vous pouvez aussi remplacer directement les fichiers `.jpg` dans
`public/assets/images/` (gardez les mêmes noms). Pensez à utiliser des images
déjà légères (moins de ~200 Ko chacune).

---

## 4. Les réponses au formulaire (RSVP)

Chaque réponse est enregistrée dans **MongoDB** (collection `rsvps`) et contient :
- **name** — nom complet · **phone** — téléphone · **attending** — `"oui"`/`"non"`
- **message** — mot facultatif · **date** — date/heure (ISO)

Pour les consulter : ouvrez le **tableau de bord** (`/admin.html`) — voir la section
« Base de données & tableau de bord » ci-dessus (recherche, filtres, export PDF, suppression).

---

## 5. Le QR code de partage (optionnel)

Une fois le site mis en ligne (avec une adresse définitive), générez le QR code :

```bash
npm run qr -- https://adresse-du-site.com
```

Cela crée `public/assets/qr.png`, qui s'affiche automatiquement dans le pied de page.
Tant qu'il n'existe pas, un encadré « QR code — à générer » s'affiche à la place.

---

## 6. Modifier les textes / la date

- **Textes, programme, histoire** : dans `public/index.html`.
- **Date du compte à rebours** : dans `public/js/main.js`, ligne
  `var TARGET = new Date('2027-02-06T10:00:00+01:00')`
  (`+01:00` = heure de Yaoundé).
- **Couleurs** : variables en haut de `public/css/styles.css`.

---

## Structure du projet

```
mariage manuellea_jorel/
├── dev-server.js          Application Node : sert le site + API RSVP
├── lib/
│   └── db.js              Accès à la base MongoDB (add / all / remove)
├── .env.example           Modèle de configuration (à copier en .env)
├── package.json
├── images/                Photos d'origine (sources)
├── scripts/
│   ├── build-images.js    Optimisation des photos  (npm run images)
│   └── generate-qr.js     Génération du QR code     (npm run qr -- <url>)
└── public/                Ce qui est envoyé au navigateur
    ├── index.html
    ├── admin.html         Tableau de bord admin
    ├── css/styles.css
    ├── js/main.js
    └── assets/
        ├── images/        Photos optimisées + poster
        ├── video/         → déposez ici save-the-date.mp4
        └── qr.png         (généré)
```
