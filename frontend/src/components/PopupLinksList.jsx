import React, { useState, useEffect } from "react";
import { useData } from "../DataContext";
import EntityForm from "./EntityForm";

// Ajout d'une fonction utilitaire pour afficher la liste en readOnly
export function showLinksListReadOnly(data, onShowLinksList) {
  if (onShowLinksList) {
    onShowLinksList({
      sourceId: data.id,
      links: data.links || [],
      readOnly: true,
    });
  }
}

export default function PopupLinksList({ visible, data, onClose, stageWidth, stageHeight, readOnly = true }) {
  const { api } = useData();
  const [links, setLinks] = useState([]);
  // Fonction utilitaire pour recharger les liens
  const refreshLinks = async () => {
    if (data?.sourceId) {
      try {
        const res = await api.get(`/house/link/?entity_id=${data.sourceId}/`);
        setLinks(res.data || []);
      } catch {
        setLinks([]);
      }
    }
  };

  useEffect(() => {
    if (visible) refreshLinks();
    // eslint-disable-next-line
  }, [visible, data?.sourceId]);

  const deleteLink = async (linkId) => {
    try {
      const response = await api.delete(`/house/deleteLink/${linkId}/`);
      if (response.status === 204) {
        
        window.location.reload(); // Force un rechargement de la page
      } else {
        alert(response.data?.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur réseau');
    }
  };



  if (!visible) return null;

  const colorType = (type) => {
    switch (type) {
      case "electricity":
        return "yellow";
      case "water":
        return "blue";
      case "internet":
        return "gray";
      default:
        return "green";
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
        width: stageWidth || 600,
        height: stageHeight || 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          width: "80%",
          maxWidth: "90vw",
          maxHeight: "80vh",
          boxShadow: "0 2px 20px #00204055",
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
          Liens existants
        </h2>

        {readOnly ? null : (
          <>
            <EntityForm
              houseId={data?.sourceId}
              entityId={data?.entityId || data?.sourceId} // Passe l'id de l'entité à modifier
              onCreated={refreshLinks}
              onCancel={onClose}
              isPut={true}
            />
          </>
        )}
        {/* Liste des liens */}
        {readOnly
          ? null // En readOnly, n'affiche rien
          : links && links.length > 0 && (
              <div style={{ width: "100%", marginBottom: 10 }}>
                {links.map((link) => (
                  <div
                    key={link.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <span style={{ color: colorType(link.type), fontWeight: 600 }}>
                      {link.type} → {link.targetName || link.target || link.targetId}
                    </span>
                    <button
                      style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}
                      onClick={() => deleteLink(link.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
        {/* En readOnly, affiche juste un message neutre ou rien */}
        {readOnly && (
          <p style={{ marginBottom: 20, color: "#666" }}>Aucun lien modifiable à afficher.</p>
        )}
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
          Fermer
        </button>
        
      </div>
    </div>
  );
}