import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDatasource } from '../utils/datasourceDb';

interface DatasourceContextProps {
  datasource: any;
  setDatasource: (ds: any) => void;
  refreshDatasource: () => Promise<void>;
}

const DatasourceContext = createContext<DatasourceContextProps>({
  datasource: null,
  setDatasource: () => {},
  refreshDatasource: async () => {},
});

export const useDatasource = () => useContext(DatasourceContext);

export const DatasourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasource, setDatasource] = useState<any>(null);

  const refreshDatasource = async () => {
    const ds = await loadDatasource();
    setDatasource(ds);
  };

  useEffect(() => {
    refreshDatasource();
  }, []);

  return (
    <DatasourceContext.Provider value={{ datasource, setDatasource, refreshDatasource }}>
      {children}
    </DatasourceContext.Provider>
  );
}; 