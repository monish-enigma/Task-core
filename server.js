const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { log } = require("console");

const app = express();
app.use(cors());
app.use(express.json());

const tasksFile = path.join(__dirname+"/src/", "tasks.json");

// Helper: read tasks
const readTasks = () => {
  const data = fs.readFileSync(tasksFile);
  return JSON.parse(data);
};

// Helper: write tasks
const writeTasks = (tasks) => {
  fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
};

// --- Tasks CRUD ---

// GET all tasks
app.get("/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// POST new task
app.post("/tasks", (req, res) => {
  const tasks = readTasks();
  const newTask = { ...req.body, subtasks: req.body.subtasks || [] };
  tasks.push(newTask);
  writeTasks(tasks);
  res.json(newTask);
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  // preserve subtasks if not in body
  tasks[idx] = { ...tasks[idx], ...req.body, subtasks: req.body.subtasks || tasks[idx].subtasks };
  writeTasks(tasks);
  res.json(tasks[idx]);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  let tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  tasks.splice(idx, 1);
  writeTasks(tasks);
  res.json({ success: true });
});

// --- Subtasks CRUD ---

// POST new subtask
app.post("/tasks/:id/subtasks", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const newSubtask = { ...req.body, id: Date.now(), history: [] };
  task.subtasks = task.subtasks || [];
  task.subtasks.push(newSubtask);

  writeTasks(tasks);
  res.json(newSubtask);
});

// PUT update subtask
app.put("/tasks/:id/subtasks/:subtaskId", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const idx = task.subtasks.findIndex((st) => st.id == req.params.subtaskId);
  if (idx === -1) return res.status(404).json({ error: "Subtask not found" });

  task.subtasks[idx] = { ...task.subtasks[idx], ...req.body };
  writeTasks(tasks);
  res.json(task.subtasks[idx]);
});

// DELETE subtask
app.delete("/tasks/:id/subtasks/:subtaskId", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const idx = task.subtasks.findIndex((st) => st.id == req.params.subtaskId);
  if (idx === -1) return res.status(404).json({ error: "Subtask not found" });

  task.subtasks.splice(idx, 1);
  writeTasks(tasks);
  res.json({ success: true });
});
app.post("/generate-subtasks", async (req, res) => {
  try {
    const { taskName } = req.body;
    if (!taskName) {
      return res.status(400).json({ error: "taskName is required" });
    }

    const GEMINI_API_KEY = "AIzaSyB311vGHFfcX5RkYg1uR4EWip1lhNUi8Zs";
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY env variable" });
    }

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `Break down this task: ${taskName} into 3-5 subtasks. Return as a JSON array and do not include any extra texts or punctuation. Example format ["subtask1", "subtask2"]`,
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
      }
    );

    // Gemini response format → extract text
    const modelReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let subtasks;
    try {
      subtasks = JSON.parse(modelReply);
    } catch (err) {
      // fallback: return as plain text if JSON parse fails
      subtasks = modelReply;
    }
    console.log("taskName:", taskName);
    
    console.log("Generated subtasks:", subtasks);
    const cleanedReply = modelReply.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1');
  subtasks = JSON.parse(cleanedReply);
    res.json({ taskName, subtasks });

  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate subtasks", details: err.message });
  }
});

// start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
