import React, { useState } from "react";
import { useData } from "../DataContext";
import { Rect, Text, Group, Image, Line, Circle } from "react-konva";
import useImage from "use-image";
import ProjectForm from "./ProjectForm";

// DefaultLandscape et ICONS restent inchangés

export default function ProjectCard({
  onParticipantsUpdate,
  initialData,
  position,
  otherProjects,
  onDoubleClick,
  onEdit,
  onTap,
  onDelete,
  editProjectId,
  onShowParticipantsPopup,
  forceDrawLineRerender,
  onPositionChange,
}) {
  // Récupère api depuis le contexte global
  const { api } = useData();
  
  // Reset local state if the card is removed or initialData change
  React.useEffect(() => {
    setHovered(false);
    setMenu({ visible: false, x: 0, y: 0 });
    setShowConfirm(false);
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
  }, [initialData]);
  
  const cardWidth = 150;
  const cardHeight = 150;
  const contentPadding = 10;
  const [data, setData] = useState(initialData);
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [image] = useImage("http://127.0.0.1:8000/" + data.photo || "");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const [participantsPopup, setParticipantsPopup] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [newParticipant, setNewParticipant] = useState("");
  const [hovered, setHovered] = useState(false);
  const [fade, setFade] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });
  const [isDeleting, setIsDeleting] = useState(false); // Nouvel état pour suivre le processus de suppression

  // Animation de fade
  React.useEffect(() => {
    let a = 0;
    const anim = setInterval(() => {
      a += 0.1;
      setFade(Math.min(a, 1));
      if (a >= 1) clearInterval(anim);
    }, 16);
    return () => clearInterval(anim);
  }, []);

  // Gère le clic droit pour afficher le menu contextuel
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const pointer = e.target.getStage().getPointerPosition();
    setMenu((m) => ({
      ...m,
      visible: true,
      x: pointer.x - position.x,
      y: pointer.y - position.y,
    }));
    window.addEventListener("click", handleCloseMenu);
  };

  // Ferme le menu si clic ailleurs
  const handleCloseMenu = () => {
    setMenu((m) => ({ ...m, visible: false }));
    window.removeEventListener("click", handleCloseMenu);
  };

  // Actions menu
  const handleEdit = () => {
    setMenu({ ...menu, visible: false });
    setEditPopupVisible(true);
  };

  const handleEditPopupClose = () => {
    setEditPopupVisible(false);
  };
  
  const handleEditPopupSave = (newData) => {
    setEditPopupVisible(false);
    setData(newData);
    if (onEdit) onEdit(newData);
  };
  
  // Version améliorée de handleDelete avec meilleure gestion des erreurs
  // et séquence d'exécution plus claire
  const handleDelete = async () => {
    if (isDeleting) return; // Empêche les doubles clics
    
    try {
      setIsDeleting(true);
      setHovered(false);
      setShowConfirm(false);
      setTooltip({ visible: false, text: "", x: 0, y: 0 });
      
      console.log("Suppression du projet:", data.id);
      
      // Suppression via l'endpoint requis
      await api.delete(`house/deleteHouse/${data.id}/`);
      console.log("Suppression API réussie pour le projet:", data.id);
      
      // Important: d'abord notifier le parent de la suppression spécifique (UI)
      if (onDelete) {
        console.log("Appel onDelete pour mise à jour locale de l'UI");
        onDelete(data.id);
      }
      
      // Puis déclencher le rafraîchissement global après un court délai
      // pour laisser l'API terminer ses opérations
      setTimeout(() => {
        if (onParticipantsUpdate) {
          console.log("Appel onParticipantsUpdate (refreshProjects) pour mise à jour globale");
          onParticipantsUpdate();
        }
        
        setIsDeleting(false);
      }, 300);
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression: " + (error.message || error));
      setIsDeleting(false);
    }
  };

  // Ajout du drag comme dans BuildingCard
  const [dragPos, setDragPos] = useState(position);
 
  // Le reste du code reste identique
  return (
    <Group
      x={dragPos.x+30}
      y={dragPos.y+30}
      opacity={isDeleting ? 0.5 : fade} // Réduit l'opacité pendant la suppression
      onTap={() => {
        if (typeof onDoubleClick === "function") onDoubleClick(data.id);
      }}
      onDblClick={() => {
        if (typeof onDoubleClick === "function") onDoubleClick(data.id);
      }}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTooltip({ visible: false, text: "", x: 0, y: 0 });
      }}
      listening={!isDeleting} // Désactive les interactions pendant la suppression
      style={{ cursor: hovered ? "pointer" : "default" }}
    >
      {/* Fond de carte harmonisé */}
      <Rect
        width={cardWidth}
        height={cardHeight}
        fill="#fff"
        shadowBlur={hovered ? 24 : 10}
        shadowColor={hovered ? "#3da9fc" : "#b3d4fc"}
        cornerRadius={12}
      />
      {/* Badge en édition */}
      {editProjectId === data.id && (
        <Group x={cardWidth - 68} y={-6}>
          <Rect
            width={62}
            height={22}
            fill="#3da9fc"
            cornerRadius={8}
            shadowBlur={2}
            shadowColor="#3da9fc"
          />
          <Text
            text="En édition"
            x={0}
            y={3}
            width={62}
            align="center"
            fontSize={12}
            fill="#fff"
            fontStyle="bold"
          />
        </Group>
      )}
      
      {/* Titre projet */}
      <Text
        text={data.name || "Projet"}
        x={contentPadding}
        y={12}
        fontSize={15}
        fontStyle="bold"
        fontFamily="Arial"
        fill="#3a1c71"
        width={cardWidth - 2 * contentPadding}
        align="center"
      />
      
      {/* Image ou paysage par défaut */}
      {image ? (
        <Image
          image={image}
          x={cardWidth / 2 - 50}
          y={35}
          width={100}
          height={70}
          cornerRadius={6}
        />
      ) : (
        <Rect
          x={cardWidth / 2 - 50}
          y={35}
          width={100}
          height={70}
          fill="#e0ffe9"
          cornerRadius={6}
        />
      )}
      
      {/* Sous-titre */}
      <Text
        text={data.type || "Type"}
        x={contentPadding}
        y={105}
        fontSize={10}
        fill="#5c7a99"
        width={cardWidth - 2 * contentPadding}
        align="center"
      />
      
      {/* adresse*/}
      <Text
        y={120}
        x={contentPadding}
        text={data.address || "Adresse"}
        fontSize={9}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#333333"
        width={cardWidth - 2 * contentPadding}
      />
      <Text
        y={135}
        x={contentPadding}
        text={data.city || "Adresse"}
        fontSize={9}
        fontFamily="Arial"
        fontStyle="bold"
        fill="#333333"
        width={cardWidth - 2 * contentPadding}
      />
      
      {/* Ajouter un indicateur de suppression en cours si nécessaire */}
      {isDeleting && (
        <Group>
          <Rect
            width={cardWidth}
            height={cardHeight}
            fill="rgba(255,0,0,0.1)"
            cornerRadius={12}
          />
          <Text
            text="Suppression..."
            x={0}
            y={cardHeight/2 - 10}
            width={cardWidth}
            align="center"
            fontSize={12}
            fill="#e53935"
            fontStyle="bold"
          />
        </Group>
      )}
      
      {/* Menu contextuel personnalisé */}
      {menu.visible && !showConfirm && !isDeleting && (
        <Group x={0} y={0} listening={true}>
          {/* Menu principal */}
          <Rect
            width={160}
            height={110}
            fill="#fff"
            shadowBlur={8}
            shadowColor="#333"
            cornerRadius={8}
            stroke="#3da9fc"
            strokeWidth={1}
          />
          {/* Modifier */}
          <Text
            text="🖊️ Modifier"
            x={0}
            y={8}
            width={160}
            height={22}
            fontSize={16}
            fill="#3da9fc"
            onClick={handleEdit}
            onTap={handleEdit}
            align="center"
            verticalAlign="middle"
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) =>
              setTooltip({
                visible: true,
                text: "Modifier ce projet",
                x: menu.x + 160,
                y: menu.y + 8,
              })
            }
            onMouseLeave={() =>
              setTooltip({ visible: false, text: "", x: 0, y: 0 })
            }
          />
          <Rect x={10} y={34} width={140} height={1} fill="#e0e0e0" />
          {/* Supprimer */}
          <Text
            text="🗑️ Supprimer"
            x={0}
            y={38}
            width={160}
            height={22}
            fontSize={16}
            fill="#e53935"
            onClick={() => setShowConfirm(true)}
            onTap={() => setShowConfirm(true)}
            align="center"
            verticalAlign="middle"
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) =>
              setTooltip({
                visible: true,
                text: "Supprimer ce projet",
                x: menu.x + 160,
                y: menu.y + 38,
              })
            }
            onMouseLeave={() =>
              setTooltip({ visible: false, text: "", x: 0, y: 0 })
            }
          />

          {/* Participants */}
          <Text
            text="👥 Participants"
            x={0}
            y={68}
            width={160}
            height={22}
            fontSize={16}
            fill="#3da9fc"
            align="center"
            verticalAlign="middle"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (typeof onShowParticipantsPopup === "function") {
                onShowParticipantsPopup(data);
              }
              setMenu((m) => ({ ...m, visible: false }));
            }}
            onMouseEnter={(e) =>
              setTooltip({
                visible: true,
                text: "Gérer les participants",
                x: menu.x + 160,
                y: menu.y + 68,
              })
            }
            onMouseLeave={() =>
              setTooltip({ visible: false, text: "", x: 0, y: 0 })
            }
          />
        </Group>
      )}
      {/* Popup de confirmation suppression */}
      {showConfirm && !isDeleting && (
        <Group x={0} y={0}>
          <Rect
            width={170}
            height={90}
            fill="#fff"
            shadowBlur={12}
            shadowColor="#333"
            cornerRadius={10}
            stroke="#e53935"
            strokeWidth={2}
          />
          <Text
            text="Confirmer la suppression ?"
            x={0}
            y={12}
            width={170}
            align="center"
            fontSize={14}
            fill="#333"
          />
          <Text
            text="Annuler"
            x={10}
            y={55}
            width={70}
            height={24}
            fontSize={15}
            fill="#3da9fc"
            align="center"
            verticalAlign="middle"
            onClick={() => setShowConfirm(false)}
            style={{ cursor: "pointer" }}
          />
          <Text
            text="Supprimer"
            x={90}
            y={55}
            width={70}
            height={24}
            fontSize={15}
            fill="#e53935"
            align="center"
            verticalAlign="middle"
            onClick={handleDelete}
            style={{ cursor: "pointer" }}
          />
        </Group>
      )}
    </Group>
  );
}