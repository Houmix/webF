import React, { useState, useEffect, useRef } from "react";
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

import BuildingCard from "./components/BuildingCard";
import EntityForm from "./components/EntityForm";
import ProjectCard from "./components/ProjectCard";
import PopupLinks from "./components/PopupLinks";
import PopupLinksList from "./components/PopupLinksList"; // Import the new component
import DrawLine from "./components/DrawLine";
import "./App.css";
import { useData } from "./DataContext";

// Composant App qui utilise le BuildingCard
function App() {
  const { api } = useData();
  // State pour forcer le rerender de DrawLine
  const [dummy, setDummy] = useState(0);
  const [buildings, setBuildings] = React.useState([]);

  // Fonction pour forcer le rerender de DrawLine
  const forceDrawLineRerender = () => setDummy((d) => d + 1);

  // S'assure que DrawLine se rafraîchit après chaque mise à jour des bâtiments
  useEffect(() => {
    forceDrawLineRerender();
  }, [buildings]);

  // Expose le trigger global pour les composants enfants (ex: PopupLinksList)
  useEffect(() => {
    window.forceDrawLineRerender = forceDrawLineRerender;
    return () => {
      delete window.forceDrawLineRerender;
    };
  }, []);

  // Onglet de recherche
  const [searchQuery, setSearchQuery] = useState("");

  // ...
  const [stagePan, setStagePan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);

const params = new URLSearchParams(window.location.search);
const houseId = params.get("id");
const userId = sessionStorage.getItem("userId");

console.log("houseId", houseId);
console.log("userId", userId);

React.useEffect(() => {
  if (!houseId || !userId) return;
  
    // utilisez directement 'api' ici, il est déjà accessible
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Récupère les champs du formulaire
    // (adapte selon tes inputs : name, type, photo, active, x, y, etc.)
    const entityData = {
      name,
      type,
      photo,
      active,
      x,
      y,
      // Ajoute d'autres champs si besoin
    };
  
    try {
      // Envoie la requête POST à l’API
      await api.post(`/house/entity/${houseId}/`, entityData);
      // Optionnel : callback de succès, reset form, fermer popup, etc.
      if (onCreated) onCreated();
    } catch (error) {
      alert("Erreur lors de la création de l'entité");
    }
  };


  const fetchAndConvertBuilding = async () => {
    try {
      const res = await api.get(`http://localhost:8000/house/houseDetails/${userId}/${houseId}/`);
      
      if (res.data) {
        // Conversion de la réponse API au format attendu
        const house = res.data;

        // Vérifier la présence d'entités
        if (house.entities && Array.isArray(house.entities)) {
          // Convertir chaque entity en "building"
          const convertedEntities = house.entities.map(entity => {
            // Extraire les links de cette entity
            const entityLinks = (entity.links || []).map(link => ({
              id: link.id,
              targetId: link.target,
              type: link.type,
              value: parseInt(link.value, 10) || 0
            }));

            // Construire l'objet entity converti
            return {
              id: entity.id,
              image:"http://localhost:8000/"+entity.photo || "",
              coords: {
                x: entity.x || 0,
                y: entity.y || 0
              },
              infos: {
                type: entity.type || "",
                name: entity.name || "",
                address: entity.address || ""
              },
              active: true,
              links: entityLinks
            };
          });

          setBuildings(convertedEntities);
          console.log('Entities converties:', convertedEntities);
        } else {
          setBuildings([]);
        }
      } else {
        console.error('Format de réponse inattendu:', res.data);
        setBuildings([]);
      }
    } catch (error) {
      setBuildings([]);
      if (error.response) {
        console.error('Erreur API:', error.response.status, error.response.data);
      } else {
        console.error('Erreur réseau:', error.message);
      }
    }
  };
  
  fetchAndConvertBuilding();
}, [houseId, userId, api]);

  // Gestion du drag/pan sur le fond du canevas
  const handleStageMouseDown = (e) => {
    // Ne pas activer le pan si on clique sur un BuildingCard (Group)
    // Fix: Use className property, not method
    if (
      e.target &&
      e.target.getParent() &&
      e.target.getParent().className === "Group"
    )
      return;

    // Touch event (mobile): record initial touch position, don't start pan yet
    if (e.evt && e.evt.type && e.evt.type.startsWith("touch")) {
      const touch = e.evt.touches
        ? e.evt.touches[0]
        : e.touches
          ? e.touches[0]
          : null;
      if (touch) {
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
        setPanStart({
          x: touch.clientX,
          y: touch.clientY,
          x0: stagePan.x,
          y0: stagePan.y,
        });
      }
      return;
    }

    // Mouse event (desktop): start pan immediately
    setIsPanning(true);
    const pos = e.evt
      ? { x: e.evt.clientX, y: e.evt.clientY }
      : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPanStart({ ...pos, x0: stagePan.x, y0: stagePan.y });
  };

  const handleStageMouseMove = (e) => {
    // Touch event: check threshold to start pan
    if (e.evt && e.evt.type && e.evt.type.startsWith("touch")) {
      const touch = e.evt.touches
        ? e.evt.touches[0]
        : e.touches
          ? e.touches[0]
          : null;
      if (!touch || !panStart) return;
      // If not panning yet, check threshold
      if (!isPanning && touchStartPos) {
        const dx = touch.clientX - touchStartPos.x;
        const dy = touch.clientY - touchStartPos.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          setIsPanning(true);
        } else {
          return;
        }
      }
      if (!isPanning) return;
      setStagePan({
        x: panStart.x0 + (touch.clientX - panStart.x),
        y: panStart.y0 + (touch.clientY - panStart.y),
      });
      return;
    }
    // Mouse event (desktop)
    if (!isPanning || !panStart) return;
    const pos = e.evt
      ? { x: e.evt.clientX, y: e.evt.clientY }
      : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setStagePan({
      x: panStart.x0 + (pos.x - panStart.x),
      y: panStart.y0 + (pos.y - panStart.y),
    });
  };

  const handleStageMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
    setTouchStartPos(null);
  };

  // --- Bandeau utilisateur ---
  const userName = "Jean Dupont"; // À remplacer par le vrai nom si gestion auth

  // Gestion recherche
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    // Initial set
    setStageSize({ width: window.innerWidth, height: window.innerHeight });
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const [linkMode, setLinkMode] = useState(null); // 'water' | 'electricity' | 'internet' | null
  const [selectedCardsForLink, setSelectedCardsForLink] = useState([]); // [id1, id2]
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkQuantity, setLinkQuantity] = useState("");

  // Validation du lien : ici tu peux compléter pour vraiment créer le lien dans le state
  const handleValidateLink = () => {
    if (selectedCardsForLink.length !== 2 || !linkMode || !linkQuantity) return;
    const [sourceId, targetId] = selectedCardsForLink;
    const quantity = parseInt(linkQuantity, 10);
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== sourceId) return b;
        // Ajoute le lien ET ajoute la quantité à la ressource correspondante
        return {
          ...b,
          links: [
            ...b.links,
            {
              id: `L${Date.now()}`,
              targetId,
              type: linkMode,
              quantity: quantity,
            },
          ],
          fluxStats: {
            ...b.fluxStats,
            [linkMode]: {
              ...b.fluxStats?.[linkMode],
              value: [
                ...b.links,
                {
                  id: `L${Date.now()}`,
                  targetId,
                  type: linkMode,
                  value: quantity,
                },
              ]
                .filter((link) => link.type === linkMode)
                .reduce(
                  (sum, link) => sum + (parseInt(link.value, 10) || 0),
                  0
                ),
            },
          },
        };
      })
    );
    // Reset
    setShowLinkPopup(false);
    setLinkMode(null);
    setSelectedCardsForLink([]);
    setLinkQuantity("");
    console.log("STRUCTURE BUILDINGS:", buildings);
  };

  // Mettre à jour la taille du Stage en fonction de la taille du conteneur
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

    // Initialiser la taille
    updateSize();

    // Observer les changements de taille de la div
    const ro = new window.ResizeObserver(updateSize);
    ro.observe(containerRef.current);

    // Mettre à jour la taille lors du redimensionnement de la fenêtre
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      if (containerRef.current) ro.unobserve(containerRef.current);
      ro.disconnect();
    };
  }, [containerRef]);

  // Gestion de la mise à jour des coordonnées
  const handlePositionChange = (updatedBuilding) => {
    // Mettre à jour l'état avec le bâtiment mis à jour
    setBuildings((prevBuildings) =>
      prevBuildings.map((building) =>
        building.id === updatedBuilding.id ? updatedBuilding : building
      )
    );

    // Only call API when the drag is finished (no realTimePosition property)
    if (!updatedBuilding.realTimePosition) {
      saveDataToServer(updatedBuilding);
    }
  };

  // Fonction pour sauvegarder les données sur le serveur
  const saveDataToServer = (buildingData) => {
    console.log("Sauvegarde des données:", buildingData);
    // API calls...
  };

  // État pour afficher ou cacher le formulaire
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    image: "",
    coordsX: 100,
    coordsY: 100,
    electricity: "",
    water: "",
    internet: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    // Structure à envoyer à l'API (adapter selon backend)
    const entityData = {
      name: formData.name,
      type: formData.type,
      photo: formData.image,
      active: true,
      x: Number(formData.coordsX),
      y: Number(formData.coordsY)
    };

    try {
      // Envoie la requête POST à l’API REST
      await api.post(`/house/entity/${houseId}/`, entityData);
      setFormSuccess("Projet créé avec succès !");
      // Rafraîchir la liste des bâtiments (optionnel)
      fetchAndConvertBuilding && fetchAndConvertBuilding();
      // Reset du formulaire
      setFormData({
        name: "",
        type: "",
        image: "",
        coordsX: 100,
        coordsY: 100,
      });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message || "Erreur lors de la création du projet");
    } finally {
      setFormLoading(false);
    }
  };

  // Popup links (état global)
  const [linksPopup, setLinksPopup] = useState({
    visible: false,
    data: null,
  });

  // PopupLinksList state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({
    sourceId: "",
    targetId: "",
    linkMode: "",
    links: [],
  });

  // Callback pour afficher la popup links depuis building card
  const onShowLinksPopup = (data) => {
    setLinksPopup({ visible: true, data });
  };

  // Callback pour fermer la popup links
  const onCloseLinksPopup = () => {
    setLinksPopup({ visible: false, data: null });
  };

  const onShowLinksList = (data) => {
    setPopupData({
      sourceId: data.sourceId,
      links: data.links,
      buildings: buildings, // Pour afficher les noms des bâtiments cibles
      readOnly: data.readOnly, // Ajouté pour propager le mode édition
    });
    setPopupVisible(true);
  };

  const handleValidate = (quantity) => {
    const newLink = {
      id: Date.now(),
      targetId: popupData.targetId,
      type: popupData.linkMode,
      value: quantity,
    };
    setPopupData((prev) => ({
      ...prev,
      links: [...prev.links, newLink],
    }));
    setPopupVisible(false);
  };

  const handleToggleActive = (updatedBuilding) => {
    // Mettre à jour l'état des bâtiments
    setBuildings((prevBuildings) =>
      prevBuildings.map((building) =>
        building.id === updatedBuilding.id ? updatedBuilding : building
      )
    );

    // Optionnel : Appeler l'API pour persister le changement
    saveDataToServer(updatedBuilding);
  };
  return (
    <>
      {/* Bandeau utilisateur */}
      <div className="user-banner">
        <button
          className="user-btn user-btn-main user-banner-btn"
          onClick={() => (window.location.href = "/")}
          title="Retour à l'accueil"
        >
          <span role="img" aria-label="Accueil">
            🏠
          </span>{" "}
          User
        </button>
        <div className="user-banner-user">
          👤 Bienvenue, <b>{userName}</b>
        </div>
      </div>
      {/* Popup de création de lien entre cartes */}
      {showLinkPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 14,
              minWidth: 340,
              boxShadow: "0 4px 16px #0002",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 8 }}>
              Quantité à transférer
            </h2>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>
              Type :{" "}
              <span style={{ color: "#3da9fc" }}>
                {linkMode === "water"
                  ? "Eau 💧"
                  : linkMode === "electricity"
                    ? "Électricité ⚡"
                    : "Internet 🌐"}
              </span>
            </div>
            <input
              type="text"
              placeholder={
                linkMode === "water"
                  ? "Ex: 100L"
                  : linkMode === "electricity"
                    ? "Ex: 24kW"
                    : "Ex: 200Mbps"
              }
              value={linkQuantity}
              onChange={(e) => setLinkQuantity(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 12,
                padding: 8,
                fontSize: 16,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
              autoFocus
            />
            <div
              style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => {
                  setShowLinkPopup(false);
                  setLinkMode(null);
                  setSelectedCardsForLink([]);
                  setLinkQuantity("");
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleValidateLink();
                  setShowLinkPopup(false);
                  setLinkMode(null);
                  setSelectedCardsForLink([]);
                  setLinkQuantity("");
                }}
                disabled={!linkQuantity}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Colonne formulaire à gauche */}
        <div className="form-column-bg">
          <button
            className="user-btn user-btn-main"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "❌ Fermer le formulaire" : "➕ Ajouter un projet"}
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <button
              style={{
                height: 48,
                fontSize: 18,
                background: linkMode === "water" ? "#b3e0ff" : undefined,
              }}
              title="Créer un lien Eau"
              onClick={() => {
                setLinkMode("water");
                setSelectedCardsForLink([]);
              }}
            >
              💧 Eau
            </button>
            <button
              style={{
                height: 48,
                fontSize: 18,
                background: linkMode === "electricity" ? "#ffe699" : undefined,
              }}
              title="Créer un lien Électricité"
              onClick={() => {
                setLinkMode("electricity");
                setSelectedCardsForLink([]);
              }}
            >
              ⚡ Électricité
            </button>
            <button
              style={{
                height: 48,
                fontSize: 18,
                background: linkMode === "internet" ? "#d9d9ff" : undefined,
              }}
              title="Créer un lien Internet"
              onClick={() => {
                setLinkMode("internet");
                setSelectedCardsForLink([]);
              }}
            >
              🌐 Internet
            </button>
          </div>
          {linkMode && (
            <div style={{ margin: "8px 0", color: "#555", fontSize: 14 }}>
              Sélectionnez deux cartes pour créer un lien <b>{linkMode}</b>.
              <br />
              <span style={{ fontSize: 12 }}>
                Sélection actuelle : {selectedCardsForLink.join(", ")}
              </span>
            </div>
          )}
          {showForm && (
            <div className="form-group-fullwidth">
  <EntityForm
    houseId={houseId}
    onCreated={() => {
      if (typeof fetchAndConvertBuilding === "function") fetchAndConvertBuilding();
      setShowForm(false);
    }}
    onCancel={() => setShowForm(false)}
  />
</div>
          )}
          {/* Onglet de recherche */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="🔍 Rechercher un bâtiment (nom ou type)"
              style={{
                fontSize: 18,
                padding: "8px 20px",
                borderRadius: 20,
                border: "1px solid #b3c2d1",
                background: "rgba(255,255,255,0.7)",
                outline: "none",
                minWidth: 350,
                margin: 0,
                boxShadow: "0 1px 8px #e0eafc",
              }}
            />
          </div>
        </div>

        {/* Zone d'affichage des cards à droite, indépendante */}
        <div className="card-area-bg" ref={containerRef}>
          {/* First, check if the PopupLinks should be visible */}
          {linksPopup.visible ? (
            <div
              className="popup-container"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PopupLinks
                visible={linksPopup.visible}
                data={linksPopup.data}
                stageWidth={stageSize.width}
                stageHeight={stageSize.height}
                onClose={() => {
                  setLinksPopup((p) => ({ ...p, visible: false }));
                  setSelectedCardsForLink([]);
                  setLinkMode(null);
                }}
                onValidate={(quantity) => {
                  const { sourceId, targetId, linkMode } =
                    linksPopup.data || {};
                  if (!sourceId || !targetId || !linkMode || !quantity) return;
                  setBuildings((prevBuildings) =>
                    prevBuildings.map((b) => {
                      if (b.id !== sourceId) return b;
                      // Ajout du lien dans la source
                      const newLink = {
                        id: `L${Date.now()}`,
                        targetId,
                        type: linkMode,
                        value: quantity,
                      };
                      // Calcul dynamique du fluxStats pour ce type
                      const allLinks = [...(b.links || []), newLink];
                      const sum = allLinks
                        .filter((l) => l.type === linkMode)
                        .reduce(
                          (acc, l) => acc + (parseInt(l.value, 10) || 0),
                          0
                        );
                      return {
                        ...b,
                        links: allLinks,
                        fluxStats: {
                          ...b.fluxStats,
                          [linkMode]: {
                            ...b.fluxStats?.[linkMode],
                            value: sum,
                          },
                        },
                      };
                    })
                  );
                  setLinksPopup((p) => ({ ...p, visible: false }));
                  setSelectedCardsForLink([]);
                  setLinkMode(null);
                  // Force redraw of lines after adding new link
                  forceDrawLineRerender();
                }}
              />
            </div>
          ) : popupVisible ? (
            /* Then check if the PopupLinksList should be visible */
            <div
              className="popup-container"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PopupLinksList
                visible={popupVisible}
                data={popupData}
                onClose={() => setPopupVisible(false)}
                onValidate={handleValidate}
                stageWidth={stageSize.width}
                stageHeight={stageSize.height}
                readOnly={popupData?.readOnly}
              />
            </div>
          ) : (
            /* If neither popup is visible, show the Stage with buildings */
            <Stage
              width={stageSize.width > 0 ? stageSize.width : 1200}
              height={stageSize.height > 0 ? stageSize.height : 700}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                maxWidth: "1200px",
              }}
              x={stagePan.x}
              y={stagePan.y}
              draggable={isPanning}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onTouchStart={handleStageMouseDown}
              onTouchMove={handleStageMouseMove}
              onTouchEnd={handleStageMouseUp}
            >
              <Layer>
                {/* Filtrage des bâtiments selon la recherche (contient, insensible à la casse) */}
                {(() => {
                  const query = searchQuery.trim().toLowerCase();
                  const filteredBuildings = !query
                    ? buildings
                    : buildings.filter((b) => {
                        const name = (b.infos?.name || "").toLowerCase();
                        const type = (b.infos?.type || "").toLowerCase();
                        return name.includes(query) || type.includes(query);
                      });
                  // Filtrer les connexions pour ne garder que celles entre cards visibles
                  const visibleIds = new Set(
                    filteredBuildings.filter((b) => b.active).map((b) => b.id)
                  );
                  const filteredForLines = buildings.map((b) => ({
                    ...b,
                    links: (b.links || []).filter(
                      (l) => visibleIds.has(b.id) && visibleIds.has(l.targetId)
                    ),
                  }));
                  return (
                    <>
                      <DrawLine
                        key={dummy}
                        buildings={filteredForLines.filter((b) =>
                          visibleIds.has(b.id)
                        )}
                      />
                      {filteredBuildings.map((building, idx) => (
                        <BuildingCard
                          key={building.id + "-building-" + idx}
                          initialData={building}
                          position={building.coords ? { x: building.coords.x, y: building.coords.y } : { x: 0, y: 0 }}
                          onPositionChange={(updatedBuilding) => {
                            handlePositionChange(updatedBuilding);
                            setDummy((d) => d + 1);
                          }}
                          onCardClick={(id) => {
                            if (!linkMode) return;
                            setSelectedCardsForLink((prev) => {
                              if (prev.includes(id)) return prev;
                              if (prev.length < 2) {
                                const next = [...prev, id];
                                if (next.length === 2) {
                                  // Open the popup for link creation
                                  setLinksPopup({
                                    visible: true,
                                    data: {
                                      sourceId: next[0],
                                      targetId: next[1],
                                      linkMode,
                                    },
                                  });
                                }
                                return next;
                              }
                              return prev;
                            });
                          }}
                          isSelectedForLink={selectedCardsForLink.includes(
                            building.id
                          )}
                          linkMode={linkMode}
                          onShowLinksList={onShowLinksList}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </>
                  );
                })()}
              </Layer>
            </Stage>
          )}
        </div>
      </div>
    </>
  );
}
export default App;