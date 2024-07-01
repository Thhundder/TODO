const mysql = require("mysql2/promise");

// Créer une connexion à la base de données
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    created_at: user.created_at,
    firstname: user.firstname,
    name: user.name,
  };
}

function formatTodo(todo) {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    created_at: todo.created_at,
    due_time: todo.due_time,
    user_id: todo.user_id,
    status: todo.status,
  };
}

async function getUserInfo(req, res) {
  try {
    const userId = req.user.id;
    const [user] = await connection.query(
      "SELECT id, email, password, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, firstname, name FROM user WHERE id = ?",
      [userId]
    );
    if (user.length > 0) {
      res.status(200).json(user[0]);
    } else {
      res.status(404).json({ msg: "User not found" });
    }
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// Récupérer toutes les tâches de l'utilisateur connecté
async function getAllTodos(req, res) {
  try {
    const userId = req.user.id;
    const [todos] = await connection.query(
      "SELECT id, title, description, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, due_time, user_id, status FROM todo WHERE user_id = ?",
      [userId]
    );
    const sortedTodos = todos.map(formatTodo);
    console.log(sortedTodos);
    res.status(200).json(sortedTodos);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// Récupérer un utilisateur par son ID
async function getUserById(req, res) {
  try {
    let query =
      "SELECT id, email, password, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, firstname, name FROM user WHERE id = ?";
    let values = [req.params.id];

    if (req.params.id.includes("@")) {
      query =
        "SELECT id, email, password, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, firstname, name FROM user WHERE email = ?";
      values = [req.params.id];
    }

    const [users] = await connection.query(query, values);

    if (users.length === 0) {
      console.log("Not found");
      return res.status(404).json({ msg: "Not found" });
    }

    const user = formatUser(users[0]);
    console.log(user);
    res.status(200).json(user);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

async function updateUser(req, res) {
  try {
    const { email, password, name, firstname } = req.body;
    if (!email || !password || !name || !firstname) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    await connection.query(
        "UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?",
        [email, password, name, firstname, req.params.id]
    );

    const [updatedUsers] = await connection.query(
      "SELECT id, email, password, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, firstname, name FROM user WHERE id = ?",
      [req.params.id]
    );

    if (updatedUsers.length === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    const updatedUser = formatUser(updatedUsers[0]);
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Server Error" });
  }
}

// Supprimer un utilisateur
async function deleteUser(req, res) {
  try {
    const [result] = await connection.query("DELETE FROM user WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      console.log("Not found");
      return res.status(404).json({ msg: "Not found" });
    }

    console.log("Successfully deleted record number: " + req.params.id);
    res
      .status(200)
      .json({ msg: "Successfully deleted record number: " + req.params.id });
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Server Error" });
  }
}

module.exports = {
  getUserInfo,
  getAllTodos,
  getUserById,
  updateUser,
  deleteUser,
};
