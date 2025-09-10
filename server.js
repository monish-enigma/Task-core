// server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const TASKS_FILE = "./src/tasks.json";

// Helper to read tasks
const readTasks = () => {
  const data = fs.readFileSync(TASKS_FILE);
  return JSON.parse(data);
};

// Helper to write tasks
const writeTasks = (tasks) => {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(readTasks());
});

// Add new task
app.post("/tasks", (req, res) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    task_name: req.body.task_name,
    assigned_to: req.body.assigned_to,
    status: req.body.status || "Not Started",
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.json(newTask);
});

// Update task (status or assigned_to)
app.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return res.status(404).send("Task not found");

  tasks[index] = { ...tasks[index], ...req.body };
  writeTasks(tasks);
  res.json(tasks[index]);
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const taskId = parseInt(req.params.id);
  const newTasks = tasks.filter((t) => t.id !== taskId);
  writeTasks(newTasks);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
