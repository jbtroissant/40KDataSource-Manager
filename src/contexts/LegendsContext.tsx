import React, { createContext, useContext, useState, useEffect } from 'react';

interface LegendsContextType {
  showLegends: boolean;
  setShowLegends: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const LegendsContext = createContext<LegendsContextType | undefined>(undefined);

export const useLegends = () => {
  const context = useContext(LegendsContext);
  if (context === undefined) {
    throw new Error('useLegends must be used within a LegendsProvider');
  }
  return context;
};

export const LegendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showLegends, setShowLegends] = useState<boolean>(() => {
    // Récupérer la valeur depuis localStorage au démarrage
    const saved = localStorage.getItem('showLegends');
    return saved ? JSON.parse(saved) : false;
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('showLegends', JSON.stringify(showLegends));
  }, [showLegends]);

  const handleSetShowLegends = (value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof value === 'function') {
      setShowLegends(value);
    } else {
      setShowLegends(value);
    }
  };

  return (
    <LegendsContext.Provider value={{ showLegends, setShowLegends: handleSetShowLegends }}>
      {children}
    </LegendsContext.Provider>
  );
}; 