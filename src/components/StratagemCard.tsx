import React from 'react';
import { Box, Typography, useTheme, IconButton, Dialog, useMediaQuery } from '@mui/material';
import { stratagemConfig } from '../config/stratagem.config';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslate } from '../services/translationService';

export interface StratagemDisplay {
  name: string;
  cost: number;
  type: string;
  phase: string[];
  when: string;
  target: string;
  effect: string;
  turn: string;
}

interface StratagemCardProps {
  stratagem: StratagemDisplay;
  open?: boolean;
  onClose?: () => void;
  topOffset?: number;
  asBoxOnly?: boolean;
  factionId?: string;
}

const StratagemCardContent: React.FC<{
  stratagem: StratagemDisplay;
  onClose?: () => void;
  showCloseButton?: boolean;
  factionId?: string;
}> = ({ stratagem, onClose, showCloseButton, factionId }) => {
  const theme = useTheme();
  const translate = useTranslate();
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

  const stratagemColor = getStratagemColor(stratagem.turn);

  // Déterminer la factionId à utiliser pour la traduction
  const factionKey = factionId || (stratagem as any).faction_id || '';
  const factionIconUrl = factionKey
    ? `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionKey}.svg`
    : '/icons/default.svg';

  return (
    <Box className="stratagem either" sx={{
      alignItems: 'center',
      bgcolor: theme.palette.mode === 'dark'
        ? '#1a1a1a'
        : '#f5f5f5',
      borderRadius: '8px',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
      border: `1px solid ${theme.palette.divider}`,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${factionIconUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundOrigin: 'content-box',
        padding: '12%',
        filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: 'none',
      },
    }}>
      <Box className="border" sx={{
        backgroundColor: 'transparent',
        borderRadius: '8px',
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        <Box sx={{ 
          position: 'absolute',
          left: `${stratagemConfig.contentLeftSpacing}px`,
          top: `${stratagemConfig.titleTopSpacing}px`,
          zIndex: 2,
          backgroundColor: 'transparent',
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Typography sx={{
            color: 'text.primary',
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'left',
          }}>
            {translate(stratagem.name, factionKey)}
          </Typography>
        </Box>
        {showCloseButton && onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              zIndex: 3,
              color: 'text.primary',
              background: theme.palette.mode === 'dark' ? 'rgba(49,49,49,0,2)' : 'rgba(255,255,255,0.7)',
              '&:hover': {
                background: theme.palette.mode === 'dark' ? 'rgba(49,49,49,1)' : 'rgba(176,176,176,1)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <Box className="background-side-bar" sx={{
          position: 'absolute',
          left: `${stratagemConfig.sideBandWidth}px`,
          top: '0',
          width: `${stratagemConfig.sideBandWidth}px`,
          height: '100%',
          backgroundColor: stratagemColor,
        }} />

        <Box className="background-header-bar" sx={{
          position: 'absolute',
          left: 0,
          top: `${stratagemConfig.horizontalBandTopPosition}px`,
          width: '100%',
          height: `${stratagemConfig.horizontalBandHeight}px`,
          backgroundColor: stratagemColor,
        }} />
        
        {/* Losanges pour les phases */}
        {stratagem.phase.map((phase, index) => (
          <Box
            key={`${stratagem.name}-${phase}-${index}`}
            sx={{
              position: 'absolute',
              left: `${stratagemConfig.sideBandWidth / 2 + stratagemConfig.diamondLeftSpacing}px`,
              top: `${stratagemConfig.diamondTopSpacing + (index * stratagemConfig.diamondSpacing)}px`,
              width: `${stratagemConfig.diamondSize}px`,
              height: `${stratagemConfig.diamondSize}px`,
              transform: 'rotate(45deg)',
              border: `${stratagemConfig.diamondBorderWidth}px solid ${stratagemColor}`,
              backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}
          >
            <Box
              component="img"
              src={`${stratagemConfig.phaseIconBaseUrl}/${getPhaseIconName(phase)}.svg`}
              alt={phase}
              sx={{
                width: `${stratagemConfig.phaseIconSize}px`,
                height: `${stratagemConfig.phaseIconSize}px`,
                transform: 'rotate(-45deg)',
                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
              }}
            />
          </Box>
        ))}
        
        {/* Losange pour les CP (toujours en bas) */}
        <Box
          key={`${stratagem.name}-cp`}
          sx={{
            position: 'absolute',
            left: `${stratagemConfig.sideBandWidth / 2 + stratagemConfig.diamondLeftSpacing}px`,
            top: `${stratagemConfig.diamondTopSpacing + (stratagem.phase.length * stratagemConfig.diamondSpacing)}px`,
            width: `${stratagemConfig.diamondSize}px`,
            height: `${stratagemConfig.diamondSize}px`,
            transform: 'rotate(45deg)',
            border: `${stratagemConfig.diamondBorderWidth}px solid ${stratagemColor}`,
            backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
          }}
        >
          <Typography sx={{
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            fontSize: '14px',
            fontWeight: 'bold',
            transform: 'rotate(-45deg)',
          }}>
            {stratagem.cost} PC
          </Typography>
        </Box>

        <Box sx={{ 
          position: 'relative', 
          p: 2, 
          pt: 6,
          pl: `${stratagemConfig.contentLeftSpacing}px`,
        }}>
          <Box className="type" sx={{ mb: 2 }}>
            <Typography sx={{
              color: 'text.secondary',
              fontSize: '10px',
              whiteSpace: 'nowrap',
            }}>
              {translate(stratagem.type, factionKey)} - {stratagem.phase?.map(p => translate(p, factionKey)).join(', ')}
            </Typography>
          </Box>

          <Box className="content" sx={{ mb: 2 }}>
            <Box className="section" sx={{ mb: 1 }}>
              <Typography component="span" sx={{ 
                color: stratagemColor,
                fontWeight: 'bold',
                mr: 1,
              }}>
                {translate('when', factionKey)} :
              </Typography>
              <Typography component="span" sx={{ color: 'text.primary' }}>
                {translate(stratagem.when, factionKey)}
              </Typography>
            </Box>

            <Box className="section" sx={{ mb: 1 }}>
              <Typography component="span" sx={{ 
                color: stratagemColor,
                fontWeight: 'bold',
                mr: 1,
              }}>
                {translate('target', factionKey)} :
              </Typography>
              <Typography component="span" sx={{ color: 'text.primary' }}>
                {translate(stratagem.target, factionKey)}
              </Typography>
            </Box>

            <Box className="section">
              <Typography component="span" sx={{ 
                color: stratagemColor,
                fontWeight: 'bold',
                mr: 1,
              }}>
                {translate('effect', factionKey)} :
              </Typography>
              <Typography component="span" sx={{ color: 'text.primary' }}>
                {translate(stratagem.effect, factionKey)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const StratagemCard: React.FC<StratagemCardProps> = ({ stratagem, open = true, onClose, topOffset, asBoxOnly, factionId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!open) return null;

  if (isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: topOffset ?? 0,
          left: 0,
          width: '100vw',
          height: isMobile || topOffset ? `calc(100vh - ${(topOffset ?? 0)}px)` : 'auto',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          m: 1,
          mb: 1,
        }}>
          <StratagemCardContent stratagem={stratagem} onClose={onClose} showCloseButton factionId={factionId} />
        </Box>
      </Box>
    );
  }

  if (asBoxOnly) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <StratagemCardContent stratagem={stratagem} factionId={factionId} />
      </Box>
    );
  }

  // Desktop : Dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          p: 2,
          m: 4,
          boxShadow: 'none',
        }
      }}
    >
      <StratagemCardContent stratagem={stratagem} onClose={onClose} showCloseButton factionId={factionId} />
    </Dialog>
  );
};

export default StratagemCard; 