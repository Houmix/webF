import React, { useState, useEffect } from "react";
import { useData } from "../DataContext";

function ParticipantsPopup({ visible, data, onClose, onParticipantsUpdate, editMode = false }) {
  // Gestion de l'état local pour la liste des participants et le champ d'ajout
  const [localPeople, setLocalPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMode, setSearchMode] = useState('nom'); // 'nom' ou 'id'


  // Recharge la liste des participants à chaque ouverture de la popup
  const { getAllUserData, userId, api } = useData();
  useEffect(() => {
    const fetchLatestProfiles = async () => {
      if (!visible || !data?.id) return;
      try {
        const allData = await getAllUserData(userId);
        console.log("allData", allData);
        console.log("data.id", data?.id);
        const current = allData.find(p => String(p.id) === String(data.id));
        console.log("current", current);
        if (current && current.profiles) {
          console.log("current.profiles", current.profiles);
          setLocalPeople(current.profiles.map((p) => ({ ...p })));
        } else {
          setLocalPeople([]);
        }
      } catch (error) {
        setLocalPeople([]);
      }
    };
    fetchLatestProfiles();
  }, [visible, data?.id, getAllUserData, userId]);

  // Recherche de participants (par nom ou id) uniquement en local
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    // On filtre côté frontend uniquement, et on retire le user de session
    const filtered = localPeople.filter(p =>
      p.user_id !== userId && (
        (p.user_name && p.user_name.toLowerCase().includes(term.toLowerCase())) ||
        (String(p.user_id).includes(term))
      )
    );
    setSearchResults(filtered);
  };

 


  // Suppression d'un profil via DELETE sur /profile/<user_id>/<house_id>/
  const handleRemoveParticipant = async (userId) => {
    try {
      await api.delete(`house/profile/${userId}/${data.id}/`);
      setLocalPeople((prev) => prev.filter((p) => p.user_id !== userId));
      if (onParticipantsUpdate) onParticipantsUpdate();
    } catch (error) {
      alert("Erreur lors de la suppression: " + (error.message || error));
    }
  };


  // Changement de rôle (avec update côté backend)
  const handleChangeRole = async (userId) => {
    const person = localPeople.find((p) => p.user_id === userId);
    if (!person) return;
    const newRole = person.role === "Collaborateur" ? "Responsable" : "Collaborateur";
    try {
      await api.put(`house/profile/${userId}/${data.id}/`, { role: newRole });
      // Rafraîchir la liste locale après modification
      const allData = await getAllUserData(userId);
      const current = allData.find(p => String(p.id) === String(data.id));
      if (current && current.profiles) {
        setLocalPeople(current.profiles.map((p) => ({ ...p })));
      }
      if (onParticipantsUpdate) onParticipantsUpdate();
    } catch (error) {
      alert("Erreur lors du changement de rôle: " + (error.message || error));
    }
  };

  const [formData, setFormData] = React.useState({
    name: data.name || '',
    address: data.address || '',
    type: data.type || '',
  });

  React.useEffect(() => {
    setFormData({
      name: data.name || '',
      address: data.address || '',
      type: data.type || '',
    });
  }, [data]);

  if (!visible) return null;



  const onAcceptChanges = async () => {
    try {
      await api.put(`house/houseDetails/${userId}/${data.id}/`, {
        name: formData.name,
        address: formData.address,
        type: formData.type,
      });
      alert('Modifications enregistrées avec succès.');
      if (onParticipantsUpdate) onParticipantsUpdate();
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + (error.message || error));
    }
  };


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
          Participants du projet : {data?.name || "Projet"}
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
        {editMode ? (
                <>
        {/* Barre de recherche collée en haut */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: '#f8fafd',
          padding: '16px 0 0 0',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 2px 8px #3da9fc11',
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchMode === 'nom' ? "Rechercher par nom" : "Rechercher par ID"}
            style={{ flex: 2, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #3da9fc', background: searchMode === 'nom' ? '#3da9fc' : '#fff', color: searchMode === 'nom' ? '#fff' : '#3da9fc', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setSearchMode(searchMode === 'nom' ? 'id' : 'nom')}
          >
            {searchMode === 'nom' ? 'Nom' : 'ID'}
          </button>
        </div>
        {/* Participants list */}
        <div style={{ marginBottom: 18 }}>
          <strong style={{ color: "#3da9fc", fontSize: 18 }}>
            Liste des participants
          </strong>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(searchTerm.trim() ?
            localPeople.filter(
              p =>
                (p.user_id !== userId) &&
                (
                  searchMode === 'nom'
                    ? (p.user_name && p.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    : (String(p.user_id).includes(searchTerm))
                )
            ) :
            localPeople.filter(p => p.user_id !== userId)
          ).map((person, idx) => (
            <div
              key={person.user_id || idx}
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span>{person.user_name}</span>
                <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>
                  ID: {person.user_id}
                </span>
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
                    onClick={() => handleChangeRole(person.user_id)}
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
                    onClick={() => handleRemoveParticipant(person.user_id)}
                  >
                    Supprimer
                  </button>
               
            </div>
          ))}
        </div>
        </>
              ) : (
                // Formulaire affiché quand editMode === false
          <form style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: 420,
            margin: '0 auto',
            background: '#f8fafd',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 2px 12px #3da9fc15',
          }}>
            <label style={{ fontWeight: 600 }}>Nom du projet :
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>Adresse :
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
              />
            </label>
            <label style={{ fontWeight: 600 }}>Type de city :
              <input
                type="text"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ccc', marginTop: 4 }}
              />
            </label>
            <button
              type="button"
              style={{
                marginTop: 18,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#3da9fc',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
              onClick={onAcceptChanges}
            >
              Accept Changes
            </button>
          </form>
        )
        }

              
        
      </div>
    </div>
  );
}

export default ParticipantsPopup;