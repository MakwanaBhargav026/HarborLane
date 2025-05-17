import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function capitalizeRole(role: string) {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const userRole = localStorage.getItem("userRole") || "Login";

// Set the page title dynamically
document.title = `HaborLane ${capitalizeRole(userRole)}`;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
