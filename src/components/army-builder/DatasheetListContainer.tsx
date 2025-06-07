import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import DatasheetList from './DatasheetList';
import { Datasheet } from '../../types/datasheet';

interface DatasheetListContainerProps {
  factionId: string;
  onSelectDatasheet: (datasheet: Datasheet) => void;
  onAdd: (datasheet: Datasheet) => void;
  onUnitAdded?: () => void;
  selectedItem?: { type: 'datasheet' | 'army', id: string } | null;
  showLegends?: boolean;
  setShowLegends?: (value: boolean) => void;
}

const DatasheetListContainer: React.FC<DatasheetListContainerProps> = ({
  factionId,
  onSelectDatasheet,
  onAdd,
  onUnitAdded,
  selectedItem,
  showLegends = false,
  setShowLegends,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DatasheetList
        factionId={factionId}
        onSelectDatasheet={onSelectDatasheet}
        onAdd={onAdd}
        onUnitAdded={onUnitAdded}
        selectedItem={selectedItem}
        showLegends={showLegends}
        setShowLegends={setShowLegends}
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />
    </Box>
  );
};

export default DatasheetListContainer; 