import React from "react";

/**
 * PopupLinksList
 * Affiche la liste des liens associés à un bâtiment (ou autre entité),
 * avec un bouton pour fermer la popup.
 *
 * Props :
 *   - visible : bool (affichage ou non)
 *   - data : objet avec champs { sourceId, targetId, linkMode, links }
 *   - onClose : fonction de fermeture
 *   - stageWidth, stageHeight : dimensions de la popup
 */
export default function PopupLinksList({
  visible,
  data,
  onClose,
  stageWidth,
  stageHeight,
}) {
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

        {/* Liste défilable des liens */}
        {data?.links && data.links.length > 0 ? (
          <div
            style={{
              width: "100%",
              maxHeight: stageHeight ? stageHeight - 200 : 150,
              overflowY: "auto",
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            {data.links.map((link) => (
              <div
                key={link.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  color: colorType(link.type),
                }}
              >
                <span style={{ fontWeight: "bold" }}>{link.id}</span>
                <span>{link.type}</span>
                <span>{link.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginBottom: 20, color: "#666" }}>Aucun lien associé.</p>
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
