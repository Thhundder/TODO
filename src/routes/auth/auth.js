const express = require("express");
const router = express.Router();
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

// Créer une connexion à la base de données
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function registerUser(req, res) {
  const { email, password, name, firstname } = req.body;
  if (!email || !password || !name || !firstname) {
    return res.status(409).json({ msg: "Not found" });
  }

  try {
    const [users] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (users.length > 0) {
      console.log(users);
      return res.status(409).json({ msg: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await connection.query(
      "INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, name, firstname]
    );

    const [newUser] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    const token = jwt.sign({ id: newUser[0].id }, process.env.SECRET);
    console.log({ token });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Bad parameter");
    return res.status(400).json({ msg: "Bad parameter" });
  }

  try {
    const [users] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      console.log("Invalid Credentials");
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) {
      console.log("Invalid Credentials");
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: users[0].id }, process.env.SECRET);
    console.log({ token: token });
    res.status(200).json({ token: token });
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
