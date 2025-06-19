import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDatasource } from '../utils/datasourceDb';

interface DatasourceContextProps {
  datasource: any;
  setDatasource: (ds: any) => void;
  reloadDatasource: () => Promise<void>;
  forceReloadDatasource: () => Promise<void>;
}

// Variable globale pour stocker la fonction de rechargement
let globalForceReload: (() => Promise<void>) | null = null;

const DatasourceContext = createContext<DatasourceContextProps>({
  datasource: null,
  setDatasource: () => {},
  reloadDatasource: async () => {},
  forceReloadDatasource: async () => {},
});

export const useDatasource = () => useContext(DatasourceContext);

// Fonction globale pour forcer le rechargement depuis n'importe où
export const forceReloadGlobal = async () => {
  if (globalForceReload) {
    await globalForceReload();
  }
};

export const DatasourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasource, setDatasource] = useState<any>(null);

  const reloadDatasource = async () => {
    const ds = await loadDatasource();
    setDatasource(ds);
  };

  const forceReloadDatasource = async () => {
    // Vider d'abord le cache en mettant datasource à null
    setDatasource(null);
    
    // Attendre un peu puis recharger
    setTimeout(async () => {
      const ds = await loadDatasource();
      setDatasource(ds);
    }, 50);
  };

  // Stocker la fonction globalement
  globalForceReload = forceReloadDatasource;

  useEffect(() => {
    reloadDatasource();
  }, []);

  return (
    <DatasourceContext.Provider value={{ datasource, setDatasource, reloadDatasource, forceReloadDatasource }}>
      {children}
    </DatasourceContext.Provider>
  );
}; 