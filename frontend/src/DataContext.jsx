// DataContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import axiosClient from "./axiosClient";

// Créez le contexte
const DataContext = createContext();

// Créez un hook personnalisé pour utiliser ce contexte
export const useData = () => useContext(DataContext);

// Fonction utilitaire pour obtenir les paramètres d'URL
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
  };
};

// Créez le provider qui enveloppera votre application
export const DataProvider = ({ children, requestUrl, type, userId: userIdProp }) => {
  // Récupérer l'ID utilisateur depuis props, sessionStorage ou localStorage
  const userId = userIdProp || sessionStorage.getItem("userId") || localStorage.getItem("api_session_userId");
  // Récupérer l'ID de l'URL
  const [urlParams] = useState(getUrlParams());
  const [buildings, setBuildings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  // Fonction pour convertir le format de données de l'API vers le format projects
  const convertBuildingsToProjects = (buildingsData) => {
    if (!Array.isArray(buildingsData)) {
      console.error("Les données ne sont pas un tableau:", buildingsData);
      return [];
    }

    return buildingsData.map((building) => {
      // Créer des personnes basées sur les entités du bâtiment
      const peopleInIt = building.entities.map((entity, index) => {
        const isOwner = index === 0;
        return {
          id: `${building.id}-${index}`,
          name: `${entity.type}`,
          role: isOwner ? "Propriétaire" : "Utilisateur",
          permissions: {
            view: true,
            edit: entity.on,
          },
          isOwner: isOwner,
        };
      });

      return {
        id: `E${String(building.id).padStart(3, "0")}`,
        image: building.photo || "",
        name: building.adress.toUpperCase(),
        peopleInIt: peopleInIt,
      };
    });
  };

  // Stocker l'ID dans le stockage de session (sessionStorage)
  useEffect(() => {
    if (urlParams.id) {
      // Utiliser sessionStorage pour conserver l'ID pendant toute la session
      sessionStorage.setItem("currentId", urlParams.id);
      console.log(`ID ${urlParams.id} stocké dans sessionStorage`);
    }
  }, [urlParams.id]);

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Essayer de récupérer la session depuis le backend
        const response = await axiosClient.get("/api/check-session");
        setSession(response.data);
      } catch (err) {
        // Si l'erreur est 404, utiliser le sessionStorage comme fallback
        console.warn(
          "L'API de session n'est pas disponible. Utilisation de sessionStorage."
        );

        // Créer une session basique avec l'ID de l'URL si disponible
        if (urlParams.id || sessionStorage.getItem("currentId")) {
          const id = urlParams.id || sessionStorage.getItem("currentId");
          const mockSession = {
            id: id,
            authenticated: true,
          };
          setSession(mockSession);
        }
      }
    };

    checkSession();
  }, [urlParams.id]);

  // Modification de l'appel API pour récupérer les données en utilisant l'ID
  useEffect(() => {
    const fetchBuildingsWithId = async () => {
      setLoading(true);
      setError(null);

      // Récupérer l'ID depuis l'URL ou sessionStorage
      const id = urlParams.id || sessionStorage.getItem("currentId");

      if (!id) {
        setError("ID non trouvé");
        setLoading(false);
        return;
      }

      // Construire l'URL avec l'ID
      let url = requestUrl;
      if (url.includes("?")) {
        url += `&id=${id}`; // URL a déjà des paramètres
      } else {
        url += `?id=${id}`; // Ajouter le premier paramètre
      }

      try {
        const response = await axiosClient.get(url);
        const data = response.data;

        setBuildings(data);
        localStorage.setItem(`${type}_${id}`, JSON.stringify(data)); // Stocker avec l'ID

        const convertedProjects = convertBuildingsToProjects(data);
        setProjects(convertedProjects);
      } catch (e) {
        console.error("Erreur de récupération:", e.message);
        setError(`Erreur de réseau: ${e.message}`);

        // Essayer de récupérer depuis localStorage avec l'ID
        const savedWithId = localStorage.getItem(`${type}_${id}`);
        if (savedWithId) {
          try {
            const parsedData = JSON.parse(savedWithId);
            setBuildings(parsedData);
            const convertedProjects = convertBuildingsToProjects(parsedData);
            setProjects(convertedProjects);
            console.log(`Données récupérées du localStorage pour ID ${id}`);
          } catch (e) {
            console.error("Erreur de parsing du localStorage:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (buildings.length === 0 && !loading && !error) {
      fetchBuildingsWithId();
    }
  }, [buildings.length, requestUrl, type, loading, error, urlParams.id]);

  // Fonction pour supprimer une entité (projet ou bâtiment)
  const deleteEntity = async (entityId) => {
    try {
      await axiosClient.delete(`/house/entity/${entityId}/`);
      setProjects((prev) => prev.filter((p) => p.id !== entityId));
      setBuildings((prev) => prev.filter((b) => b.id !== entityId));
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour créer une maison
  const createHouse = async (userId, houseData) => {
    try {
      const response = await axiosClient.post(`/house/house/${userId}/`, houseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour créer une entité
  const createEntity = async (houseId, entityData) => {
    try {
      const response = await axiosClient.post(`/house/entity/${houseId}/`, entityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour créer un lien
  const createLink = async (linkData) => {
    try {
      const response = await axiosClient.post(`/house/link/`, linkData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour obtenir toutes les maisons, entités et liens d'un utilisateur
  const getAllUserData = async (userId) => {
    try {
      const response = await axiosClient.get(`/house/house/${userId}`);
      console.log("getAllUserData");
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour obtenir la liste des personnes liées à une maison
  const getPeopleInHouse = async (houseId) => {
    try {
      const response = await axiosClient.get(`/peopleInHouse/${houseId}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Met à jour un projet (PATCH ou PUT selon l'API)
  const updateProject = async (project) => {
    try {
      // PATCH si partiel, PUT si tout l'objet. À adapter selon le backend.
      const response = await axiosClient.patch(`/house/house/${project.id}/`, project);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // La valeur que vous souhaitez partager
  const value = {
    buildings,
    setBuildings,
    projects,
    setProjects,
    loading,
    setLoading,
    error,
    setError,
    session,
    deleteEntity,
    createHouse,
    createEntity,
    createLink,
    getAllUserData,
    getPeopleInHouse,
    userId, // Expose userId partout dans l'app
    currentId: urlParams.id || sessionStorage.getItem("currentId"), // Exposer l'ID actuel
    api: axiosClient,
    updateProject,

    // Ajouter une méthode utilitaire pour construire des URLs avec l'ID
    buildUrlWithId: (baseUrl) => {
      const id = urlParams.id || sessionStorage.getItem("currentId");
      if (!id) return baseUrl;

      if (baseUrl.includes("?")) {
        return `${baseUrl}&id=${id}`;
      } else {
        return `${baseUrl}?id=${id}`;
      }
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
