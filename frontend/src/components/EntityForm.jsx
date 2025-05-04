import React, { useState, useEffect } from "react";
import { useData } from "../DataContext";

// Extract the form logic to a standalone component
function EntityForm({ houseId, onCreated, onCancel }) {
  const { api } = useData();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    photo: "", // Note: changed from "image" to "photo" to match API expectations
    coordX: 100,  // Note: changed from "coordsX" to "coordX" to match API expectations
    coordY: 100,  // Note: changed from "coordsY" to "coordY" to match API expectations
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    // Structure à envoyer à l'API (adapter selon backend)
    const entityData = {
      name: formData.name,
      type: formData.type,
      active: true,
      x: Number(formData.coordX), // Correction: doit être 'x'
      y: Number(formData.coordY)  // Correction: doit être 'y'
    };

    try {
      // Log the request data for debugging
      console.log("Envoi des données:", entityData);
      console.log("URL de l'API:", `/house/entity/${houseId}/`);
      
      // Envoie la requête POST à l'API REST
      const response = await api.post(`/house/entity/${houseId}/`, entityData);
      
      // Log response for debugging
      console.log("Réponse API:", response);
      
      setFormSuccess("Projet créé avec succès !");
      // Callback pour informer le parent (rafraîchir la liste)
      if (onCreated) onCreated();
      
      // Reset du formulaire
      setFormData({
        name: "",
        type: "",
        coordX: 100,
        coordY: 100,
      });
    } catch (err) {
      console.error("Erreur API complète:", err);
      // Meilleure gestion de l'erreur
      let errorMessage = err.message || "Erreur lors de la création du projet";
      if (err.response && err.response.data) {
        // Affiche tout le contenu de l'erreur côté backend pour debug
        errorMessage += "\n" + JSON.stringify(err.response.data, null, 2);
      }
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="form-group-fullwidth">
      <form onSubmit={handleFormSubmit}>
        <div className="form-group type-group">
          <label>
            Nom du projet :<br />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="form-input"
            />
          </label>
        </div>
        <div className="form-group type-group">
          <label>
            Type :<br />
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              required
              className="form-input"
            />
          </label>
        </div>
        
        
        <div style={{ marginBottom: 12, display: "flex", gap: 10 }}>
          <label>
            Coord X :<br />
            <input
              type="number"
              name="coordX" // Changed from "coordsX" to "coordX"
              value={formData.coordX}
              onChange={handleFormChange}
              className="form-input-small"
            />
          </label>
          <label>
            Coord Y :<br />
            <input
              type="number"
              name="coordY" // Changed from "coordsY" to "coordY"
              value={formData.coordY}
              onChange={handleFormChange}
              className="form-input-small"
            />
          </label>
        </div>
        {formError && <div className="form-error">{formError}</div>}
        {formSuccess && (
          <div className="form-success">{formSuccess}</div>
        )}
        <div
          className="form-group-inline"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <button
            type="submit"
            disabled={formLoading}
            className="user-btn user-btn-success"
          >
            {formLoading ? "⏳ Création..." : "✅ Créer"}
          </button>
          <button
            type="button"
            className="user-btn user-btn-cancel"
            onClick={onCancel}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default EntityForm;