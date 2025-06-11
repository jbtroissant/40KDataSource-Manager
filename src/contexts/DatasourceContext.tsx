import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadDatasource } from '../utils/datasourceDb';

interface DatasourceContextProps {
  datasource: any;
  setDatasource: (ds: any) => void;
}

const DatasourceContext = createContext<DatasourceContextProps>({
  datasource: null,
  setDatasource: () => {},
});

export const useDatasource = () => useContext(DatasourceContext);

export const DatasourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasource, setDatasource] = useState<any>(null);

  useEffect(() => {
    async function fetchDatasource() {
      const ds = await loadDatasource();
      setDatasource(ds);
    }
    fetchDatasource();
  }, []);

  return (
    <DatasourceContext.Provider value={{ datasource, setDatasource }}>
      {children}
    </DatasourceContext.Provider>
  );
}; 