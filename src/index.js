const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Importer les fichiers de routes
const authRoutes = require("./routes/auth/auth");
const userRoutes = require("./routes/user/user");
const todoRoutes = require("./routes/todos/todos");

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Utiliser les routes sans préfixe
app.use(authRoutes);
app.use(userRoutes);
app.use(todoRoutes);

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).send("Route not found");
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
