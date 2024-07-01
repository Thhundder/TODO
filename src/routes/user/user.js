const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middleware/auth");
const {
  getUserInfo,
  getAllTodos,
  getUserById,
  updateUser,
  deleteUser,
} = require("./user.query");

// Routes accessibles sans token JWT
router.get("/user", authenticateToken, getUserInfo);
router.get("/user/todos", authenticateToken, getAllTodos);
router.get("/users/:id", authenticateToken, getUserById);
router.put("/users/:id", authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, deleteUser);

module.exports = router;
