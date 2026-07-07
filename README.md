# Site de mariage — Manuela & Jorel

Site web d'invitation (page unique) pour le mariage de **Manuela & Jorel**
le **6 février 2027 à 10h00**, aux **Jardins de René, Yaoundé (Cameroun)**.

Conçu pour être **léger et rapide sur mobile** (3G/4G), fidèle à la maquette Claude Design
et à la palette *Dusty Pink / Coral / Peach / Nude / Champagne*.

> **En local** : `npm start` → serveur Node (`server.js`) qui enregistre les réponses dans `data/rsvps.json`.
> **En ligne sur Vercel** : le site est servi en statique et le RSVP passe par la fonction
> `api/rsvp.js` qui enregistre dans une base **Upstash Redis** (voir section « Déploiement »).

---

## Déploiement sur Vercel

Vercel n'exécute pas de serveur permanent : `server.js` n'y fonctionne donc pas.
Le site utilise à la place la fonction serverless `api/rsvp.js` + une base Redis.

1. **Envoyer le code sur GitHub**
   ```bash
   git add .
   git commit -m "RSVP compatible Vercel (serverless + Upstash Redis)"
   git push
   ```
2. **Créer la base de données** (stockage des réponses) :
   Dashboard Vercel → projet → onglet **Storage** → **Create Database** →
   **Upstash for Redis** (ou **KV**) → région Europe → **Create**, puis **Connect** au projet
   (environnement Production). Les variables `KV_REST_API_URL` / `KV_REST_API_TOKEN`
   (ou `UPSTASH_REDIS_REST_URL` / `_TOKEN`) sont ajoutées automatiquement.
3. **(Optionnel) Consulter les réponses** en attendant le tableau de bord :
   Settings → **Environment Variables** → ajouter `ADMIN_TOKEN` = un mot de passe secret.
   Puis ouvrir `https://VOTRE-SITE.vercel.app/api/rsvp?token=VOTRE_SECRET`.
4. **Réglages du projet** : Framework Preset = **Other**, Output Directory = **public**
   (déjà fixé par `vercel.json`), Root Directory = racine du dépôt.
5. **Redéployer** (Deployments → Redeploy) **après** avoir connecté la base,
   pour que la fonction reçoive les variables d'environnement.

> ⚠️ La vidéo `save-the-date.mp4` (~98 Mo) est trop lourde pour Vercel (bande passante limitée
> à 100 Go/mois sur l'offre gratuite). À compresser (~10–15 Mo) ou à héberger sur un service
> vidéo externe avant la mise en ligne définitive.

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

> Aucune installation n'est nécessaire pour lancer le site : le serveur
> `server.js` n'utilise que Node.js (aucune dépendance). `npm install`
> ne sert qu'aux outils d'optimisation d'images et de QR code (voir plus bas).

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

Chaque réponse envoyée par un invité est enregistrée dans :

```
data/rsvps.json
```

Chaque entrée contient :
- **name** — nom complet
- **phone** — numéro de téléphone
- **attending** — présence : `"oui"` ou `"non"`
- **message** — mot facultatif aux mariés
- **date** — date et heure de la réponse (format ISO, ex. `2027-01-15T14:32:00.000Z`)

Vous pouvez ouvrir ce fichier avec un simple éditeur de texte pour consulter les réponses.

> **Prochaine étape :** un tableau de bord administrateur permettra de visualiser
> et d'exporter ces réponses plus confortablement.

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
├── server.js              Serveur (Node pur) : sert le site + enregistre les RSVP
├── package.json
├── images/                Photos d'origine (sources)
├── data/
│   └── rsvps.json         Réponses des invités (créé au premier envoi)
├── scripts/
│   ├── build-images.js    Optimisation des photos  (npm run images)
│   └── generate-qr.js     Génération du QR code     (npm run qr -- <url>)
└── public/                Ce qui est envoyé au navigateur
    ├── index.html
    ├── css/styles.css
    ├── js/main.js
    └── assets/
        ├── images/        Photos optimisées + poster
        ├── video/         → déposez ici save-the-date.mp4
        └── qr.png         (généré)
```
