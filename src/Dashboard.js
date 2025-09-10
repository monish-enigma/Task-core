import React, { useState, useEffect } from "react";
import users from "./users.json";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [status, setStatus] = useState("Not Started");

  // Load tasks from backend
  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    const newTask = {
      id: Date.now(),
      taskName,
      assignedUserIds,
      status,
    };

    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        setTasks([...tasks, newTask]);
        setTaskName("");
        setAssignedUserIds([]);
        setStatus("Not Started");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (id) => {
    if (assignedUserIds.includes(id)) {
      setAssignedUserIds(assignedUserIds.filter((uid) => uid !== id));
    } else {
      setAssignedUserIds([...assignedUserIds, id]);
    }
  };

  // Update task status
  const handleStatusChange = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };

    try {
      const res = await fetch(`http://localhost:5000/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: "#121212",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ color: "#00f0ff" }}>Task Dashboard</h2>

      {/* Add Task Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          background: "#00f0ff",
          border: "none",
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
          cursor: "pointer",
          borderRadius: "6px",
          color: "#000",
          fontWeight: "bold",
        }}
      >
        {showForm ? "Cancel" : "Add Task"}
      </button>

      {/* Add Task Form */}
      {showForm && (
        <form
          onSubmit={handleAddTask}
          style={{
            marginBottom: "1.5rem",
            background: "#1f1f1f",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label>Task Name:</label>
            <br />
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Assign To:</label>
            <br />
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "5px",
              }}
            >
              {users.map((user) => (
                <label
                  key={user.id}
                  style={{
                    background: assignedUserIds.includes(user.id)
                      ? "#00f0ff"
                      : "#333",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: assignedUserIds.includes(user.id) ? "#000" : "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assignedUserIds.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    style={{ marginRight: "5px" }}
                  />
                  {user.name}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Status:</label>
            <br />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              background: "#00f0ff",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "6px",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            Save Task
          </button>
        </form>
      )}

      {/* Tasks Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1f1f1f" }}>
            <th style={{ border: "1px solid #333", padding: "8px" }}>Task</th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>
              Assigned To
            </th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #333", padding: "8px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {task.taskName}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                {task.assignedUserIds
                  .map((id) => users.find((u) => u.id === id)?.name)
                  .join(", ")}
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task, e.target.value)
                  }
                  style={{ padding: "5px", background: "#1f1f1f", color: "#fff" }}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td style={{ border: "1px solid #333", padding: "8px" }}>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{
                    background: "red",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
