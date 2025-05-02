import React, { useState, useEffect } from "react";

function ParticipantsPopup({ visible, data, onClose }) {
  // Gestion de l'état local pour la liste des participants et le champ d'ajout
  const [localPeople, setLocalPeople] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");

  // Initialise la liste locale à l'ouverture de la popup
  useEffect(() => {
    if (visible && data?.peopleInIt) {
      setLocalPeople(data.peopleInIt.map((p) => ({ ...p })));
    }
  }, [visible, data]);

  // Ajout d'un participant
  const handleAddParticipant = () => {
    if (!newParticipant.trim()) return;
    setLocalPeople((prev) => [
      ...prev,
      {
        id: `NEW${Date.now()}`,
        name: newParticipant,
        role: "Collaborateur",
        permissions: { view: true, edit: false },
        isOwner: false,
      },
    ]);
    setNewParticipant("");
  };

  // Suppression d'un participant
  const handleRemoveParticipant = (id) => {
    setLocalPeople((prev) => prev.filter((p) => p.id !== id));
  };

  // Changement de rôle
  const handleChangeRole = (id) => {
    setLocalPeople((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              role:
                p.role === "Collaborateur" ? "Responsable" : "Collaborateur",
            }
          : p
      )
    );
  };

  if (!visible) return null;
  return (
    <div
      className="participants-popup-container"
      style={{
        width: 700,
        maxWidth: "95vw",
        minHeight: 420,
        background: "rgba(248, 250, 253, 0.92)",
        borderRadius: 16,
        boxShadow: "0 8px 40px 0 rgba(61,169,252,0.13)",
        border: "2px solid #3da9fc",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        overflow: "hidden",
        padding: 0,
      }}
    >
      {/* En-tête avec dégradé */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "linear-gradient(90deg,#3da9fc,#90e0ef)",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 0.5,
          }}
        >
          Participants du projet: {data?.infos?.name || "Projet"}
        </span>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.18)",
            border: "none",
            color: "#3da9fc",
            fontWeight: 700,
            fontSize: 18,
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            boxShadow: "0 2px 6px #3da9fc22",
            transition: "background 0.16s",
          }}
        >
          Fermer
        </button>
      </div>
      {/* Body section */}
      <div
        style={{
          padding: 32,
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Participants list */}
        <div style={{ marginBottom: 18 }}>
          <strong style={{ color: "#3da9fc", fontSize: 18 }}>
            Liste des participants
          </strong>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {localPeople.map((person, idx) => (
            <div
              key={person.id}
              style={{
                display: "flex",
                alignItems: "center",
                background:
                  idx % 2 === 0
                    ? "rgba(248,250,253,0.5)"
                    : "rgba(255,255,255,0.2)",
                borderRadius: 8,
                padding: "10px 18px",
                boxShadow: "0 1px 4px #3da9fc11",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "#22344a",
                  fontSize: 16,
                  flex: 2,
                }}
              >
                {person.name}
              </span>
              <span style={{ color: "#666", fontSize: 15, flex: 2 }}>
                {person.role}
              </span>
              <button
                style={{
                  background: "linear-gradient(90deg,#90e0ef,#3da9fc)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "5px 14px",
                  marginRight: 10,
                  cursor: "pointer",
                }}
                onClick={() => handleChangeRole(person.id)}
              >
                Changer rôle
              </button>
              <button
                style={{
                  background: "linear-gradient(90deg,#ff5252,#ffb347)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "5px 14px",
                  cursor: "pointer",
                }}
                onClick={() => handleRemoveParticipant(person.id)}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        {/* Add participant */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input
            type="text"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            placeholder="Nom du participant"
            style={{
              flex: 2,
              border: "1px solid #3da9fc",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 15,
              marginRight: 8,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddParticipant();
            }}
          />
          <button
            style={{
              background: "linear-gradient(90deg,#38b48e,#3da9fc)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              padding: "8px 18px",
              cursor: "pointer",
            }}
            onClick={handleAddParticipant}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsPopup;
