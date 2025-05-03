import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import MainRouter from "./MainRouter.jsx";

// Create a wrapper component to handle the URL parameter logic
function App() {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Récupérer l'ID depuis les paramètres d'URL (clé userId)
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get("userId");
    if (urlUserId) {
      sessionStorage.setItem("userId", urlUserId);
      localStorage.setItem("api_session_userId", urlUserId);
      setUserId(urlUserId);
    }
  }, []); // Empty dependency array means this runs once on mount
  
  return (
    <StrictMode>
      <MainRouter
        request="http://127.0.0.1:8000/"
        type="projects"
        userId={userId}
      />
    </StrictMode>
  );
}

// Render the App component
createRoot(document.getElementById("root")).render(<App />);