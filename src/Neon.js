import React, { useState } from "react";

const NeonButtonWithPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdTask, setCreatedTask] = useState(null);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
    setTaskName("");
    setError("");
    setCreatedTask(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCreatedTask(null);

    try {
      // 1. Call Gemini via backend
      const res = await fetch("http://localhost:5000/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName }),
      });

      if (!res.ok) throw new Error("Failed to generate subtasks");
      const data = await res.json();

      const subtasks = data.subtasks;
      if (!Array.isArray(subtasks)) throw new Error("Invalid subtasks format");

      // 2. Create main task (consistent schema)
      const taskRes = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Date.now(),
          taskName, // 🔹 always "taskName"
          assignedUserIds: [],
          status: "Not Started",
          storyPoints: 0,
          history: [],
          subtasks: [],
        }),
      });

      if (!taskRes.ok) throw new Error("Failed to create main task");
      const mainTask = await taskRes.json();

      // 3. Insert subtasks under main task (consistent schema)
      for (const st of subtasks) {
        await fetch(`http://localhost:5000/tasks/${mainTask.id}/subtasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Date.now(),
            taskName: st, // 🔹 use "taskName"
            assignedUserIds: [],
            status: "Not Started",
            storyPoints: 0,
            history: [],
          }),
        });
      }

      setCreatedTask({ ...mainTask, subtasks });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "12px 24px",
          backgroundColor: "#111",
          color: "#4b6cb7",
          border: "2px solid #4b6cb7",
          borderRadius: "50px",
          boxShadow: "0 0 10px #4b6cb7, 0 0 20px #4b6cb7",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          outline: "none",
          zIndex: 1000,
        }}
      >
        n8n
      </button>

      {showPopup && (
        <>
          {/* backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 998,
            }}
          />
          {/* popup */}
          <div
            style={{
              position: "fixed",
              top: "80px",
              right: "20px",
              backgroundColor: "#1a1a1a",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 0 10px #4b6cb7",
              zIndex: 999,
              width: "300px",
              color: "#fff",
            }}
          >
            {/* close button */}
            <button
              onClick={handleClose}
              style={{
                float: "right",
                background: "transparent",
                border: "none",
                color: "#4b6cb7",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <form onSubmit={handleGenerate}>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Enter task name"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #4b6cb7",
                  backgroundColor: "#111",
                  color: "#4b6cb7",
                }}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#111",
                  color: "#4b6cb7",
                  border: "2px solid #4b6cb7",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {loading ? "Generating..." : "Generate & Save"}
              </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {createdTask && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ color: "#4b6cb7" }}>
                  ✅ Task "{createdTask.taskName}" created with {createdTask.subtasks.length} subtasks
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default NeonButtonWithPopup;
