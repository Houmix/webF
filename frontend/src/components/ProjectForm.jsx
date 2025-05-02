import React, { useState } from "react";

// Formulaire moderne pour créer un projet
function ProjectForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [image, setImage] = useState("");
  const [people, setPeople] = useState("");
  const [flux, setFlux] = useState({ electricity: '', water: '', internet: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      infos: { name, type },
      image,
      peopleInIt: people.split(',').map(p => p.trim()).filter(Boolean),
      fluxStats: {
        electricity: { value: flux.electricity },
        water: { value: flux.water },
        internet: { value: flux.internet }
      }
    });
  };

  return (
    <form className="user-project-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      <h2 style={{ margin: 0, textAlign: 'center', fontWeight: 700 }}>Créer un projet</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du projet" required style={{ borderRadius: 8, border: '1px solid #b3d4fc', padding: 8 }} />
      <input value={type} onChange={e => setType(e.target.value)} placeholder="Type de projet" required style={{ borderRadius: 8, border: '1px solid #b3d4fc', padding: 8 }} />
      <input value={image} onChange={e => setImage(e.target.value)} placeholder="URL de l'image (optionnel)" style={{ borderRadius: 8, border: '1px solid #b3d4fc', padding: 8 }} />
      <input value={people} onChange={e => setPeople(e.target.value)} placeholder="Participants (séparés par une virgule)" style={{ borderRadius: 8, border: '1px solid #b3d4fc', padding: 8 }} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button type="submit" style={{ background: 'linear-gradient(90deg,#3da9fc,#90e0ef)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Créer</button>
        <button type="button" onClick={onCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
      </div>
    </form>
  );
}

export default ProjectForm;
