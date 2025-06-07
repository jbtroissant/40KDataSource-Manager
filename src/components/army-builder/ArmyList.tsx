import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Typography, 
  Box,
  Collapse,
  ListItemButton,
  Chip,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Datasheet } from '../../types/datasheet';
import { useParams } from 'react-router-dom';
import { armyService } from '../../services/armyService';
import { useTheme } from '@mui/material/styles';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DetachmentSelector from '../DetachmentSelector';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import UnitCard from '../UnitView/UnitCard';
import PointsProgressBar from './PointsProgressBar';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { QRCodeSVG } from 'qrcode.react';
import { getArmyExportQrData } from '../../services/qrExportService';
import { UnitWithEnhancements } from '../../types/unit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DatasheetListContainer from './DatasheetListContainer';
import { useTranslate } from '../../services/translationService';
import { useDatasource } from '../../contexts/DatasourceContext';
import DetachmentDetails from '../DetachmentDetails';

const KEYWORD_ORDER = [
  "Epic Hero",
  "Character",
  "Battleline",
  "Infantry",
  "Mounted",
  "Swarm",
  "Vehicle",
  "Fortification",
  "Other"
];

interface ArmyListProps {
  units: UnitWithEnhancements[];
  armyName: string;
  lastUpdated: string;
  factionName: string;
  factionId: string;
  detachment: any;
  totalPoints: number;
  onOpenFactionRules: () => void;
  onOpenDetachmentDetail: () => void;
  onRemove?: (unitId: string) => void;
  onPointsChange?: (points: number) => void;
  onSelectUnit?: (unit: UnitWithEnhancements) => void;
  onDetachmentChange?: (detachment: any) => void;
  onUnitAdded?: () => void;
  selectedItem?: { type: 'datasheet' | 'army', id: string } | null;
  setSelectedItem?: (item: { type: 'datasheet' | 'army', id: string } | null) => void;
  onAddUnit?: (datasheet: any) => void;
}

const ArmyList: React.FC<ArmyListProps> = ({ units: initialUnits, armyName, lastUpdated, factionName, factionId, detachment, totalPoints, onOpenFactionRules, onOpenDetachmentDetail, onRemove, onPointsChange, onSelectUnit, onDetachmentChange, onUnitAdded, selectedItem, setSelectedItem, onAddUnit }) => {
  const { armyId } = useParams<{ armyId: string }>();
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [selectedUnit, setSelectedUnit] = useState<UnitWithEnhancements | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => 
    KEYWORD_ORDER.reduce((acc, keyword) => ({ ...acc, [keyword]: true }), { mainFaction: true })
  );
  const [openDetachmentSelector, setOpenDetachmentSelector] = useState(false);
  const [qrExportOpen, setQrExportOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showDatasheetList, setShowDatasheetList] = useState(false);
  const translate = useTranslate();
  const { datasource } = useDatasource();
  const [detachmentDetails, setDetachmentDetails] = useState<any>(null);
  const [detachmentDetailOpen, setDetachmentDetailOpen] = useState(false);

  // Utilise uniquement les props comme source de vérité
  const localUnits = initialUnits;

  const getDatasheetType = (datasheet: Datasheet): number => {
    if (!datasheet.keywords) return KEYWORD_ORDER.length;
    
    for (let i = 0; i < KEYWORD_ORDER.length; i++) {
      if (datasheet.keywords.includes(KEYWORD_ORDER[i])) {
        return i;
      }
    }
    return KEYWORD_ORDER.length;
  };

  const sortDatasheets = (datasheets: UnitWithEnhancements[]): UnitWithEnhancements[] => {
    return [...datasheets].sort((a, b) => {
      const typeA = getDatasheetType(a);
      const typeB = getDatasheetType(b);
      if (typeA === typeB) {
        return a.name.localeCompare(b.name);
      }
      return typeA - typeB;
    });
  };

  const groupDatasheetsByKeyword = (datasheets: UnitWithEnhancements[]): Record<string, UnitWithEnhancements[]> => {
    const grouped: Record<string, UnitWithEnhancements[]> = {};
    const usedDatasheets = new Set<string>();

    // Initialiser toutes les catégories
    KEYWORD_ORDER.forEach(keyword => {
      grouped[keyword] = [];
    });

    // D'abord, traiter les Fortifications
    datasheets.forEach(datasheet => {
      if (datasheet.keywords?.includes("Fortification")) {
        grouped["Fortification"].push(datasheet);
        usedDatasheets.add(datasheet.id);
      }
    });

    // Ensuite, traiter les autres keywords dans l'ordre
    for (const keyword of KEYWORD_ORDER) {
      if (keyword === "Fortification") continue;
      
      datasheets.forEach(datasheet => {
        if (!usedDatasheets.has(datasheet.id) && datasheet.keywords?.includes(keyword)) {
          grouped[keyword].push(datasheet);
          usedDatasheets.add(datasheet.id);
        }
      });
    }

    // Ajouter les datasheets restantes dans "Autres"
    grouped["Autres"] = datasheets.filter(datasheet => !usedDatasheets.has(datasheet.id));

    return grouped;
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRemove = (unitId: string) => {
    console.log('[ArmyList] handleRemove called for unitId:', unitId);
    console.log('[ArmyList] localUnits before remove:', localUnits);
    if (onRemove) {
      onRemove(unitId);
      showSnackbar('Unité supprimée', 'success');
    } else if (armyId) {
      armyService.removeUnit(armyId, unitId);
      showSnackbar('Unité supprimée', 'success');
    }
    setTimeout(() => {
      console.log('[ArmyList] localUnits after remove:', localUnits);
    }, 500);
  };

  const handleUnitSelect = (unit: UnitWithEnhancements) => {
    if (isMobile) {
      setSelectedUnit(unit);
      if (setSelectedItem) setSelectedItem({ type: 'army', id: unit.id });
    } else if (onSelectUnit) {
      onSelectUnit(unit);
      if (setSelectedItem) setSelectedItem({ type: 'army', id: unit.id });
    }
  };

  const handleBack = () => {
    setSelectedUnit(null);
  };

  const renderDatasheetSection = (title: string, datasheets: UnitWithEnhancements[]) => {
    if (datasheets.length === 0) return null;

    const isOpen = openSections[title] ?? true;

    return (
      <Box key={title}>
        <ListItemButton
          onClick={() => toggleSection(title)}
          sx={{
            py: 1,
            px: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.04)' 
              : 'rgba(0, 0, 0, 0.02)',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(0, 0, 0, 0.08)'}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <Typography 
            variant="subtitle2" 
            sx={{ 
              flexGrow: 1,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.8)' 
                : 'rgba(0, 0, 0, 0.8)',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 1,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.6)' 
                : 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {datasheets.length}
          </Typography>
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={isOpen}>
          <Box>
            {datasheets.map((unit) => {
              const unitPoints = unit.points.find(p => p.active)?.cost || '0';
              const enhancementPoints = (unit.enhancements || []).reduce((sum, enhancement) => {
                const cost = typeof enhancement.cost === 'string' ? parseInt(enhancement.cost, 10) : enhancement.cost;
                return sum + (cost || 0);
              }, 0);
              const totalPoints = parseInt(unitPoints, 10) + enhancementPoints;

              return (
                <ListItem
                  key={unit.id}
                  disablePadding
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={() => handleRemove(unit.id)}
                      sx={{ color: '#d70505' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                      ? (theme.palette.mode === 'dark' 
                        ? 'rgba(178, 150, 0, 0.5)'
                        : 'rgba(18, 113, 132, 0.7)')
                      : (theme.palette.mode === 'dark' 
                          ? 'rgba(0, 0, 0, 0.3)'
                          : 'rgba(255, 255, 255, 0.3)'),
                    border: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                      ? `2px solid ${theme.palette.primary.main}`
                      : '1px solid',
                    borderColor: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                      ? theme.palette.primary.main
                      : 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                        ? theme.palette.primary.dark
                        : (theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)'),
                    }
                  }}
                >
                  <ListItemButton 
                    onClick={() => handleUnitSelect(unit)}
                    sx={{
                      color: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                        ? 'white'
                        : undefined,
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                          ? 'white'
                          : undefined,
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!("isCombinedUnit" in unit) && (
                            <Chip 
                              label={`${totalPoints} pts`}
                              size="small"
                              sx={{ 
                                height: 20,
                                minWidth: '65px',
                                '& .MuiChip-label': {
                                  px: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 'medium',
                                },
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.12)' 
                                  : 'rgba(0, 0, 0, 0.08)',
                                color: selectedItem && selectedItem.type === 'army' && selectedItem.id === unit.id
                                  ? 'rgba(255, 255, 255, 0.9)' 
                                  : ( theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(0, 0, 0, 0.87)'
                                  ),
                              }}
                            />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {translate(unit.name, factionId)}
                            </Typography>
                          </Box>
                          {enhancementPoints > 0 && (
                            <Box sx={{ pl: 7 }}>
                              <Chip 
                                label={`${unit.enhancements?.map(e => `${translate(e.name, factionId)} (+${e.cost} pts)`).join(', ')}`}
                                size="small"
                                sx={{ 
                                  height: 20,
                                  '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.75rem',
                                  },
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.12)' 
                                    : 'rgba(0, 0, 0, 0.08)',
                                  color: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.7)' 
                                    : 'rgba(0, 0, 0, 0.6)',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{ 
                        sx: { 
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        } 
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Collapse>
      </Box>
    );
  };

  // Handler pour le bouton +
  const handleAddUnitClick = () => {
    setShowDatasheetList(true);
  };
  // Handler pour fermer le container
  const handleCloseDatasheetList = () => {
    setShowDatasheetList(false);
  };

  // Ouvre automatiquement le sélecteur de détachement si aucune unité et pas de détachement sélectionné
  useEffect(() => {
    if (localUnits.length === 0 && (!detachment || !detachment.name)) {
      setOpenDetachmentSelector(true);
    }
  }, [localUnits.length, detachment]);

  const handleOpenDetachmentDetail = () => {
    // Chercher le détachement dans le datasource pour garantir la traduction
    const factionData = Object.values(datasource).find(
      (f: any) => f && f.id && f.id.toLowerCase() === (factionId || '').toLowerCase()
    ) as any;
    let det = null;
    if (factionData?.detachments) {
      det = factionData.detachments.find((d: any) => d.name === detachment.name);
    }
    // Si pas trouvé, fallback sur le détachement courant
    setDetachmentDetails(det || detachment);
    setDetachmentDetailOpen(true);
  };

  if (isMobile && selectedUnit) {
    return (
      <UnitCard
        unit={selectedUnit}
        army={{
          faction: factionName,
          subfaction: undefined,
          chapter: undefined,
          armyId: armyId
        }}
        isFromArmyList={true}
        onBack={handleBack}
        onUnitAdded={onUnitAdded}
        onUnitUpdated={() => {
          if (armyId) {
            armyService.refreshUnits(armyId);
          }
        }}
      />
    );
  }

  const sortedUnits = sortDatasheets(localUnits);
  const groupedUnits = groupDatasheetsByKeyword(sortedUnits);

  // Affichage mobile : overlay de DatasheetListContainer
  if (isMobile && showDatasheetList) {
    return (
      <Box sx={{ position: 'fixed', left: 0, right: 0, top: '56px', bottom: 0, 
        bgcolor: theme.palette.mode === 'dark' ? 'rgb(30, 30, 30)' : 'rgb(235, 230, 217)'
        , zIndex: 2000, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <IconButton onClick={handleCloseDatasheetList}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            Ajouter une unité
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
          <DatasheetListContainer
            factionId={factionId}
            onSelectDatasheet={() => {}}
            onAdd={() => {
              handleCloseDatasheetList();
            }}
            onUnitAdded={onUnitAdded}
            selectedItem={selectedItem}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
         px: 2,
         pb: 1,
         borderBottom: '1px solid',
         borderColor: 'divider',
         position: 'sticky',
      }}>
        {/* Section Détachement */}
        <Box sx={{ px: 2 }}>
        {isMobile ? (
            <Box sx={{ }}></Box>
          ) : (
            <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">
              Liste d'armée
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, position: 'relative' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {translate(factionName, factionId)}
            </Typography>
            <IconButton size="small" onClick={onOpenFactionRules} sx={{ ml: 1, color: 'primary.main' }}>
              <InfoIcon fontSize="small" />
            </IconButton>
            {isMobile && (
              <IconButton
                color="primary"
                aria-label="Ajouter une unité"
                onClick={handleAddUnitClick}
                sx={{
                  top: 15,
                  borderRadius: 1,
                  borderColor: 'primary.main',
                  border: '1px solid',
                  marginLeft: 'auto',
                  color: 'primary.main',
                  boxShadow: 2,
                  zIndex: 10,
                }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {detachment?.name ? translate(detachment.name, factionId) : 'Pas de détachement'}
            </Typography>
            {detachment?.name
              ? (
                  <IconButton size="small" onClick={handleOpenDetachmentDetail} sx={{ ml: 1, color: 'primary.main' }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                )
              : (
                  <IconButton size="small" sx={{ ml: 1, color: '#d70505' }}>
                    <WarningAmberIcon fontSize="small" />
                  </IconButton>
                )
            }
            <IconButton 
              size="small" 
              onClick={() => setOpenDetachmentSelector(true)} 
              sx={{ 
                ml: 1, 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {!isMobile && (
          <Box sx={{ mx:2, mt: 1.5, }}>
            <PointsProgressBar totalPoints={totalPoints} />
          </Box>
        )}
      </Box>
      <Box sx={{ 
        flex: 1, 
        minHeight: 0, 
        minWidth: 0, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.08)',
          borderRadius: '3px',
          '&:hover': {
            background: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.12)',
          },
        },
      }}>
        <List>
          {[...KEYWORD_ORDER, "Autres"].map(keyword => 
            renderDatasheetSection(keyword, groupedUnits[keyword] || [])
          )}
        </List>
      </Box>
      {(detachment && !detachment.name || openDetachmentSelector) && (
        <DetachmentSelector
          open={openDetachmentSelector || !detachment || !detachment.name}
          onClose={() => setOpenDetachmentSelector(false)}
          onSelect={(detachment) => {
            if (onDetachmentChange) {
              onDetachmentChange(detachment);
            }
          }}
          factionId={factionId}
          factionName={factionName}
          currentDetachment={detachment?.name}
        />
      )}

      {/* Dialog QR Export */}
      <Dialog open={qrExportOpen} onClose={() => setQrExportOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>QR code de la liste</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <QRCodeSVG
            value={getArmyExportQrData({
              factionId,
              armyName,
              version: lastUpdated,
              detachment,
              units: localUnits.map(u => ({
                datasheetId: u.datasheetId,
                points: (() => {
                  const unitPoints = u.points?.find(p => p.active)?.cost || '0';
                  const enhancementPoints = (u.enhancements || []).reduce((sum, enhancement) => {
                    const cost = typeof enhancement.cost === 'string' ? parseInt(enhancement.cost, 10) : enhancement.cost;
                    return sum + (cost || 0);
                  }, 0);
                  return parseInt(unitPoints, 10) + enhancementPoints;
                })(),
                enhancements: (u.enhancements || []).map(e => ({ name: e.name, cost: e.cost }))
              }))
            })}
            size={256}
            level="M"
            includeMargin={true}
          />
          <Button onClick={() => setQrExportOpen(false)} sx={{ mt: 2 }}>Fermer</Button>
        </DialogContent>
      </Dialog>

      {/* Dialog DetachmentDetails */}
      <DetachmentDetails
        open={detachmentDetailOpen}
        onClose={() => setDetachmentDetailOpen(false)}
        detachment={detachmentDetails}
        faction={{ id: factionId, name: factionName, iconUrl: `https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg` }}
      />
    </Box>
  );
};

export default ArmyList; 