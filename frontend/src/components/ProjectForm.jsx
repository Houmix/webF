import React, { useState, useEffect } from "react";
import { useData } from "../DataContext";

function ProjectForm({ onCancel }) {

  const { api, userId } = useData();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [people, setPeople] = useState("");
  const [flux, setFlux] = useState({
    electricity: "",
    water: "",
    internet: "",
  });

  // Créer un lien absolu à partir du fichier sélectionné
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Créer un lien absolu pour l'image
      const absoluteUrl = URL.createObjectURL(file);
      setImageUrl(absoluteUrl);
    }
  };

  // Nettoyer les URL créées quand le composant est démonté
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('people', people);
    formData.append('imageUrl', imageUrl);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('flux', JSON.stringify({
      electricity: { value: flux.electricity },
      water: { value: flux.water },
      internet: { value: flux.internet },
    }));

    try {
      await createHouse(userId, formData);
      
      if (onCancel) onCancel();
    } catch (error) {
      alert("Erreur lors de la création de la maison : " + error.message);
    }
  };

  const createHouse = async (userId, houseData) => {
    try {
      console.log(houseData);
      // Construire l'URL de l'API avec l'ID utilisateur
      const data2send = {
        name: houseData.name||"",
        type: houseData.type||"",
        address: houseData.address||"",
        photo: houseData.photo||"",
        profiles: [],
        entities: [],
      };
      const apiUrl = `http://127.0.0.1:8000/house/house/${userId}/`;
      
      // Envoyer la requête POST
      const response = await api.post(apiUrl, houseData);
      
      // Vérifier si la requête a réussi
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Parser et retourner les données
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors de la création de la maison:', error);
      throw error;
    }
  };
  return (
    <form
      className="user-project-form"
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "rgba(255,255,255,0.7)",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      }}
    >
      <h2 style={{ margin: 0, textAlign: "center", fontWeight: 700 }}>
        Créer un projet
      </h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du projet"
        required
        style={{ borderRadius: 8, border: "1px solid #b3d4fc", padding: 8 }}
      />
      <input
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Type de projet"
        required
        style={{ borderRadius: 8, border: "1px solid #b3d4fc", padding: 8 }}
      />
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="URL de l'image (optionnel)"
        style={{ borderRadius: 8, border: "1px solid #b3d4fc", padding: 8 }}
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ borderRadius: 8, border: "1px solid #b3d4fc", padding: 8 }}
      />
      {imageUrl && (
        <div style={{ textAlign: "center" }}>
          <p>Aperçu de l'image:</p>
          <img 
            src={imageUrl} 
            alt="Aperçu" 
            style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: 8 }} 
          />
        </div>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg,#3da9fc,#90e0ef)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Créer
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;