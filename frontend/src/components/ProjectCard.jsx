import React, { useState } from "react";
import { useData } from "../DataContext";
import { Rect, Text, Group, Image, Line, Circle } from "react-konva";
import useImage from "use-image";
// Ajout du header et de la barre de côté pour ProjectCard
import ProjectForm from "./ProjectForm";
import ProjectEditPopup from "./ProjectEditPopup";

// SVG paysage par défaut
const DefaultLandscape = ({ x, y, width, height }) => (
  <Group x={x} y={y}>
    <Rect
      width={width}
      height={height}
      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
      fillLinearGradientEndPoint={{ x: 0, y: height }}
      fillLinearGradientColorStops={[0, "#e0ffe9", 1, "#b3d4fc"]}
      cornerRadius={12}
    />
    <Line
      points={[20, height - 30, width - 20, height - 30]}
      stroke="#7fc97f"
      strokeWidth={8}
      tension={0.5}
    />
    <Rect
      x={width / 2 - 40}
      y={height / 2 - 30}
      width={80}
      height={30}
      fill="#cceabb"
      cornerRadius={10}
    />
    {/* Ajoute ici des éléments SVG décoratifs si tu veux */}
  </Group>
);

const ICONS = {
  electricity: "⚡",
  water: "💧",
  internet: "🌐",
};

export default function ProjectCard({
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
  // HEADER ET SIDEBAR (UI MODERNE)
  // Affichage du header (bannière centrée)
  // Affichage d'une barre latérale à gauche pour le formulaire (placeholder ici)
  // À intégrer dans la page parent ou wrapper, mais exemple d'intégration :
  // <div className="user-header" style={{width:'100%',textAlign:'center',padding:'24px 0',background:'linear-gradient(90deg,#3da9fc,#90e0ef)',color:'#fff',fontWeight:700,fontSize:28,letterSpacing:1.5,borderRadius:16,marginBottom:24}}>Gestion des Projets</div>
  // <div style={{display:'flex',gap:32}}>
  //   <aside className="user-sidebar" style={{minWidth:320,maxWidth:400}}><ProjectForm onSubmit={...} onCancel={...}/></aside>
  //   <main style={{flex:3}}>{/* cartes projet */}</main>
  // </div>

  // Reset local state if the card is removed or initialData change
  React.useEffect(() => {
    setHovered(false);
    setMenu({ visible: false, x: 0, y: 0 });
    setShowConfirm(false);
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
  }, [initialData]);
  // Style harmonisé avec BuildingCard
  const cardWidth = 150;
  const cardHeight = 150;
  const contentPadding = 10;
  const [data, setData] = useState(initialData);
  // State pour la popup d'édition
  const [editPopupVisible, setEditPopupVisible] = useState(false);

  // Calcul du flux électrique net (entrant - sortant)
  // Entrant : tous les links dont targetId === data.id et type === 'electricity'
  // Sortant : tous les links dont source est ce projet et type === 'electricity'
  const allProjects = otherProjects.concat([data]);
  let electricityIn = 0;
  let electricityOut = 0;
  // Liens sortants de ce projet
  if (Array.isArray(data.links)) {
    data.links.forEach((link) => {
      if (link.type === "electricity" && typeof link.value === "number") {
        electricityOut += link.value;
      }
    });
  }
  // Liens entrants depuis les autres projets
  allProjects.forEach((proj) => {
    if (Array.isArray(proj.links)) {
      proj.links.forEach((link) => {
        if (
          link.type === "electricity" &&
          link.targetId === data.id &&
          typeof link.value === "number"
        ) {
          electricityIn += link.value;
        }
      });
    }
  });
  

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
    // Récupère la position du clic dans le repère du parent (Group)
    const pointer = e.target.getStage().getPointerPosition();
    setMenu((m) => ({
      ...m,
      visible: true,
      x: pointer.x - position.x,
      y: pointer.y - position.y,
    }));
    // Empêche le menu natif
    window.addEventListener("click", handleCloseMenu);
  };

  // Ferme le menu si clic ailleurs
  const handleCloseMenu = () => {
    // Préserve showParticipants lors de la fermeture du menu
    setMenu((m) => ({ ...m, visible: false }));
    window.removeEventListener("click", handleCloseMenu);
  };

  // Debug: vérifie l'état du menu à chaque rendu quand nécessaire
  // console.log("Menu state:", menu);

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
  
  const handleDelete = async () => {
    setMenu({ ...menu, visible: false });
    setHovered(false);
    setShowConfirm(false);
    setTooltip({ visible: false, text: "", x: 0, y: 0 });
    try {
      // Suppression via l'endpoint requis
      await api.delete(`house/houseDetails/${localStorage.getItem("api_session_userId")}/${data.id}`);
      if (onDelete) onDelete(data.id);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  // Ajout du drag comme dans BuildingCard
  const [dragPos, setDragPos] = useState(position);
 

  return (
    <Group
      x={dragPos.x+30}
      y={dragPos.y+30}
      opacity={fade}
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
      listening={true}
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
      
      {/* Menu contextuel personnalisé */}
      {menu.visible && !showConfirm && (
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
      {showConfirm && (
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