import React, { useState } from "react";
import { useData } from "../DataContext";

/**
 * PopupLinks
 * Affiche la liste des liens associés à un bâtiment (ou autre entité), avec un bouton pour fermer la popup.
 * Props :
 *   - visible : bool (affichage ou non)
 *   - data : tableau d'objets lien (ou null)
 *   - onClose : fonction de fermeture
 */
/**
 * PopupLinks (Création de lien)
 * Affiche un input pour saisir la quantité de flux à passer entre deux bâtiments.
 * Props :
 *   - visible : bool
 *   - data : { sourceId, targetId, linkMode }
 *   - onClose : fonction de fermeture
 *   - onValidate : fonction appelée avec la quantité (number)
 */
export default function PopupLinks({
  visible,
  data,
  onClose,
  onValidate,
  stageWidth,
  stageHeight,
}) {
  const [quantity, setQuantity] = useState("");

  if (!visible) return null;

  const { api } = useData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = parseInt(quantity, 10);
    if (!q || isNaN(q) || q <= 0) return;
    if (!data?.sourceId || !data?.targetId || !data?.linkMode) return;

    // Construire l'objet à envoyer
    // Extraire l'id numérique attendu par l'API
    const sourceId = parseInt(data.sourceId, 10);
    const targetId = parseInt(data.targetId, 10);
    const linkData = {
      source: sourceId,
      target: targetId,
      type: data.linkMode,
      value: q
    };

    try {
      await api.post("/house/link/", linkData);
      window.location.reload(); // Force un rechargement de la page après ajout
      // onValidate(q);
      setQuantity("");
    } catch (error) {
      alert("Erreur lors de la création du lien");
    }
  };

  const colorType = (e) => {
    switch (e) {
      case "electricity":
        return "yellow"; // Example color for electricity
      case "water":
        return "blue"; // Example color for water
      case "internet":
        return "gray"; // Example color for internet
      default:
        return "green"; // Default color for unknown types
    }
  };

  return (
    <div
      className="popup"
      style={{
        zIndex: 4000,
        background: "rgba(0,32,64,0.28)",
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: stageWidth ? stageWidth : 600,
        height: stageHeight ? stageHeight : 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          minWidth: 340,
          boxShadow: "0 2px 20px #00204055",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            color: colorType(data?.linkMode),
          }}
        >
          Créer un lien{" "}
          <span style={{ color: colorType(data?.linkMode) }}>
            {data?.linkMode || "?"}
          </span>
        </h2>
        <div style={{ marginBottom: 16, fontSize: 16 }}>
          <b>De :</b> {data?.sourceId} <br />
          <b>Vers :</b> {data?.targetId}
        </div>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantité de flux"
          style={{
            fontSize: 20,
            padding: 8,
            width: 180,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #b3c2d1",
          }}
          required
        />
        <button
          type="submit"
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            background: "#0e4c92",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: 18,
            cursor: "pointer",
            marginBottom: 10,
          }}
          disabled={
            !quantity ||
            isNaN(parseInt(quantity, 10)) ||
            parseInt(quantity, 10) <= 0
          }
        >
          Valider
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            background: "#888",
            color: "#fff",
            border: "none",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </form>
    </div>
  );
}
