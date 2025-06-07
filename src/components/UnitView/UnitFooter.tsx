import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Datasheet } from '../../types/datasheet';
import { useTranslate } from '../../services/translationService';

const TITLE_FONT_FAMILY = '"EB Garamond", "serif"';

interface UnitFooterProps {
  datasheet: Datasheet;
  factionColors: {
    banner: string;
    header: string;
  };
}

const UnitFooter: React.FC<UnitFooterProps> = ({ datasheet, factionColors }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();

  return (
    <Box sx={{
      height: '64px',
      width: 'calc(100% - 3rem)',
      marginLeft: '1.4rem',
      border: `2px solid ${factionColors.header}`,
      bgcolor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      position: 'relative',
      bottom: '16px',
      display: 'grid',
      gridTemplateColumns: '67.5% auto',
      gap: 0,
      overflow: 'visible',
      zIndex: 1
    }}>
      {/* Keywords */}
      <Box sx={{
        borderRight: `2px solid ${factionColors.header}`,
        display: 'flex',
        alignItems: 'center',
        pl: 2,
        pr: 6,
        bgcolor: isDarkMode ? '#2a2a2a' : '#e8e8e8',
        fontFamily: TITLE_FONT_FAMILY,
        letterSpacing: '0.05em',
      }}>
        <Typography sx={{
          textTransform: 'uppercase',
          fontSize: '1rem',
          color: isDarkMode ? '#e0e0e0' : 'black',
          fontWeight: 400,
          pr: 0.5,
          '&::after': {
            content: '":"'
          }
        }}>
          {translate('keywords', datasheet.faction_id)}
        </Typography>
        <Typography sx={{
          textTransform: 'capitalize',
          fontSize: '1rem',
          color: isDarkMode ? '#e0e0e0' : 'black',
          fontWeight: 600,
          pl: 1
        }}>
          {datasheet.keywords.map(k => translate(k, datasheet.faction_id)).join(', ')}
        </Typography>
      </Box>

      {/* Faction Logo */}
      <Box sx={{
        height: '64px',
        width: '64px',
        border: `2px solid ${factionColors.header}`,
        bgcolor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        position: 'absolute',
        bottom: '-2px',
        left: '67.5%',
        transform: 'translateX(-50%) rotate(45deg)',
        overflow: 'hidden',
        zIndex: 1,
        '&::after': {
          content: '""',
          display: 'block',
          width: '100%',
          height: '100%',
          transform: `scale(${getFactionScale(datasheet.faction_id)}) rotate(-45deg)`,
          backgroundImage: `url(https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${datasheet.faction_id}.svg)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          filter: isDarkMode 
            ? 'brightness(0) invert(1)'
            : `brightness(0) saturate(100%) ${factionColors.header}`
        }
      }}/>

      {/* Faction Keywords */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pl: 6,
        bgcolor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        fontFamily: TITLE_FONT_FAMILY,
        letterSpacing: '0.05em',
      }}>
        <Typography sx={{
          textTransform: 'uppercase',
          fontSize: '1rem',
          color: isDarkMode ? 'white' : factionColors.header,
          fontWeight: 400,
          lineHeight: '1.1rem',
          '&::after': {
            content: '":"'
          }
        }}>
          {translate('faction keywords', datasheet.faction_id)}
        </Typography>
        <Typography sx={{
          textTransform: 'capitalize',
          fontSize: '1rem',
          color: isDarkMode ? 'white' : factionColors.header,
          fontWeight: 600,
          lineHeight: '1.1rem'
        }}>
          {datasheet.factions.map(f => translate(f, datasheet.faction_id)).join(', ')}
        </Typography>
      </Box>
    </Box>
  );
};

// Fonction utilitaire pour obtenir l'échelle du logo selon la faction
const getFactionScale = (factionId: string): number => {
  const scaleMap: { [key: string]: number } = {
    'AoI': 1.3,
    'CHDW': 0.7,
    'DRU': 1,
    'GK': 1,
    'ORK': 1,
    'SM': 1.4,
    'CHSW': 1,
    'TYR': 1,
    'LoV': 1,
    'WE': 1,
    'AE': 1,
    'AM': 1.3
  };
  return scaleMap[factionId] || 1;
};

export default UnitFooter; 