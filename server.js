const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const TASKS_FILE = "./src/tasks.json";

// Helper: read tasks
const readTasks = (cb) => {
  fs.readFile(TASKS_FILE, "utf8", (err, data) => {
    if (err) return cb(err, null);
    try {
      cb(null, JSON.parse(data || "[]"));
    } catch (e) {
      cb(e, []);
    }
  });
};

// Helper: write tasks
const writeTasks = (tasks, cb) => {
  fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), cb);
};

// Get current timestamp
const getTimestamp = () => {
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// 🔹 Get all tasks
app.get("/tasks", (req, res) => {
  readTasks((err, tasks) => {
    if (err) return res.status(500).json({ error: "Failed to read tasks" });
    res.json(tasks);
  });
});

// 🔹 Add new task
app.post("/tasks", (req, res) => {
  const newTask = req.body;
  // Add initial history log
  newTask.history = [
    { status: newTask.status, timestamp: getTimestamp() }
  ];

  readTasks((err, tasks) => {
    if (err) return res.status(500).json({ error: "Failed to read tasks" });

    tasks.push(newTask);
    writeTasks(tasks, (err) => {
      if (err) return res.status(500).json({ error: "Failed to save task" });
      res.json(newTask);
    });
  });
});

// 🔹 Update task (status or anything else)
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const updatedTask = req.body;

  readTasks((err, tasks) => {
    if (err) return res.status(500).json({ error: "Failed to read tasks" });

    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return res.status(404).json({ error: "Task not found" });

    const oldTask = tasks[index];

    // If status changed → add log
    if (oldTask.status !== updatedTask.status) {
      updatedTask.history = [
        ...(oldTask.history || []),
        { status: updatedTask.status, timestamp: getTimestamp() }
      ];
    } else {
      updatedTask.history = oldTask.history || [];
    }

    tasks[index] = updatedTask;

    writeTasks(tasks, (err) => {
      if (err) return res.status(500).json({ error: "Failed to update task" });
      res.json(updatedTask);
    });
  });
});

// 🔹 Delete task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  readTasks((err, tasks) => {
    if (err) return res.status(500).json({ error: "Failed to read tasks" });

    const updated = tasks.filter((t) => t.id !== taskId);
    writeTasks(updated, (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete task" });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
