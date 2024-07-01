const mysql = require("mysql2/promise");

// Créer une connexion à la base de données
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

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

function formatNewTodo(todo) {
  return {
    title: todo.title,
    description: todo.description,
    due_time: todo.due_time,
    user_id: todo.user_id,
    status: todo.status,
  };
}

async function getAllTodos(req, res) {
  try {
    const [todos] = await connection.query(
      "SELECT id, title, description, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(due_time, '%Y-%m-%d %H:%i:%s') as due_time, user_id, status FROM todo"
    );
    const sortedTodos = todos.map(formatTodo);
    console.log(sortedTodos);
    res.status(200).json(sortedTodos);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

async function getTodoById(req, res) {
  try {
    const [todos] = await connection.query(
      "SELECT id, title, description, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(due_time, '%Y-%m-%d %H:%i:%s') as due_time, user_id, status FROM todo WHERE id = ?",
      [req.params.id]
    );

    if (todos.length === 0) {
      console.log("Not found");
      return res.status(404).json({ msg: "Todo not found" });
    }

    const todo = formatTodo(todos[0]);
    console.log(todo);
    res.status(200).json(todo);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

async function createTodo(req, res) {
  try {
    const newTodo = formatNewTodo(req.body);
    if (
      !newTodo.title ||
      !newTodo.description ||
      !newTodo.due_time ||
      !newTodo.user_id ||
      (!newTodo.status &&
        (newTodo.status !== "not started" ||
          newTodo.status !== "todo" ||
          newTodo.status !== "in progress" ||
          newTodo.status !== "done"))
    ) {
      return res.status(400).json({ msg: "Bad parameters" });
    }

    await connection.query("INSERT INTO todo SET ?", newTodo);

    const [insertedTodo] = await connection.query(
      "SELECT id, title, description, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(due_time, '%Y-%m-%d %H:%i:%s') as due_time, user_id, status FROM todo ORDER BY id DESC LIMIT 1"
    );

    const sortedTodos = formatTodo(insertedTodo[0]);
    console.log(sortedTodos);
    res.status(201).json(sortedTodos);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

async function updateTodo(req, res) {
  try {
    const { title, description, due_time, user_id, status } = req.body;
    if (!title || !description || !due_time || !user_id || !status) {
      return res.status(400).json({ msg: "Bad parameters" });
    }

    const validStatuses = ["not started", "todo", "in progress", "done"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Bad parameter" });
    }

    await connection.query(
      "UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?",
      [title, description, due_time, user_id, status, req.params.id]
    );

    const [updatedTodos] = await connection.query(
      "SELECT id, title, description, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at, DATE_FORMAT(due_time, '%Y-%m-%d %H:%i:%s') as due_time, user_id, status FROM todo WHERE id = ?",
      [req.params.id]
    );

    if (updatedTodos.length === 0) {
      return res.status(404).json({ msg: "Not found" });
    }

    const updatedTodo = formatNewTodo(updatedTodos[0]);
    res.status(200).json(updatedTodo);
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Server Error" });
  }
}

async function deleteTodo(req, res) {
  try {
    const [existingTodos] = await connection.query(
      "SELECT * FROM todo WHERE id = ?",
      [req.params.id]
    );

    if (existingTodos.length === 0) {
      console.log("Not found");
      return res.status(404).json({ msg: "Todo not found" });
    }

    const [result] = await connection.query("DELETE FROM todo WHERE id = ?", [
      req.params.id,
    ]);
    console.log("Successfully deleted record number: " + req.params.id);
    res
      .status(200)
      .json({ msg: "Successfully deleted record number: " + req.params.id });
  } catch (err) {
    console.error(err.msg);
    res.status(500).json({ msg: "Internal server error" });
  }
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};
