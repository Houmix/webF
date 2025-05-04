import React, { useState, useEffect } from "react";
import useImage from "use-image";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Line,
  Text,
  Group,
  Image,
} from "react-konva";
import PopupLinks from "./PopupLinks";

import { useData } from "../DataContext";

function BuildingCard({
  initialData,
  onPositionChange,
  otherCards = [],
  isHighlighted = false,
  onCardClick,
  isSelectedForLink = false,
  onShowParticipantsPopup, // Pour la gestion participants
  onContextMenu, // Pour la gestion du menu contextuel
  onShowLinksList, // Nouveau prop pour afficher la liste des liens
  onToggleActive,
}) {
  // Card dimensions
  const cardWidth = 150;
  const cardHeight = 200;
  const sceneHeight = 100;
  const contentPadding = 10;

  // API context
  const { api } = useData();

  // State pour les coordonnées et les données du bâtiment
  const [data, setData] = useState(initialData);

  // Function to update an entity (PUT)
  const handleUpdateEntity = async (entityId, updatedFields) => {
    const entityData = {
      active: Boolean(updatedFields.active),
      user_id: 2
    };


    try {
      const response = await api.put(`house/entity/${entityId}/`, entityData);
      // Optionally update local state if needed
      setData(prev => ({ ...prev, ...updatedFields }));
      return response;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entité:", error);
      throw error;
    }
  };


  // Sécurité pour éviter erreur si fluxStats absent
  const safeFluxStats = data.fluxStats || {
    electricity: { value: 0 },
    water: { value: 0 },
    internet: { value: 0 },
  };

  const [position, setPosition] = useState({
    x: initialData.coords.x || 0,
    y: initialData.coords.y || 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Mise à jour des données lorsque les props changent
  useEffect(() => {
    setData(initialData);
    setPosition({
      x: initialData.coords.x || 0,
      y: initialData.coords.y || 0,
    });
  }, [initialData]);

  // Fonction pour gérer le début du déplacement
  const handleDragStart = (e) => {
    // Arrêter la propagation pour éviter que le stage ne commence aussi à être déplacé
    e.evt.stopPropagation();
    setIsDragging(true);
  };

  // Fonction pour gérer le déplacement
  const handleDragMove = (e) => {
    // Arrêter la propagation pour éviter que le stage ne soit déplacé en même temps
    e.evt.stopPropagation();

    const newPosition = {
      x: e.target.x(),
      y: e.target.y(),
    };

    setPosition(newPosition);

    // Mise à jour en temps réel pour les lignes
    const updatedData = {
      ...data,
      realTimePosition: newPosition, // Add realtime position for line updates
      coords: {
        x: newPosition.x,
        y: newPosition.y,
      },
    };

    // Notifier le composant parent du changement de position en temps réel
    if (onPositionChange) {
      onPositionChange(updatedData);
    }
  };

  // Fonction pour gérer la fin du déplacement
  const handleDragEnd = (e) => {
    // Arrêter la propagation
    e.evt.stopPropagation();

    setIsDragging(false);

    // Mettre à jour les données avec les nouvelles coordonnées
    const updatedData = {
      ...data,
      coords: {
        x: position.x,
        y: position.y,
      },
      // Remove the realTimePosition property as it's no longer needed
      realTimePosition: undefined,
    };

    // Sauvegarder les données mises à jour
    setData(updatedData);

    // Notifier le composant parent du changement de position
    if (onPositionChange) {
      onPositionChange(updatedData);
    }
  };

  // Obtenir la couleur pour chaque type d'utilité
  const getUtilityColor = (type) => {
    switch (type) {
      case "electricity":
        return "#FFD700"; // Or pour l'électricité
      case "water":
        return "#4682B4"; // Bleu acier pour l'eau
      case "internet":
        return "#32CD32"; // Vert lime pour internet
      default:
        return "#CCCCCC";
    }
  };

  const [image] = useImage(data.image);

  // Gestion du clic pour création de lien
  const handleCardClick = (e) => {
    if (onCardClick) {
      e.cancelBubble = true; // Pour éviter de déclencher d'autres handlers
      onCardClick(initialData.id);
    }
  };

  // --- MENU CONTEXTUEL (popup clic droit) ---
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });

  // Ferme le menu si un autre BuildingCard ouvre le sien
  useEffect(() => {
    const closeListener = () => setMenu((m) => ({ ...m, visible: false }));
    window.addEventListener("closeAllBuildingMenus", closeListener);
    return () =>
      window.removeEventListener("closeAllBuildingMenus", closeListener);
  }, []);

  // Gère le clic droit pour afficher le menu contextuel
  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    // Ferme tous les autres menus contextuels
    window.dispatchEvent(new Event("closeAllBuildingMenus"));
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

  // Action Modifier (placeholder)
  const handleEdit = () => {
    setMenu({ ...menu, visible: false });
    // TODO : déclencher l'action édition bâtiment ici
    alert("Modifier bâtiment (à implémenter)");
  };

  // Action Supprimer (placeholder)
  const handleDelete = () => {
    setMenu({ ...menu, visible: false });
    setShowConfirm(false);
    // TODO : déclencher la suppression réelle ici
    alert("Suppression bâtiment (à implémenter)");
  };

  const handleToggleActive = async (e) => {
  // Stop propagation to avoid event bubbling
  e.cancelBubble = true;
  e.evt.stopPropagation();

  const updatedActive = !data.active;
  const updatedFields = {
    ...data,
    active: updatedActive,
  };

  // Optimistic update
  setData(prev => ({ ...prev, active: updatedActive }));

  try {
    await handleUpdateEntity(data.id, { active: updatedActive });
    // Optionally notify parent
    if (onToggleActive) {
      onToggleActive({ ...data, active: updatedActive });
    }
  } catch (error) {
    // Revenir à l'état précédent en cas d'erreur
    setData(prev => ({ ...prev, active: !updatedActive }));
    console.error('Failed to update entity status', error);
  }
};

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
    >
      {/* Reste du code inchangé */}
      {/* Fond de la carte */}
      <Rect
        x={0}
        y={0}
        width={cardWidth}
        height={cardHeight}
        fill={
          isHighlighted ? "#e3f2fd" : isSelectedForLink ? "#fffbe6" : "#fff"
        }
        stroke={isSelectedForLink ? "#ffb300" : "#3da9fc"}
        strokeWidth={isHighlighted || isSelectedForLink ? 3 : 1}
        cornerRadius={12}
        shadowBlur={isDragging ? 12 : 3}
        shadowColor={isDragging ? "#3da9fc" : "#aaa"}
      />
      {/* Section supérieure / en-tête */}
      <Rect
        x={0}
        y={0}
        width={cardWidth}
        height={sceneHeight}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: sceneHeight }}
        fillLinearGradientColorStops={[0, "#00b4d8", 1, "#90e0ef"]}
        cornerRadius={[15, 15, 0, 0]}
      />

      {/* Identifiant du bâtiment */}
      <Text
        x={10}
        y={10}
        text={data.id}
        fontSize={14}
        fontFamily="Arial"
        fill="white"
        fontStyle="bold"
      />

      {/* Texte de la section supérieure */}
      <Text
        x={cardWidth / 2}
        y={10}
        text={data.infos.name}
        fontSize={16}
        fontFamily="Arial"
        fill="white"
        align="center"
        fontStyle="bold"
        offsetX={data.infos.name.length * 4} // Centrage approximatif
      />

      {/* Visualisation de la maison dans l'en-tête */}
      {image ? (
        <Image
          x={cardWidth / 2 - 50}
          y={sceneHeight / 2 - 20}
          image={image}
          width={100}
          height={60}
          cornerRadius={[5, 5, 5, 5]}
        />
      ) : (
        <>
          <Rect
            x={cardWidth / 2 - 20}
            y={sceneHeight / 2}
            width={40}
            height={30}
            fill="white"
            shadowBlur={3}
            shadowColor="rgba(0,0,0,0.3)"
          />
          <Rect
            x={cardWidth / 2 - 25}
            y={sceneHeight / 2 - 15}
            width={50}
            height={15}
            fill="white"
            shadowBlur={3}
            shadowColor="rgba(0,0,0,0.3)"
            cornerRadius={[5, 5, 0, 0]}
          />
          <Rect
            x={cardWidth / 2 - 8}
            y={sceneHeight / 2 + 10}
            width={16}
            height={20}
            fill="#e36b9a"
          />
        </>
      )}

      {/* Section d'information */}
      <Group x={contentPadding} y={sceneHeight}>
        {/* Nom du bâtiment */}
        <Rect
          x={0 - 10}
          y={0}
          width={cardWidth}
          height={sceneHeight}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: sceneHeight }}
          fillLinearGradientColorStops={[1, "#00b4d8", 0, "#90e0ef"]}
          cornerRadius={[0, 0, 15, 15]}
        />
        {/* Nom du bâtiment */}
        <Text
          text={data.infos.type}
          fontSize={12}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#333333"
          width={cardWidth - 2 * contentPadding}
        />

        {/* Adresse du bâtiment */}
        <Text
          y={16}
          text={data.infos.address}
          fontSize={8}
          fontFamily="Arial"
          fill="#666666"
          width={cardWidth - 2 * contentPadding}
        />

        {/* En-tête des statistiques */}
        <Text
          y={32}
          text="Statistiques des ressources"
          fontSize={9}
          fontFamily="Arial"
          fontStyle="bold"
          fill="#333333"
          width={cardWidth - 2 * contentPadding}
        />

        {/* Liste des entités */}
        {data.entities && data.entities.map((entity, idx) => (
          <Group key={entity.id} y={45 + idx * 25}>
            {/* Image de l'entité si besoin : <Image src={entity.photo} ... /> */}
            <Text
              x={0}
              text={entity.name + (entity.on ? " (On)" : " (Off)")}
              fontSize={8}
              fontFamily="Arial"
              fill={entity.on ? '#43a047' : '#b71c1c'}
            />
            {/* Statistiques de flux pour chaque entité */}
            {entity.flux_stats && entity.flux_stats.map((stat, i) => (
              <Text
                key={i}
                x={80}
                text={`${stat.flux_type}: ${stat.value}`}
                fontSize={7}
                fill="#666"
              />
            ))}
          </Group>
        ))}

        {/* Liste des profils utilisateurs */}
        {data.profiles && data.profiles.map((profile, idx) => (
          <Text
            key={profile.user_id}
            y={140 + idx * 10}
            text={`${profile.user_name} (lvl ${profile.lvl})`}
            fontSize={7}
            fill="#888"
          />
        ))}

        {/* Statistiques d'électricité */}
        <Group y={45}>
          <Circle radius={4} fill={getUtilityColor("electricity")} />
          <Text
            x={10}
            text="Électricité"
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
          />
          <Text
            x={cardWidth - 7 * contentPadding - 5}
            text={`${data.links
              ?.filter((link) => link.type === "electricity")
              .reduce(
                (sum, link) => sum + (parseInt(link.value, 10) || 0),
                0
              )}\u00A0`}
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
            align="right"
            width={45}
          />
        </Group>

        {/* Statistiques d'eau */}
        <Group y={60}>
          <Circle radius={4} fill={getUtilityColor("water")} />
          <Text
            x={10}
            text="Eau"
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
          />
          <Text
            x={cardWidth - 7 * contentPadding - 5}
            text={`${data.links
              ?.filter((link) => link.type === "water")
              .reduce(
                (sum, link) => sum + (parseInt(link.value, 10) || 0),
                0
              )}\u00A0L`}
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
            align="right"
            width={45}
          />
        </Group>

        {/* Statistiques d'internet */}
        <Group y={75}>
          <Circle radius={4} fill={getUtilityColor("internet")} />
          <Text
            x={10}
            text="Internet"
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
          />
          <Text
            x={cardWidth - 7 * contentPadding - 5}
            text={`${data.links
              ?.filter((link) => link.type === "internet")
              .reduce(
                (sum, link) => sum + (parseInt(link.value, 10) || 0),
                0
              )}\u00A0Mbps`}
            fontSize={8}
            fontFamily="Arial"
            fill="#333333"
            align="right"
            width={55}
          />
        </Group>

        {/* Coordonnées actuelles */}
        <Text
          y={95}
          text={`Position: (${Math.round(position.x)}, ${Math.round(position.y)})`}
          fontSize={6}
          fontFamily="Arial"
          fill="#999999"
        />
        <Group x={cardWidth - 40} y={85} onClick={handleToggleActive} style={{ cursor: 'pointer' }}>
  {/* Fond du switch */}
  <Rect
    width={24}
    height={14}
    fill={data.active ? "#4ade80" : "#fca5a5"}
    cornerRadius={7}
    stroke={data.active ? "#16a34a" : "#ef4444"}
    strokeWidth={1}
  />
  {/* Bouton du switch */}
  <Circle
    x={data.active ? 16 : 8}
    y={7}
    radius={6}
    fill={data.active ? "#16a34a" : "#ffffff"}
    stroke={data.active ? "#15803d" : "#ef4444"}
    strokeWidth={1}
    shadowBlur={2}
    shadowColor="rgba(0,0,0,0.3)"
  />
</Group>
      </Group>

      {/* Menu contextuel personnalisé */}
      {menu.visible && !showConfirm && (
        <Group x={0} y={0} listening={true}>
          <Rect
            width={160}
            height={90}
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
            onMouseEnter={() =>
              setTooltip({
                visible: true,
                text: "Modifier ce bâtiment",
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
            onMouseEnter={() =>
              setTooltip({
                visible: true,
                text: "Supprimer ce bâtiment",
                x: menu.x + 160,
                y: menu.y + 38,
              })
            }
            onMouseLeave={() =>
              setTooltip({ visible: false, text: "", x: 0, y: 0 })
            }
          />
          {/* Links */}
          {/* Links */}
          <Text
            text="Links"
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
              if (onShowLinksList) {
                onShowLinksList({
                  sourceId: data.id,
                  links: data.links || [],
                });
              }
              setMenu({ visible: false, x: 0, y: 0 }); // Fermer le menu contextuel
            }}
            onMouseEnter={() =>
              setTooltip({
                visible: true,
                text: "Gérer les liens",
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

export default BuildingCard;

