import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import ProjectCard from "./components/ProjectCard";
import ParticipantsPopup from "./components/ParticipantsPopup";
import ProjectForm from "./components/ProjectForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./HomePannel.css";
import { useData } from "./DataContext";

function HomePannel() {
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  
  const {
    buildings,
    loading,
    error,
    userId,
    getAllUserData,
    api,
  } = useData();

  // State local pour les projets (et non plus via le contexte)
  const [projects, setProjects] = useState([]);

  
  const navigate = useNavigate();

  const handleDoubleClick = (projectId) => {
    console.log("Double-clic sur le projet:", projectId);
    navigate("/app/?id="+projectId);
  };

  const [positionedProjects, setPositionedProjects] = useState([]);

  // Fonction pour rafraîchir les projets (appelée depuis ParticipantsPopup)
  const refreshProjects = async () => {
    if (!userId) return;
    try {
      const data = await getAllUserData(userId);
      if (Array.isArray(data)) {
        setProjects(data);
        console.log('Projets récupérés:', data);
      } else if (data && Array.isArray(data.projects)) {
        setProjects(data.projects);
        console.log('Projets récupérés:', data.projects);
      } else {
        setProjects([]);
        console.warn('Aucun projet trouvé dans la réponse API', data);
      }
    } catch (error) {
      setProjects([]);
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  // Charger les projets au montage
  useEffect(() => {
    if (!userId) return;
    getAllUserData(userId)
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
          console.log('Projets récupérés:', data);
        } else if (data && Array.isArray(data.projects)) {
          setProjects(data.projects);
          console.log('Projets récupérés:', data.projects);
        } else {
          setProjects([]);
          console.warn('Aucun projet trouvé dans la réponse API', data);
        }
      })
      .catch(error => {
        setProjects([]);
        console.error('Erreur lors du chargement des projets:', error);
      });
  }, [userId, getAllUserData, setProjects]);




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
    editMode: false,
  });

  // Callback pour afficher la popup participants depuis ProjectCard
  const handleShowParticipantsPopup = (data, editMode = false) => {
    setParticipantsPopup({ visible: true, data, editMode });
  };

  return (
    <>
      <div className="user-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', gap: 12, minHeight: 48 }}>
        <span style={{ flex: 0, fontWeight: 600, fontSize: 22, color: 'black' }}>Gestion des Projets</span>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(90deg,#3da9fc,#90e0ef)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 18px',
            fontWeight: 600,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 1px 4px #3da9fc33',
            transition: 'background 0.2s',
            color: 'black',
          }}
        >
          Revenir à l'accueil
        </button>
      </div>
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
                editMode={participantsPopup.editMode}
                onClose={() =>
                  setParticipantsPopup((p) => ({ ...p, visible: false }))
                }
                onParticipantsUpdate={refreshProjects}
                refreshProjects={refreshProjects}
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
                    onParticipantsUpdate={refreshProjects}
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
