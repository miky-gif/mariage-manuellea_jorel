/* =========================================================
   Base de donnees des reponses RSVP — MySQL / MariaDB
   Base LOCALE de l'hebergeur (o2switch, cPanel...) : connexion en
   localhost, donc AUCUNE connexion sortante requise (contrairement a
   MongoDB Atlas, bloque par les hebergeurs mutualises).

   Variables d'environnement :
     DB_HOST      = hote (defaut "localhost")
     DB_USER      = utilisateur MySQL           (obligatoire)
     DB_PASSWORD  = mot de passe MySQL
     DB_NAME      = nom de la base               (obligatoire)
   ========================================================= */
'use strict';

const mysql = require('mysql2/promise');

const TABLE = 'rsvps';
let pool = null;
let ready = null;

function getPool() {
  if (pool) return pool;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;
  if (!user || !database) {
    const e = new Error('db_not_configured');
    e.code = 'db_not_configured';
    throw e;
  }
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: user,
    password: process.env.DB_PASSWORD || '',
    database: database,
    waitForConnections: true,
    connectionLimit: 5,
    charset: 'utf8mb4',
  });
  return pool;
}

// Cree la table au premier appel (une seule fois).
function init() {
  if (ready) return ready;
  ready = getPool().query(
    'CREATE TABLE IF NOT EXISTS ' + TABLE + ' (' +
    '  id VARCHAR(32) NOT NULL PRIMARY KEY,' +
    '  name VARCHAR(160) NOT NULL,' +
    '  phone VARCHAR(60) NOT NULL,' +
    '  attending VARCHAR(10) NOT NULL,' +   // "oui" ou "non"
    '  message TEXT,' +
    '  date VARCHAR(40) NOT NULL' +          // ISO 8601
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  ).catch(function (err) { ready = null; throw err; });
  return ready;
}

module.exports = {
  add: async function (e) {
    await init();
    await getPool().query(
      'INSERT INTO ' + TABLE + ' (id, name, phone, attending, message, date) VALUES (?,?,?,?,?,?)',
      [e.id, e.name, e.phone, e.attending, e.message || '', e.date]
    );
    return e;
  },
  all: async function () {
    await init();
    const [rows] = await getPool().query(
      'SELECT id, name, phone, attending, message, date FROM ' + TABLE + ' ORDER BY date ASC'
    );
    return rows;
  },
  remove: async function (id) {
    await init();
    const [r] = await getPool().query('DELETE FROM ' + TABLE + ' WHERE id = ?', [id]);
    return r.affectedRows;
  },
  count: async function () {
    await init();
    const [rows] = await getPool().query('SELECT COUNT(*) AS n FROM ' + TABLE);
    return rows[0].n;
  },
};
