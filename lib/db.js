/* =========================================================
   Base de donnees des reponses RSVP — MongoDB (Atlas ou autre)
   Base EXTERNE accessible par une chaine de connexion (MONGODB_URI).
   -> l'application tourne sur n'importe quel hebergeur Node
      (Render, Railway, VPS, LWS Node.js...) sans disque persistant.

   Variables d'environnement :
     MONGODB_URI  = chaine de connexion Atlas (obligatoire)
     MONGODB_DB   = nom de la base (optionnel, defaut "mariage")
   ========================================================= */
'use strict';

const { MongoClient } = require('mongodb');

const DB_NAME = process.env.MONGODB_DB || 'mariage';
const COLLECTION = 'rsvps';

let client = null;
let collPromise = null;

// Connexion "paresseuse" : etablie au premier appel, puis reutilisee.
function getColl() {
  if (collPromise) return collPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const e = new Error('db_not_configured');
    e.code = 'db_not_configured';
    return Promise.reject(e);
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  collPromise = client.connect()
    .then(function () {
      const coll = client.db(DB_NAME).collection(COLLECTION);
      // index pour trier par date et garantir l'unicite de notre "id"
      coll.createIndex({ date: 1 }).catch(function () {});
      coll.createIndex({ id: 1 }, { unique: true }).catch(function () {});
      console.log('[db] Connecte a MongoDB (' + DB_NAME + '/' + COLLECTION + ')');
      return coll;
    })
    .catch(function (err) {
      collPromise = null; // permet une nouvelle tentative au prochain appel
      throw err;
    });
  return collPromise;
}

module.exports = {
  add: async function (entry) {
    const coll = await getColl();
    await coll.insertOne(Object.assign({}, entry));
    return entry;
  },
  // Renvoie les reponses (sans le _id interne de Mongo), triees par date croissante.
  all: async function () {
    const coll = await getColl();
    return coll.find({}, { projection: { _id: 0 } }).sort({ date: 1 }).toArray();
  },
  remove: async function (id) {
    const coll = await getColl();
    const r = await coll.deleteOne({ id: id });
    return r.deletedCount;
  },
  count: async function () {
    const coll = await getColl();
    return coll.countDocuments();
  },
};
