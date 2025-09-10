import React, { useState, useEffect } from "react";
import users from "./users.json";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [status, setStatus] = useState("Not Started");
  const [showHistoryId, setShowHistoryId] = useState(null);

  // Load tasks
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
    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      const saved = await res.json();
      setTasks([...tasks, saved]);
      setTaskName("");
      setAssignedUserIds([]);
      setStatus("Not Started");
      setShowForm(false);
    }
  };

  const toggleUserSelection = (id) => {
    setAssignedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Update status
  const handleStatusChange = async (task, newStatus) => {
    const updatedTask = { ...task, status: newStatus };
    const res = await fetch(`http://localhost:5000/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    if (res.ok) {
      const saved = await res.json();
      setTasks(tasks.map((t) => (t.id === task.id ? saved : t)));
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  // 🔹 Common Button Style
  const buttonStyle = {
    background: "#00f0ff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#000",
    transition: "all 0.3s ease",
    boxShadow: "0 0 8px #00f0ff80",
  };

  const buttonHover = {
    transform: "scale(1.05)",
    boxShadow: "0 0 15px #00f0ff",
  };

  return (
    <div
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg, #0f0f0f, #1a1a1a)",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#00f0ff",
          textShadow: "0 0 10px #00f0ff",
          marginBottom: "1rem",
        }}
      >
        Task Dashboard
      </h2>

      {/* Add Task Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={buttonStyle}
        onMouseOver={(e) => Object.assign(e.target.style, buttonHover)}
        onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
      >
        {showForm ? "Cancel" : "Add Task"}
      </button>

      {/* Add Task Form */}
      {showForm && (
        <form
          onSubmit={handleAddTask}
          style={{
            background: "#1f1f1f",
            padding: "1.5rem",
            borderRadius: "12px",
            marginTop: "1rem",
            boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <label>Task Name:</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "#fff",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Assign To:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
              {users.map((user) => (
                <label
                  key={user.id}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    background: assignedUserIds.includes(user.id) ? "#00f0ff" : "#333",
                    color: assignedUserIds.includes(user.id) ? "#000" : "#fff",
                    transition: "all 0.3s ease",
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
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #333",
                background: "#0f0f0f",
                color: "#fff",
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            style={buttonStyle}
            onMouseOver={(e) => Object.assign(e.target.style, buttonHover)}
            onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
          >
            Save Task
          </button>
        </form>
      )}

      {/* Tasks Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "2rem",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(0, 240, 255, 0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#222", color: "#00f0ff" }}>
            <th style={{ padding: "12px" }}>Task</th>
            <th style={{ padding: "12px" }}>Assigned To</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>History</th>
            <th style={{ padding: "12px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              <tr
                style={{
                  background: idx % 2 === 0 ? "#1a1a1a" : "#111",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#2a2a2a")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = idx % 2 === 0 ? "#1a1a1a" : "#111")
                }
              >
                <td style={{ padding: "12px" }}>{task.taskName}</td>
                <td style={{ padding: "12px" }}>
                  {task.assignedUserIds
                    .map((id) => users.find((u) => u.id === id)?.name)
                    .join(", ")}
                </td>
                <td style={{ padding: "12px" }}>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      background: "#0f0f0f",
                      color: "#fff",
                      border: "1px solid #333",
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() =>
                      setShowHistoryId(showHistoryId === task.id ? null : task.id)
                    }
                    style={buttonStyle}
                    onMouseOver={(e) => Object.assign(e.target.style, buttonHover)}
                    onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
                  >
                    {showHistoryId === task.id ? "Hide" : "View"} History
                  </button>
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => handleDelete(task.id)}
                    style={{
                      ...buttonStyle,
                      background: "#ff4444",
                      color: "#fff",
                      boxShadow: "0 0 8px #ff444480",
                    }}
                    onMouseOver={(e) =>
                      Object.assign(e.target.style, {
                        transform: "scale(1.05)",
                        boxShadow: "0 0 15px #ff4444",
                        background: "#ff2222",
                      })
                    }
                    onMouseOut={(e) =>
                      Object.assign(e.target.style, {
                        ...buttonStyle,
                        background: "#ff4444",
                        color: "#fff",
                        boxShadow: "0 0 8px #ff444480",
                      })
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
              {showHistoryId === task.id && (
                <tr>
                  <td colSpan="5" style={{ background: "#1f1f1f", padding: "15px" }}>
                    <h4 style={{ color: "#00f0ff" }}>History</h4>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {task.history?.map((h, i) => (
                        <li key={i}>
                          <span style={{ color: "#aaa" }}>{h.status}</span>{" "}
                          <span style={{ color: "#00f0ff" }}>{h.timestamp}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
