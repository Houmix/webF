import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import ProjectCard from "./components/ProjectCard";
import ParticipantsPopup from "./components/ParticipantsPopup";
import ProjectForm from "./components/ProjectForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./HomePannel.css";

function HomePannel() {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  console.log(userId);

  const [projects, setProjects] = useState([
    {
      id: "E001",
      image: "",
      name: "MAISON FAMILIALE",
      peopleInIt: [
        {
          id: "E001-0",
          name: "Thomas Bernard",
          role: "Propriétaire",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "E001-1",
          name: "Julie Bernard",
          role: "Propriétaire",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "E001-2",
          name: "Antoine Dubois",
          role: "Architecte",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "E001-3",
          name: "Marie Lefèvre",
          role: "Décoratrice",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
      ],
    },
    {
      id: "E002",
      image: "",
      name: "ÉCOLE PRIMAIRE JULES FERRY",
      peopleInIt: [
        {
          id: "E002-0",
          name: "François Moreau",
          role: "Directeur",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "E002-1",
          name: "Céline Petit",
          role: "Enseignante",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
        {
          id: "E002-2",
          name: "Laurent Girard",
          role: "Responsable technique",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "E002-3",
          name: "Nathalie Simon",
          role: "Secrétaire",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
      ],
    },
    {
      id: "E003",
      image: "",
      name: "CENTRE COMMERCIAL GRAND PLACE",
      peopleInIt: [
        {
          id: "USR301",
          name: "Philippe Durand",
          role: "Directeur général",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "USR302",
          name: "Sandrine Leroy",
          role: "Responsable marketing",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "USR303",
          name: "Marc Lambert",
          role: "Agent de sécurité",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
        {
          id: "USR304",
          name: "Aurélie Fontaine",
          role: "Gestionnaire locatif",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
      ],
    },
    {
      id: "E004",
      image: "",
      name: "BIBLIOTHÈQUE MUNICIPALE",
      peopleInIt: [
        {
          id: "USR401",
          name: "Hélène Rousseau",
          role: "Bibliothécaire en chef",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "USR402",
          name: "Michel Blanc",
          role: "Responsable section jeunesse",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "USR403",
          name: "Emilie Roux",
          role: "Archiviste",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "USR404",
          name: "David Martin",
          role: "Assistant bibliothécaire",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
      ],
    },
    {
      id: "E006",
      image: "",
      name: "BUREAUX TECH INNOV",
      peopleInIt: [
        {
          id: "USR601",
          name: "Sophie Martin",
          role: "PDG",
          permissions: { view: true, edit: true },
          isOwner: true,
        },
        {
          id: "USR602",
          name: "Lucas Dubois",
          role: "Directeur technique",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "USR603",
          name: "Camille Perrin",
          role: "Gestionnaire d'espace",
          permissions: { view: true, edit: true },
          isOwner: false,
        },
        {
          id: "USR604",
          name: "Julien Mercier",
          role: "Responsable sécurité",
          permissions: { view: true, edit: false },
          isOwner: false,
        },
      ],
    },
  ]);

  const navigate = useNavigate();

  const handleDoubleClick = (projectId) => {
    console.log("Double-clic sur le projet:", projectId);
    navigate("/app");
  };

  const [positionedProjects, setPositionedProjects] = useState([]);

  // Définition de la taille des cartes (synchronisé avec ProjectCard.jsx)
  const cardWidth = 150;
  const cardHeight = 200;
  const cardMargin = 50;

  // Calculate positions based on the number of elements and canvas size
  const calculatePositions = () => {
    if (!containerRef.current || projects.length === 0) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    // Pour chaque nombre de projets, ajuste le nombre de cartes par ligne pour que la grille soit toujours centrée
    let elementsPerRow = Math.floor(
      (width - cardMargin) / (cardWidth + cardMargin)
    );
    elementsPerRow = Math.max(1, Math.min(projects.length, elementsPerRow));
    const rows = Math.ceil(projects.length / elementsPerRow);

    // Largeur totale des cartes + marges sur une ligne
    const totalCardsWidth =
      elementsPerRow * cardWidth + (elementsPerRow - 1) * cardMargin;
    // Hauteur totale des lignes + marges
    const totalCardsHeight = rows * cardHeight + (rows - 1) * cardMargin;

    // Décalage pour centrer la grille
    const offsetX = Math.max(0, (width - totalCardsWidth) / 2);
    const offsetY = Math.max(0, (height - totalCardsHeight) / 2);

    let updatedProjects = [];
    let currentIndex = 0;
    for (let row = 0; row < rows; row++) {
      const cardsThisRow =
        row === rows - 1
          ? projects.length - row * elementsPerRow
          : elementsPerRow;
      for (let col = 0; col < cardsThisRow; col++) {
        const project = projects[currentIndex];
        updatedProjects.push({
          ...project,
          position: {
            x: col * (cardWidth + cardMargin),
            y: row * (cardHeight + cardMargin),
          },
        });
        currentIndex++;
      }
    }
    setPositionedProjects(updatedProjects);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };
    // Gestion du resize + recalcul sur Esc (pour popup)
    updateSize();
    window.addEventListener("resize", updateSize);
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setPositionedProjects((prev) => [...prev]);
      }
    };
    window.addEventListener("keydown", handleEsc);
    // Log temporaire pour debug canevas
    console.log(
      "Taille canevas:",
      stageSize,
      containerRef.current?.offsetWidth,
      containerRef.current?.offsetHeight
    );
    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Calculer les positions lorsque la taille de la scène change ou que les projets changent
  useEffect(() => {
    calculatePositions();
  }, [stageSize, projects]);

  // État pour le projet en édition
  const [editProject, setEditProject] = useState(null);

  // Callback suppression projet
  const handleDeleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Callback édition projet
  const handleEditProject = (projectData) => {
    setEditProject(projectData);
    // Ici, tu peux ouvrir un panneau ou pré-remplir le formulaire d'ajout avec editProject
    // Par exemple : scrollToForm();
  };

  // Ajout d'un nouveau projet
  const handleAddProject = (projectData) => {
    // Génère un ID unique (timestamp ou incrémental)
    const newId = `E${Date.now()}`;
    // Structure le projet selon le format attendu par ProjectCard
    const newProject = {
      id: newId,
      ...projectData,
    };
    setProjects((prev) => [...prev, newProject]);
    setEditProject(null); // Reset edit mode if active
  };

  // Popup participants (état global)
  const [participantsPopup, setParticipantsPopup] = useState({
    visible: false,
    data: null,
  });

  // Callback pour afficher la popup participants depuis ProjectCard
  const handleShowParticipantsPopup = (data) => {
    setParticipantsPopup({ visible: true, data });
  };

  return (
    <>
      <div className="user-header">Gestion des Projets</div>
      <div className="user-home-main">
        <aside className="user-sidebar">
          <ProjectForm onSubmit={handleAddProject} onCancel={() => {}} />
        </aside>
        <div className="user-canvas-area-bg" ref={containerRef}>
          {participantsPopup.visible ? (
            <div
              className="popup"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <ParticipantsPopup
                visible={participantsPopup.visible}
                data={participantsPopup.data}
                onClose={() =>
                  setParticipantsPopup((p) => ({ ...p, visible: false }))
                }
              />
            </div>
          ) : (
            stageSize.width > 0 &&
            stageSize.height > 0 && (
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <Layer>
                  {positionedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      initialData={project}
                      position={project.position}
                      otherProjects={positionedProjects.filter(
                        (p) => p.id !== project.id
                      )}
                      onDoubleClick={() => handleDoubleClick(project.id)}
                      onTap={() => handleDoubleClick(project.id)}
                      onDelete={handleDeleteProject}
                      onEdit={handleEditProject}
                      editProjectId={editProject?.id}
                      onShowParticipantsPopup={handleShowParticipantsPopup}
                    />
                  ))}
                </Layer>
              </Stage>
            )
          )}
        </div>
      </div>
    </>
  );
}

export default HomePannel;
