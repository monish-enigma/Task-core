import React, { useState } from "react";

export default function TaskGenerator() {
  const [taskName, setTaskName] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubtasks([]);

    try {
      const res = await fetch("http://localhost:5000/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName }),
      });

      if (!res.ok) throw new Error("Failed to generate subtasks");

      const data = await res.json();
      setSubtasks(data.subtasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center" }}>
      <h2>Task Subtask Generator</h2>
      <form onSubmit={handleGenerate}>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Enter a task (e.g., Build login page)"
          style={{ padding: "8px", width: "70%" }}
          required
        />
        <button type="submit" style={{ marginLeft: "8px", padding: "8px 16px" }}>
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {subtasks?.length > 0 && (
        <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
          <h3>Suggested Subtasks:</h3>
          <ul>
            {subtasks.map((st, idx) => (
              <li key={idx}>{st}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
