import React, { useState } from 'react';
import { Box, Typography, useTheme, Popover, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Datasheet, LinkedUnit } from '../../types/datasheet';
import EditableStats from '../BattleView/EditableStats';
import { useParams } from 'react-router-dom';
import UnitStatus from '../CoreComponents/UnitStatus';
import { useTranslate } from '../../services/translationService';

const TITLE_FONT_FAMILY = '"EB Garamond", "serif"';



interface UnitHeaderProps {
  datasheet: Datasheet | LinkedUnit;
  factionColors: {
    banner: string;
    header: string;
  };
  isFromArmyList?: boolean;
  onUnitAdded?: () => void;
  isBattleMode?: boolean;
}

const UnitHeader: React.FC<UnitHeaderProps> = ({ 
  datasheet, 
  factionColors,
  isFromArmyList,
  onUnitAdded,
  isBattleMode
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { armyId } = useParams<{ armyId: string }>();
  const isLegendWithoutPoints = datasheet.legends && (!datasheet.points || datasheet.points.length === 0);
  const translate = useTranslate();
  
  const handlePointsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLegendWithoutPoints && datasheet.points && datasheet.points.length > 0) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      pb: '20px',
      background: isDarkMode 
        ? 'linear-gradient(96deg, #1a1a1a 0%, #0d1318 85%, #000000 100%)'
        : 'linear-gradient(96deg, #354a5b 0%, #0d1318 85%, #000000 100%)',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      pt: 2,
      borderRadius: 1,
      boxShadow: 1
    }}>
      {/* Status Icon */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 4
      }}>
        <UnitStatus isLost={datasheet.isLost === true} isWarlord={datasheet.warlord === true} factionColors={factionColors} />
      </Box>

      {/* Header Container */}
      <Box sx={{ 
        position: 'relative',
        height: '110px',
        width: '100%',
        '&::after': {
          position: 'absolute',
          content: '""',
          top: '20px',
          left: 0,
          width: '100%',
          height: '90px',
          bgcolor: factionColors.banner,
          clipPath: 'polygon(0% 0%, 0% 100%, 50% 100%, 60% 70%, 100% 70%, 100% 0%)'
        }
      }}>
        {/* Header Content */}
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pt: '30px',
          pl: '32px',
          pr: '32px',
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%'
        }}>
          {/* Name Container */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            <Typography sx={{
              textTransform: 'uppercase',
              fontSize: '1.3rem',
              fontWeight: 600,
              color: 'white',
              lineHeight: '1.5rem',
              letterSpacing: '0.05em',
              zIndex: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { xs: '60vw', sm: '40vw', md: '32vw', lg: '28vw' },
            }}>
              {translate(datasheet.name, datasheet.faction_id)}
            </Typography>
          </Box>

          {/* Points Container */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pr: 2,
            pt: 0.5,
            zIndex: 2,
            gap: 1
          }}>
            {!("isCombinedUnit" in datasheet) && (
            <Typography 
              onClick={handlePointsClick}
              sx={{
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'white',
                lineHeight: '1rem',
                letterSpacing: '0.05em',
                px: 1,
                py: 0.5,
                border: '1px solid white',
                borderRadius: '4px',
                cursor: !isLegendWithoutPoints && datasheet.points && datasheet.points.length > 0 ? 'pointer' : 'default',
                '&:hover': {
                  bgcolor: !isLegendWithoutPoints && datasheet.points && datasheet.points.length > 0 
                    ? 'rgba(255, 255, 255, 0.27)' 
                    : 'transparent',
                }
              }}
            >
              {isLegendWithoutPoints ? 'LÉGENDE' : `${(() => {
                if (!datasheet.points || datasheet.points.length === 0) return '-';
                const minCost = Math.min(...datasheet.points.map(p => parseInt(p.cost, 10)));
                return `${minCost} PTS`;
              })()}`}
            </Typography>
            )}
            
            {/* Bouton d'ajout à l'armée */}
            {/* !isFromArmyList && (
              <AddDatasheetToArmy 
                datasheet={datasheet} 
                factionColors={factionColors}
                onUnitAdded={onUnitAdded}
              />
            ) */}
          </Box>
        </Box>
      </Box>

      {/* Points Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: 1,
            boxShadow: 3,
            maxWidth: '250px',
            mt: 1
          }
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                  Points
                </TableCell>
                <TableCell sx={{ 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 600,
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                  Modèles
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasheet.points && datasheet.points.map((point, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: point.active ? (isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)') : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)',
                      fontWeight: point.active ? 600 : 400
                    }}
                  >
                    {point.cost} pts
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      fontWeight: point.active ? 500 : 400
                    }}
                  >
                    {point.models || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Popover>

      {/* Stats Container */}
      <Box sx={{

        pl: isFromArmyList && !isBattleMode ? '10px' : '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.2,
        fontFamily: TITLE_FONT_FAMILY,
        position: 'relative',
        mt: '-60px',
        mb: 2,
        zIndex: 4,
        pt: 0
      }}>
        {/* Multiple Stats Rows if needed */}
        {(isBattleMode && isFromArmyList
          ? datasheet.stats.filter(s => s.active !== false)
          : datasheet.stats
        ).map((statRow, rowIndex) => {
          return (
            <Box key={rowIndex}>
              <Box sx={{ 
                display: 'flex',
                gap: 0,
                alignItems: 'center',
                width: '100%',
                pr: 4,
                height: rowIndex === 0 ? '64px' : '44px',
                position: 'relative',
                zIndex: 5
              }}>
                <EditableStats 
                  stats={{...statRow, name: translate(statRow.name, datasheet.faction_id)}}
                  factionColors={factionColors}
                  showHeaders={rowIndex === 0}
                  unitId={datasheet.id}
                  armyId={armyId}
                  statId={statRow.statId}
                  datasheet={datasheet}
                  isBattleMode={typeof isBattleMode !== 'undefined' ? isBattleMode : false}
                  isFromArmyList={isFromArmyList}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default UnitHeader; 