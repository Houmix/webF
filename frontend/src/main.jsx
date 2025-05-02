import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainRouter from "./MainRouter.jsx"; // tu vas créer ce fichier juste après

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainRouter
      request="http://127.0.0.1:8000/house/house/2/"
      type="projects"
    />
  </StrictMode>
);
