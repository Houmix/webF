import React, { useState, useEffect } from "react";
import { useData } from "../DataContext";

function ProjectEditPopup({ visible, data, onClose, onEdit }) {
  const { api } = useData();
  const [form, setForm] = useState({
    name: data?.name || "",
    type: data?.type || "",
    address: data?.address || "",
    city: data?.city || "",
    photo: data?.photo || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm({
      name: data?.name || "",
      type: data?.type || "",
      address: data?.address || "",
      city: data?.city || "",
      photo: data?.photo || "",
    });
    setError("");
    setSuccess(false);
  }, [data, visible]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("type", form.type);
      formData.append("address", form.address);
      formData.append("city", form.city);
      if (form.photo && typeof form.photo !== "string") {
        formData.append("photo", form.photo);
      }
      await api.patch(`house/house/${data.id}/`, formData);
      setSuccess(true);
      if (onEdit) onEdit({ ...data, ...form });
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Erreur lors de la modification du projet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-edit-popup-container" style={{
      width: 500,
      maxWidth: "95vw",
      minHeight: 320,
      background: "rgba(248, 250, 253, 0.97)",
      borderRadius: 16,
      boxShadow: "0 8px 40px 0 rgba(61,169,252,0.13)",
      border: "2px solid #3da9fc",
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 9999,
      padding: 32,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ color: "#3da9fc", fontSize: 22, fontWeight: 700 }}>Modifier le projet</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#3da9fc", fontSize: 20, fontWeight: 700, cursor: "pointer" }}>×</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <label style={{ fontWeight: 600 }}>
          Nom du projet
          <input type="text" name="name" value={form.name} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc", marginTop: 6 }} required />
        </label>
        <label style={{ fontWeight: 600 }}>
          Type
          <input type="text" name="type" value={form.type} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc", marginTop: 6 }} required />
        </label>
        <label style={{ fontWeight: 600 }}>
          Adresse
          <input type="text" name="address" value={form.address} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc", marginTop: 6 }} />
        </label>
        <label style={{ fontWeight: 600 }}>
          Ville
          <input type="text" name="city" value={form.city} onChange={handleChange} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc", marginTop: 6 }} />
        </label>
        <label style={{ fontWeight: 600 }}>
          Photo
          <input type="file" name="photo" accept="image/*" onChange={handleChange} style={{ marginTop: 6 }} />
        </label>
        {error && <div style={{ color: "#ff5252", fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ color: "#43a047", fontWeight: 600 }}>Projet modifié !</div>}
        <button type="submit" disabled={loading} style={{
          background: "linear-gradient(90deg,#3da9fc,#90e0ef)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 0",
          fontWeight: 700,
          fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 10,
        }}>
          {loading ? "Modification..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

export default ProjectEditPopup;
