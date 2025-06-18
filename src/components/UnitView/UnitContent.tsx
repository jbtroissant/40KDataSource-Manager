import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Datasheet } from '../../types/datasheet';
import { TextFormatService } from '../../services/textFormatService';
import EditableWeapon from './EditableWeapon';
import { useTranslate } from '../../services/translationService';

interface SectionHeaderProps {
  title: string;
  factionColors: {
    banner: string;
    header: string;
  };
  icon?: React.ReactNode;
  children?: React.ReactNode;
  contentStyle?: React.CSSProperties;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  factionColors, 
  icon,
  children,
  contentStyle
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  
  return (
    <>
      <Box
        sx={{
          bgcolor: factionColors.header,
          pl: 2,
          display: 'grid',
          gridTemplateColumns: '7fr 2fr repeat(5, 1fr)',
          gap: 0,
        }}
      >
        <Typography
          sx={{
            textTransform: 'uppercase',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {icon}
          {title}
        </Typography>
      </Box>
      {children && (
        <Box
          sx={{
            pl: 2,
            pr: 2,
            pt: 1,
            borderBottom: '1px dotted #636567',
            bgcolor: isDarkMode 
              ? 'rgba(255, 255, 255, 0.03)' 
              : 'rgba(0, 0, 0, 0.02)',
            ...contentStyle
          }}
        >
          {children}
        </Box>
      )}
    </>
  );
};

interface UnitContentProps {
  datasheet: Datasheet;
  factionColors: {
    banner: string;
    header: string;
  };
  isFromArmyList?: boolean;
  armyId: string;
  isBattleMode?: boolean;
  showEnhancements?: boolean;
}

const UnitContent: React.FC<UnitContentProps> = ({ 
  datasheet, 
  factionColors, 
  armyId, 
  isBattleMode = false,
  isFromArmyList = false,
  showEnhancements = false
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const translate = useTranslate();
  
  // State local pour les armes
  const [rangedWeapons, setRangedWeapons] = React.useState(datasheet.rangedWeapons);
  const [meleeWeapons, setMeleeWeapons] = React.useState(datasheet.meleeWeapons);

  React.useEffect(() => {
    setRangedWeapons(datasheet.rangedWeapons);
    setMeleeWeapons(datasheet.meleeWeapons);
  }, [datasheet.rangedWeapons, datasheet.meleeWeapons]);

  // Callback pour rafraîchir les armes après modification
  const handleWeaponsChange = () => {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const unitId = datasheet.id;
    if (armyId && unitId) {
      const army = armies.find((a: any) => a.armyId === armyId);
      if (army) {
        const unit = army.units.find((u: any) => u.id === unitId);
        if (unit) {
          setRangedWeapons(unit.rangedWeapons ? [...unit.rangedWeapons] : []);
          setMeleeWeapons(unit.meleeWeapons ? [...unit.meleeWeapons] : []);
        }
      }
    }
  };
  
  // Fonction utilitaire pour formater les textes avec des retours à la ligne
  const formatText = (text: string) => {
    return TextFormatService.formatTextWithLineBreaks(text);
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '468px',
        width: '100%',
        maxWidth: '1080px',
        mx: 'auto',
        bgcolor: factionColors.header,
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 96%)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          top: 0,
          mt: '-4px',
          minHeight: '468px',
          width: 'calc(100% - 4px)',
          bgcolor: isDarkMode ? '#1a1a1a' : 'background.paper',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 2% 100%, 0 96%)',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: 0,
        }}
      >
        {/* Section des armes */}
        <Box
          sx={{
            minHeight: '500px',
            borderRight: `2px solid ${factionColors.header}`,
            pt: 2,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pb: 2,
          }}
        >
          {/* Armes à distance */}
          {rangedWeapons && rangedWeapons.length > 0 && (
            <EditableWeapon 
              weapons={rangedWeapons} 
              factionColors={factionColors} 
              isRanged={true} 
              unitId={datasheet.id}
              armyId={armyId}
              onWeaponsChange={handleWeaponsChange}
              isBattleMode={isBattleMode}
              isFromArmyList={isFromArmyList}
              factionId={datasheet.faction_id}
            />
          )}

          {/* Armes de mêlée */}
          {meleeWeapons && meleeWeapons.length > 0 && (
            <EditableWeapon 
              weapons={meleeWeapons} 
              factionColors={factionColors} 
              isRanged={false} 
              unitId={datasheet.id}
              armyId={armyId}
              onWeaponsChange={handleWeaponsChange}
              isBattleMode={isBattleMode}
              isFromArmyList={isFromArmyList}
              factionId={datasheet.faction_id}
            />
          )}

          {/* Primarch Section */}
          {datasheet.abilities && datasheet.abilities.primarch && datasheet.abilities.primarch.length > 0 && datasheet.abilities.primarch[0].abilities && (
            <Box>
              <SectionHeader 
                title={translate(datasheet.abilities.primarch[0].name, datasheet.faction_id)}
                factionColors={factionColors}
              >
                {datasheet.abilities.primarch[0].abilities.map((ability, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography sx={{ 
                      color: isDarkMode ? '#e0e0e0' : 'black',
                      fontWeight: 'bold',
                      display: 'inline'
                    }} component="span">
                      {translate(ability.name, datasheet.faction_id)}:
                    </Typography>{' '}
                    <Typography sx={{ 
                      color: isDarkMode ? '#e0e0e0' : 'black',
                      display: 'inline',
                      fontSize: '0.95em'
                    }} component="span">
                      {translate(ability.description, datasheet.faction_id)}
                    </Typography>
                  </Box>
                ))}
              </SectionHeader>
            </Box>
          )}

          {/* Wargear Options */}
          {datasheet.wargear && datasheet.wargear.length > 0 && (
            <Box>
              <SectionHeader 
                title="OPTIONS D'ÉQUIPEMENT"
                factionColors={factionColors}
              >
                {TextFormatService.formatTextWithTwoColumnOptionsList(
                  datasheet.wargear.map(w => translate(w, datasheet.faction_id)).join('■')
                )}
              </SectionHeader>
            </Box>
          )}

          {/* Unit Composition */}
          {datasheet.composition && datasheet.composition.length > 0 && (
            <Box>
              <SectionHeader 
                title="COMPOSITION DE L'UNITÉ"
                factionColors={factionColors}
              >
                <Typography sx={{ 
                  color: isDarkMode ? '#e0e0e0' : 'black', 
                  fontSize: '0.85rem' 
                }}>
                  {TextFormatService.formatTextWithLineBreaksList(datasheet.composition.map(a => translate(a, datasheet.faction_id)).join('■'))}
                </Typography>
                {datasheet.loadout && (
                  <Typography sx={{ 
                    color: isDarkMode ? '#e0e0e0' : 'black', 
                    fontSize: '0.85rem' 
                  }}>
                    {translate(datasheet.loadout, datasheet.faction_id)}
                  </Typography>
                )}
              </SectionHeader>
            </Box>
          )}

          {/* Leader */}
          {datasheet.leader && (
            <Box>
              <SectionHeader 
                title="MENEUR"
                factionColors={factionColors}
              >
                {TextFormatService.formatTextWithLineBreaksList(translate(datasheet.leader, datasheet.faction_id))}
              </SectionHeader>
            </Box>
          )}

          {/* Lead By */}
          {datasheet.leadBy && (
            <Box>
              <SectionHeader 
                title="Mené par"
                factionColors={factionColors}
              >
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 0.5,
                }}>
                  {datasheet.leadBy?.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        borderBottom: index < (datasheet.leadBy?.length || 0) - 1 ? '1px dotted #636567' : 'none',
                        pb: 0.5,
                        pt: index > 0 ? 0.5 : 0
                      }}
                    >
                      <Typography 
                        sx={{ 
                          color: isDarkMode ? '#e0e0e0' : 'black', 
                          fontSize: '0.85rem',
                          lineHeight: 1.2
                        }}
                      >
                        ■ {translate(item, datasheet.faction_id)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </SectionHeader>
            </Box>
          )}

          {/* Transport Section */}
          {datasheet.transport && (
            <Box>
              <SectionHeader 
                title="TRANSPORT"
                factionColors={factionColors}
              >
                {TextFormatService.formatTextWithLineBreaksList(translate(datasheet.transport, datasheet.faction_id))}
              </SectionHeader>
            </Box>
          )}
        </Box>

        {/* Section des capacités */}
        <Box sx={{ 
          py: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          borderBottom: `2px solid ${factionColors.header}`,
          height: '100%'
        }}>
          <Box>
            <SectionHeader 
              title="APTITUDES"
              factionColors={factionColors}
            >
              {datasheet.abilities && datasheet.abilities.core && datasheet.abilities.core.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>BASE:</Typography>{' '}
                  <Typography component="span">{formatText(datasheet.abilities.core.map(a => translate(a, datasheet.faction_id)).join(', '))}</Typography>
                </Box>
              )}
              {datasheet.abilities && datasheet.abilities.faction && datasheet.abilities.faction.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography component="span" sx={{ fontWeight: 'bold', mb: 1 }}>FACTION:</Typography>{' '}
                  <Typography component="span">{formatText(datasheet.abilities.faction.map(a => translate(a, datasheet.faction_id)).join(', '))}</Typography>
                </Box>
              )}
              {datasheet.abilities && datasheet.abilities.other && datasheet.abilities.other.map((ability, index) => (
                <Box key={`ability-${index}`} sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 'bold' }}>{translate(ability.name, datasheet.faction_id)}:</Typography>{' '}
                  <Typography component="span">{formatText(translate(ability.description, datasheet.faction_id))}</Typography>
                </Box>
              ))}
            </SectionHeader>
          </Box>

          {/* Special Abilities Sections */}
          {datasheet.abilities && datasheet.abilities.special && datasheet.abilities.special.map((specialAbility, index) => (
            specialAbility.showAbility && (
              <Box key={`special-${index}`}>
                <SectionHeader 
                  title={translate(specialAbility.name, datasheet.faction_id)}
                  factionColors={factionColors}
                >
                  <Typography sx={{ 
                    color: isDarkMode ? '#e0e0e0' : 'black',
                    fontSize: '0.85rem',
                    lineHeight: 1.2
                  }} component="span">
                    {translate(specialAbility.description, datasheet.faction_id)}
                  </Typography>
                </SectionHeader>
              </Box>
            )
          ))}

          {/* Wargear Abilities Section */}
          {datasheet.abilities && datasheet.abilities.wargear && datasheet.abilities.wargear.length > 0 && (
            <Box>
              <SectionHeader 
                title="APTITUDES d'ÉQUIPEMENT"
                factionColors={factionColors}
              >
                {datasheet.abilities.wargear.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ fontWeight: 'bold' }}>{translate(item.name, datasheet.faction_id)}:</Typography>{' '}
                    <Typography component="span">{translate(item.description, datasheet.faction_id)}</Typography>
                  </Box>
                ))}
              </SectionHeader>
            </Box>
          )}

          {/* Damaged Abilities Section */}
          {datasheet.abilities && datasheet.abilities.damaged && datasheet.abilities.damaged.showDamagedAbility && (
            <Box>
              <SectionHeader 
                title={`ENDOMAGÉ: ${translate(datasheet.abilities.damaged.range, datasheet.faction_id)}`}
                factionColors={factionColors}
                icon={
                  <Box
                    sx={{
                      position: 'relative',
                      width: '16px',
                      height: '16px',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundImage: 'url("https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/svg/Toughness.svg")',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'contain',
                        filter: 'brightness(0) invert(1)',
                        width: '16px',
                        height: '16px',
                      },
                    }}
                  />
                }
              >
                {datasheet.abilities.damaged.showDescription && datasheet.abilities.damaged.description && (
                  <Typography component="span" sx={{ 
                    color: isDarkMode ? '#e0e0e0' : 'black',
                    fontSize: '0.85rem',
                    lineHeight: 1.2
                  }}>
                    {translate(datasheet.abilities.damaged.description, datasheet.faction_id)}
                  </Typography>
                )}
              </SectionHeader>
            </Box>
          )}

          {/* Enhancements Section */}
          {showEnhancements && datasheet.enhancements && datasheet.enhancements.length > 0 && (
            <Box>
              <SectionHeader 
                title="AMÉLIORATIONS"
                factionColors={factionColors}
                icon={
                  <AutoAwesomeIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: '1.2rem',
                      animation: 'glow 1.5s ease-in-out infinite alternate',
                      '@keyframes glow': {
                        from: {
                          filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25))',
                        },
                        to: {
                          filter: 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.35)) drop-shadow(0px 0px 4px ' + theme.palette.primary.main + ')',
                        },
                      },
                    }} 
                  />
                }
              >
                {datasheet.enhancements.map((enhancement, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography component="span" sx={{ 
                      color: isDarkMode ? '#e0e0e0' : 'black',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      fontWeight: 'bold'
                    }}>
                      {translate(enhancement.name, datasheet.faction_id)} ({enhancement.cost} pts):
                    </Typography>{' '}
                    <Typography component="span" sx={{ 
                      color: isDarkMode ? '#e0e0e0' : 'black',
                      fontSize: '0.85rem',
                      lineHeight: 1.5
                    }}>
                      {translate(enhancement.description, datasheet.faction_id)}
                    </Typography>
                    {enhancement.keywords && enhancement.keywords.length > 0 && (
                      <Typography component="span" sx={{ 
                        fontSize: '0.8rem',
                        color: isDarkMode ? 'white' : factionColors.header,
                        fontStyle: 'italic',
                        lineHeight: 1.2,
                        mt: 0.5
                      }}>
                        [{enhancement.keywords.join(', ')}]
                      </Typography>
                    )}
                  </Box>
                ))}
              </SectionHeader>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default UnitContent; 