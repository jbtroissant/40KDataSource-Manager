import React from 'react';
import { ListItem, ListItemButton, Box, Typography } from '@mui/material';
import { StratagemDisplay } from '../StratagemCard';
import { stratagemConfig } from '../../config/stratagem.config';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '../../services/translationService';

interface StratagemListItemProps {
  stratagem: StratagemDisplay;
  onClick: (stratagem: StratagemDisplay) => void;
  factionId?: string;
}

const getStratagemColor = (turn: string) => {
  const turnKey = turn.toLowerCase() as keyof typeof stratagemConfig.colors;
  return stratagemConfig.colors[turnKey] || stratagemConfig.colors.either;
};

const getPhaseIconName = (phase: string) => {
  const phaseMap: { [key: string]: string } = {
    'fight': 'combat',
    'command': 'command',
    'movement': 'movement',
    'shooting': 'shooting',
    'charge': 'charge',
    'any': 'any',
  };
  return phaseMap[phase.toLowerCase()] || phase.toLowerCase();
};

const StratagemListItem: React.FC<StratagemListItemProps> = ({ stratagem, onClick, factionId }) => {
  const theme = useTheme();
  const translate = useTranslate();

  return (
    <ListItem 
      disablePadding
      sx={{
        mb: 1,
      }}
    >
      <ListItemButton
        onClick={() => onClick(stratagem)}
        sx={{
          border: `3px solid ${getStratagemColor(stratagem.turn)}`,
          borderRadius: '8px',
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.6)'
            : 'rgba(255, 255, 255, 0.6)',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.04)',
          },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '1rem',
            ml: '1.8rem',
            backgroundColor: getStratagemColor(stratagem.turn),
            zIndex: 0
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', pl: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            justifyContent: 'flex-start',
            width: '100%',
          }}>
            {/* Losanges pour les phases */}
            {stratagem.phase.map((phase, index) => (
              <Box
                key={`${stratagem.name}-${phase}-${index}`}
                sx={{
                  width: `${stratagemConfig.diamondSize / 2}px`,
                  height: `${stratagemConfig.diamondSize / 2}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(45deg)',
                  border: `${stratagemConfig.diamondBorderWidth}px solid ${getStratagemColor(stratagem.turn)}`,
                  backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
                }}
              >
                <Box
                  component="img"
                  src={`${stratagemConfig.phaseIconBaseUrl}/${getPhaseIconName(phase)}.svg`}
                  alt={phase}
                  sx={{
                    width: `${stratagemConfig.phaseIconSize / 2}px`,
                    height: `${stratagemConfig.phaseIconSize / 2}px`,
                    transform: 'rotate(-45deg)',
                    filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
                  }}
                />
              </Box>
            ))}
            {/* Losange pour les CP */}
            <Box
              key={`${stratagem.name}-cp`}
              sx={{
                width: `${stratagemConfig.diamondSize / 2}px`,
                height: `${stratagemConfig.diamondSize / 2}px`,
                transform: 'rotate(45deg)',
                border: `${stratagemConfig.diamondBorderWidth}px solid ${getStratagemColor(stratagem.turn)}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{
                color: theme.palette.mode === 'dark' ? 'white' : 'black',
                fontSize: '9px',
                lineHeight: 1,
                fontWeight: 'bold',
                transform: 'rotate(-45deg)',
              }}>
                {stratagem.cost} PC
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              flexGrow: 1,
              ml: 2
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 'bold',
                }}
              >
                {stratagem.type}
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mx: 3,
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography
              variant="body1"
                sx={{ 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  color: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : 'rgba(0, 0, 0, 0.6)',
                  fontWeight: 'bold',
                }}
              >
                {translate(stratagem.name, factionId ?? 'core')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default StratagemListItem; 