import { APP_VERSION, LAST_ARMY_UPDATE_VERSION } from '../config';
import { Army } from '../types/army';

const VERSION_KEY = 'app_version';

// Fonction pour extraire la version numérique
const getNumericVersion = (version: string): number[] => {
  // Si la version est 'dev', retourner [0, 0, 0]
  if (version === 'dev') return [0, 0, 0];
  
  // Supprimer tout ce qui suit un tiret ou un espace (alpha, beta, etc.)
  const cleanVersion = version.split(/[- ]/)[0];
  return cleanVersion.split('.').map(num => parseInt(num, 10));
};

// Fonction pour comparer deux versions
const compareVersions = (version1: string, version2: string): number => {
  const v1 = getNumericVersion(version1);
  const v2 = getNumericVersion(version2);

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
};

// Fonction pour supprimer les armées obsolètes
const removeObsoleteArmies = (): void => {
  const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
  const updatedArmies = armies.filter((army: Army) => {
    // Garder uniquement les armées qui n'ont pas de version ou dont la version est >= à la version de mise à jour requise
    return !army.version || compareVersions(army.version, LAST_ARMY_UPDATE_VERSION) >= 0;
  });
  localStorage.setItem('army_list', JSON.stringify(updatedArmies));
  // Recharger la page
  window.location.reload();
};

// Fonction pour marquer les armées comme obsolètes
const markArmiesAsObsolete = (): void => {
  const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
  const updatedArmies = armies.map((army: Army) => {
    // Si l'armée n'a pas de version ou si sa version est inférieure à la version de mise à jour requise
    if (!army.version || compareVersions(army.version, LAST_ARMY_UPDATE_VERSION) < 0) {
      return {
        ...army,
        obsolete: true
      };
    }
    return army;
  });
  localStorage.setItem('army_list', JSON.stringify(updatedArmies));
  // Recharger la page
  window.location.reload();
};

export const VersionService = {
  // Vérifie si la version a changé et si le stockage doit être effacé
  checkVersion: async (): Promise<void> => {
    // En mode dev, on ignore la vérification des armées obsolètes
    if (APP_VERSION === 'dev') {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return;
    }

    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    // Vérifie si au moins une armée n'est pas à jour
    const hasObsoleteArmy = armies.some((army: Army) => {
      // On ignore les armées déjà marquées comme obsolètes
      if (army.obsolete) return false;
      return !army.version || compareVersions(army.version, LAST_ARMY_UPDATE_VERSION) < 0;
    });

    if (hasObsoleteArmy) {
      markArmiesAsObsolete();
    }

    // Mettre à jour la version stockée
    localStorage.setItem(VERSION_KEY, APP_VERSION);
  },

  // Obtenir la version actuelle
  getCurrentVersion: (): string => {
    return APP_VERSION;
  },

  // Obtenir la version stockée
  getStoredVersion: (): string | null => {
    return localStorage.getItem(VERSION_KEY);
  },

  // Comparer deux versions
  compareVersions: (version1: string, version2: string): number => {
    return compareVersions(version1, version2);
  }
}; 