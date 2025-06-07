import React from 'react';
import { Box } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

interface UnitStatusProps {
  isLost: boolean;
  isWarlord?: boolean;
  factionColors: {
    header: string;
    banner: string;
  };
}

const UnitStatus: React.FC<UnitStatusProps> = ({ isLost, isWarlord, factionColors }) => {
  if (!isLost && !isWarlord) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: 1,
      bgcolor: 'transparent',
    }}>
      {isWarlord && <MilitaryTechIcon sx={{ color: 'gold', fontSize: 28 }} />}
      {isLost && <SentimentVeryDissatisfiedIcon sx={{ color: 'red', fontSize: 28 }} />}
    </Box>
  );
};

export default UnitStatus; 