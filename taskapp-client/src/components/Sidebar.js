import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const sidebarStyle = {
    width: "250px",
    height: "100vh",
    background: "linear-gradient(180deg,#0f172a,#020617",
    color: "white",
    padding: "30px 20px",
    position: "fixed",
    left: 0,
    top: 0,
    borderRadius: "1px solid rgba(255, 255, 255, 0.05)"
  };

  const item = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "0.2s",
    color: "#cbd5e1"
  };

  return (
    <div style={sidebarStyle}>

      <h2 style={{ marginBottom: "30px" }}>
        Service System
      </h2>

      <div style={item} onClick={() => navigate("/dashboard")}>
        📊 Dashboard
      </div>

      <div style={item} onClick={() => navigate("/tasks")}>
        📋 Opgaver
      </div>

      <div style={item} onClick={() => navigate("/users")}>
        👥 Brugere
      </div>

      <div style={item}>
        ⚙️ Indstillinger
      </div>

    </div>
  );
}

export default Sidebar;