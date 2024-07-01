const mysql = require("mysql2");
require("dotenv").config();

// Récupère les variables d'environnement du fichier .env
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Gestion des erreurs de connexion - BONUS
db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connexion à la base de données MySQL établie avec succès !");
});

db.on("error", (err) => {
  console.error("Erreur de base de données :", err);
});

module.exports = db;
