# 🚀 Task Automation with React, Node.js, and n8n + Gemini

This project is a **task management demo** that integrates:
- **React (Frontend)** – Neon button popup to create tasks and subtasks
- **Node.js + Express (Backend)** – CRUD operations for tasks & subtasks (JSON file–based)
- **n8n (Workflow Engine)** – Automates subtask generation via Google Gemini API
- **JSON-based Storage** – Users and tasks are stored in simple JSON files (no external DB in current implementation)

---

## 📦 Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/get-npm)
- [n8n](https://n8n.io/) (installed globally via `npm install -g n8n`)
- A valid **Google Gemini API Key**

---

## ⚙️ Setup Instructions

### 1. Clone & Install Dependencies

git clone <repo-url>
cd <repo-folder>
npm install
2. Start the React Frontend
npm start


Runs on http://localhost:3000
.

3. Start the Node.js Backend

In another terminal:

node server.js


Runs on http://localhost:5000
.

The backend provides:

GET /tasks → List all tasks

POST /tasks → Create a task

PUT /tasks/:id → Update a task

DELETE /tasks/:id → Delete a task

POST /tasks/:id/subtasks → Create a subtask

PUT /tasks/:id/subtasks/:subtaskId → Update a subtask

DELETE /tasks/:id/subtasks/:subtaskId → Delete a subtask

POST /generate-subtasks → Auto-generate subtasks using Gemini via n8n

All data is stored in tasks.json (users are also JSON-backed).

4. Setup n8n Workflow

Import the provided n8n.json workflow into your local n8n instance.

Set your Gemini API Key in the workflow configuration.

Run n8n locally:

n8n


By default, it runs at http://localhost:5678
.

Open the n8n UI → locate the imported workflow → click Execute Workflow.

5. Connecting It All

The React Neon button popup sends a request to /generate-subtasks.

Node.js backend forwards the request to the n8n workflow.

n8n uses Gemini API to generate subtasks in JSON format.

Generated subtasks are saved back into tasks.json.

The UI automatically updates with the new task + subtasks.

🗂️ Data Model

I used JSON files to simulate a mongo db as my system had a glitch. Example schema:

[
  {
    "id": 101,
    "taskName": "Build Login Page",
    "assignedUserIds": [1, 2],
    "status": "In Progress",
    "storyPoints": 5,
    "history": [
      { "status": "Not Started", "timestamp": "Aug 29, 2025, 10:00 AM" },
      { "status": "In Progress", "timestamp": "Aug 29, 2025, 10:30 AM" }
    ],
    "subtasks": [
      {
        "id": 201,
        "taskName": "Create UI",
        "assignedUserIds": [2],
        "status": "Not Started",
        "storyPoints": 2,
        "history": []
      }
    ]
  }
]


This implementation uses local JSON files (tasks.json, users.json) with CRUD operations via Express.

🎯 How It Works (Flow)

User clicks n8n button → enters a task name.

React calls POST /generate-subtasks → handled by Express.

Express forwards the request to n8n.

n8n → Calls Gemini API → returns a JSON array of subtasks.

Subtasks are written into tasks.json alongside the main task.

React UI updates and displays the newly created task + subtasks.

🔑 Environment Variables

Make sure you have your Gemini API Key available:

I have hardcoded it in server.js 

🚀 Run Everything Together

Start backend:

node server.js


Start frontend:

npm start


Start n8n:

command : n8n


In browser:

Go to React app → Click Neon button → Enter task.

Watch subtasks generated automatically and added into tasks.json.


👨‍💻 Author

Monish Alur
