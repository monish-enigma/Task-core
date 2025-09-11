// src/App.js
import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import users from "./users.json";
import Dashboard from "./Dashboard";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(
      (u) => u.email === email.trim() && u.password === password
    );
    if (foundUser) {
      setLoggedInUser(foundUser);
      setError("");
      navigate("/dashboard"); // 👈 redirect to dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setEmail("");
    setPassword("");
    setError("");
    navigate("/"); // back to login
  };

  // ---------- (keep the same styles as before) ----------
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily:
      "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#E6F0FF",
    backgroundImage:
      "radial-gradient(circle at 10% 10%, rgba(0,160,255,0.05), transparent 10%), radial-gradient(circle at 90% 80%, rgba(255,0,200,0.03), transparent 12%), linear-gradient(180deg, #04060a 0%, #071428 60%)",
    backgroundColor: "#04060a",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 420,
    padding: "32px 28px",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    boxShadow:
      "0 8px 30px rgba(2,8,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    backdropFilter: "blur(6px)",
  };

  const headerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 12,
  };

  const titleStyle = {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: 0.8,
    margin: 0,
    color: "#E6F0FF",
    textShadow: "0 6px 30px rgba(0,160,255,0.15)",
  };

  const neonBarStyle = {
    height: 4,
    width: 140,
    borderRadius: 3,
    marginTop: 12,
    background:
      "linear-gradient(90deg, rgba(0,245,160,0.95), rgba(0,163,255,0.95))",
    boxShadow: "0 6px 24px rgba(0,160,255,0.2)",
  };

  const formStyle = { display: "flex", flexDirection: "column", gap: 14 };

  const labelStyle = {
    fontSize: 12,
    color: "#9fb8ff",
    marginBottom: 6,
    display: "block",
    fontWeight: 600,
  };

  const inputBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "#E6F0FF",
    outline: "none",
    fontSize: 15,
    transition:
      "box-shadow 140ms ease, border-color 140ms ease, transform 120ms ease",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
  };

  const inputFocus = {
    borderColor: "rgba(0,163,255,0.85)",
    boxShadow:
      "0 8px 28px rgba(0,160,255,0.15), 0 0 18px rgba(0,160,255,0.15)",
    transform: "translateY(-1px)",
  };

  const errorStyle = {
    color: "#FF6B8A",
    background:
      "linear-gradient(90deg, rgba(255,107,138,0.08), rgba(255,255,255,0.01))",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
    border: "1px solid rgba(255,107,138,0.15)",
  };

  const buttonStyle = {
    marginTop: 6,
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    letterSpacing: 0.6,
    fontSize: 15,
    color: "#051226",
    background: "linear-gradient(90deg, #00f5a0 0%, #00a3ff 100%)",
    boxShadow: "0 10px 30px rgba(0,160,255,0.15)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  };

  const smallNote = {
    fontSize: 12,
    color: "#9fb8ff",
    marginTop: 10,
    textAlign: "center",
  };

  const welcomeStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "20px",
  };

  const logoutStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    color: "#E6F0FF",
    cursor: "pointer",
    transition: "background 120ms ease",
  };
  const LoginForm = (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Task-Core</h1>
          <div style={neonBarStyle} />
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          {error && <div style={errorStyle}>{error}</div>}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
              style={{
                ...inputBase,
                ...(focused === "email" ? inputFocus : {}),
              }}
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
              style={{
                ...inputBase,
                ...(focused === "password" ? inputFocus : {}),
              }}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Sign in
          </button>

          {/* <div style={smallNote}>
            Demo accounts are stored locally in <code>src/users.json</code>
          </div> */}
        </form>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!loggedInUser ? LoginForm : <Navigate to="/dashboard" />} />
      <Route
        path="/dashboard"
        element={
          loggedInUser ? (
            <Dashboard user={loggedInUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}
