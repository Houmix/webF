import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import HomePannel from "./HomePannel.jsx";

const MainRouter = ({ request, type }) => {
  const [buildings, setBuildings] = useState([]);

  // 1. Récupération depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem(type);
    if (saved) {
      setBuildings(JSON.parse(saved));
    }
  }, [type]);

  // 2. Appel API
  useEffect(() => {
    const fetchBuildings = async () => {
      console.log("Request URL:", request); // Afficher la valeur de request
      try {
        const res = await fetch(request);
        if (res.ok) {
          const data = await res.json();
          console.log("Données récupérées:", data); // Afficher la structure des données
          setBuildings(data);
          localStorage.setItem(type, JSON.stringify(data));
        } else {
          console.error("Erreur API :", res.status);
        }
      } catch (e) {
        console.error("Erreur de récupération :", e.message);
      }
    };

    if (buildings.length === 0) {
      fetchBuildings();
    }
  }, [buildings.length, request, type]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <HomePannel buildings={buildings} setBuildings={setBuildings} />
          }
        />
        <Route
          path="/app"
          element={<App buildings={buildings} setBuildings={setBuildings} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
export default MainRouter;
