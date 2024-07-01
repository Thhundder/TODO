const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/auth");
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("./todos.query");

// Toutes les routes nécessitant un token JWT
router.get("/todos", authenticateToken, getAllTodos);
router.get("/todos/:id", authenticateToken, getTodoById);
router.post("/todos", authenticateToken, createTodo);
router.put("/todos/:id", authenticateToken, updateTodo);
router.delete("/todos/:id", authenticateToken, deleteTodo);

module.exports = router;
