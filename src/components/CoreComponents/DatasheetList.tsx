import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  TextField, 
  InputAdornment,
  Divider,
  Collapse,
  Chip,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { 
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Datasheet } from '../../types/datasheet';
import { useTheme } from '@mui/material/styles';
import { ArmyRule } from '../../types/army';
import { loadDatasource } from '../../utils/datasourceDb';
import UnitCard from '../UnitView/UnitCard';
import { useTranslate } from '../../services/translationService';

interface DatasheetListProps {
  factionId: string;
  onSelectDatasheet: (datasheet: Datasheet) => void;
  onAdd: (datasheet: Datasheet) => void;
  onUnitAdded?: () => void;
  selectedItem?: { type: 'datasheet' | 'army', id: string } | null;
  showLegends?: boolean;
  setShowLegends?: (value: boolean) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  detachment?: any;
  refreshKey?: number;
}

interface FactionData {
  id: string;
  name: string;
  isSubfaction?: boolean;
  parent_id?: string;
  rules?: ArmyRule[];
  datasheets?: Datasheet[];
  allied_factions?: string[];
}

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

const DatasheetList: React.FC<DatasheetListProps> = ({ 
  factionId, 
  onSelectDatasheet,
  onUnitAdded,
  selectedItem,
  showLegends = false,
  setShowLegends,
  searchTerm: externalSearchTerm,
  onSearch,
  detachment,
  refreshKey
}) => {
  
  const [datasheets, setDatasheets] = useState<Datasheet[]>([]);
  const [filteredDatasheets, setFilteredDatasheets] = useState<Datasheet[]>([]);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = externalSearchTerm ?? internalSearchTerm;
  const [faction, setFaction] = useState<FactionData | null>(null);
  const [unalignedFaction, setUnalignedFaction] = useState<FactionData | null>(null);
  const [mainFactionSections, setMainFactionSections] = useState<Record<string, boolean>>(() => 
    KEYWORD_ORDER.reduce((acc, keyword) => ({ ...acc, [keyword]: true }), { mainFaction: true })
  );
  const [alliedFactionSections, setAlliedFactionSections] = useState<Record<string, Record<string, boolean>>>({});
  const [openAlliedFactions, setOpenAlliedFactions] = useState<Record<string, boolean>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const initializedRef = useRef(false);
  const [datasourceData, setDatasourceData] = useState<any>(null);
  const [selectedDatasheet, setSelectedDatasheet] = useState<Datasheet | null>(null);
  const translate = useTranslate();

  const toggleMainFactionSection = (section: string) => {
    setMainFactionSections((prev: Record<string, boolean>) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAlliedFactionSection = (factionId: string, section: string) => {
    setAlliedFactionSections((prev: Record<string, Record<string, boolean>>) => ({
      ...prev,
      [factionId]: {
        ...prev[factionId],
        [section]: !prev[factionId]?.[section]
      }
    }));
  };

  useEffect(() => {
    if (faction?.allied_factions) {
      const newAlliedSections = { ...alliedFactionSections };
      let hasChanges = false;

      faction.allied_factions.forEach(alliedId => {
        if (!newAlliedSections[alliedId]) {
          newAlliedSections[alliedId] = KEYWORD_ORDER.reduce((acc, keyword) => ({ ...acc, [keyword]: false }), { mainFaction: false });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setAlliedFactionSections(newAlliedSections);
      }
    }
  }, [faction?.allied_factions, alliedFactionSections]);

  useEffect(() => {
    if (faction?.id && !alliedFactionSections[faction.id]) {
      setAlliedFactionSections((prev: Record<string, Record<string, boolean>>) => ({
        ...prev,
        [faction.id]: KEYWORD_ORDER.reduce((acc, keyword) => ({ ...acc, [keyword]: true }), { mainFaction: true })
      }));
    }
  }, [faction?.id, alliedFactionSections]);

  useEffect(() => {
    if (faction?.id) {
      initializedRef.current = false;
    }
  }, [faction?.id]);

  useEffect(() => {
    async function fetchUnaligned() {
      const data = await loadDatasource();
      setDatasourceData(data);
      if (data) {
        const unaligned = (Object.values(data) as FactionData[]).find(
          faction => faction.id === 'UN'
        );
        if (unaligned) {
          const validDatasheets = unaligned.datasheets?.filter(d => d.keywords && d.keywords.length > 0) || [];
          setUnalignedFaction({
            ...unaligned,
            datasheets: validDatasheets
          });
        }
      }
    }
    fetchUnaligned();
  }, []);

  const getDatasheetType = (datasheet: Datasheet): number => {
    if (!datasheet.keywords) return KEYWORD_ORDER.length;
    
    for (let i = 0; i < KEYWORD_ORDER.length; i++) {
      if (datasheet.keywords.includes(KEYWORD_ORDER[i])) {
        return i;
      }
    }
    return KEYWORD_ORDER.length;
  };

  const sortDatasheets = useCallback((datasheets: Datasheet[]): Datasheet[] => {
    return [...datasheets].sort((a, b) => {
      const typeA = getDatasheetType(a);
      const typeB = getDatasheetType(b);
      if (typeA === typeB) {
        return a.name.localeCompare(b.name);
      }
      return typeA - typeB;
    });
  }, []);

  const renderDatasheetSection = (title: string, datasheets: Datasheet[], factionId?: string) => {
    if (datasheets.length === 0) return null;

    const isOpen = factionId 
      ? alliedFactionSections[factionId]?.[title] ?? true 
      : mainFactionSections[title] ?? true;

    return (
      <Box key={title}>
        <ListItemButton
          onClick={() => factionId 
            ? toggleAlliedFactionSection(factionId, title)
            : toggleMainFactionSection(title)
          }
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
            {datasheets.map((datasheet, index) => (
              <React.Fragment key={datasheet.id}>
                <ListItem
                  disablePadding
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                      ? (theme.palette.mode === 'dark' 
                        ? 'rgba(178, 150, 0, 0.5)'
                        : 'rgba(18, 113, 132, 0.7)')
                      : (theme.palette.mode === 'dark' 
                          ? 'rgba(0, 0, 0, 0.3)'
                          : 'rgba(255, 255, 255, 0.3)'),
                    border: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                      ? `2px solid ${theme.palette.primary.main}`
                      : '1px solid',
                    borderColor: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                      ? theme.palette.primary.main
                      : 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                        ? theme.palette.primary.dark
                        : (theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)'),
                    }
                  }}
                >
                  <ListItemButton 
                    onClick={() => handleDatasheetClick(datasheet)}
                    sx={{
                      color: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                        ? 'white'
                        : undefined,
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                          ? 'white'
                          : undefined,
                      }
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={(() => {
                              if (datasheet.legends && (!datasheet.points || datasheet.points.length === 0)) {
                                return "Légende";
                              }
                              if (!datasheet.points || datasheet.points.length === 0) {
                                return "-";
                              }
                              // Trouver le coût le moins élevé
                              const minCost = Math.min(...datasheet.points.map(p => parseInt(p.cost, 10)));
                              return `${minCost} pts`;
                            })()}
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
                              color: selectedItem && selectedItem.type === 'datasheet' && selectedItem.id === datasheet.id
                                ? 'rgba(255, 255, 255, 0.9)' 
                                : ( theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.9)'
                                  : 'rgba(0, 0, 0, 0.87)'
                                ),
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {translate(datasheet.name, factionId || '')}
                          </Typography>
                          {datasheet.legends && !(!datasheet.points || datasheet.points.length === 0) && (
                            <Chip 
                              label="Légende" 
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
              </React.Fragment>
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  };

  const renderFactionSection = (title: string, datasheets: Datasheet[]) => {
    const isOpen = mainFactionSections.mainFaction ?? true;
    const groupedDatasheets = groupDatasheetsByKeyword(datasheets);

    return (
      <Box>
        <ListItemButton
          onClick={() => toggleMainFactionSection('mainFaction')}
          sx={{
            py: 1.5,
            px: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.08)',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.12)'}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.16)' 
                : 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(0, 0, 0, 0.87)',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 1,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {datasheets.length}
          </Typography>
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={isOpen}>
          <Box>
            {[...KEYWORD_ORDER, "Autres"].map(keyword => 
              renderDatasheetSection(keyword, groupedDatasheets[keyword] || [])
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  const groupDatasheetsByKeyword = (datasheets: Datasheet[]): Record<string, Datasheet[]> => {
    const grouped: Record<string, Datasheet[]> = {};
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
      if (keyword === "Fortification") continue; // Skip Fortification as it's already handled
      
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

  const renderAlliedFactionSection = (alliedFaction: FactionData, hideCount: boolean = false) => {
    const isOpen = openAlliedFactions[alliedFaction.id] ?? false;
    const filteredDatasheets = alliedFaction.datasheets?.filter(datasheet => 
      datasheet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (showLegends || !datasheet.legends)
    ) || [];
    const groupedDatasheets = groupDatasheetsByKeyword(filteredDatasheets);

    return (
      <Box key={alliedFaction.id}>
        <ListItemButton
          onClick={() => setOpenAlliedFactions(prev => ({ ...prev, [alliedFaction.id]: !prev[alliedFaction.id] }))}
          sx={{
            py: 1.5,
            px: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.08)',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.12)' 
              : 'rgba(0, 0, 0, 0.12)'}`,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.16)' 
                : 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <Typography 
            variant="subtitle1" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.9)' 
                : 'rgba(0, 0, 0, 0.87)',
            }}
          >
            {alliedFaction.name}
          </Typography>
          {!hideCount && (
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 1,
                color: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(0, 0, 0, 0.6)',
              }}
            >
              {filteredDatasheets.length}
            </Typography>
          )}
          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={isOpen}>
          <Box>
            {[...KEYWORD_ORDER, "Autres"].map(keyword => 
              renderDatasheetSection(keyword, groupedDatasheets[keyword] || [], alliedFaction.id)
            )}
          </Box>
        </Collapse>
      </Box>
    );
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    if (onSearch) {
      onSearch(newSearchTerm);
    } else {
      setInternalSearchTerm(newSearchTerm);
    }
  };

  const loadDatasheets = useCallback(() => {
    async function fetchDatasheets() {
      try {
        if (!factionId) {
          return;
        }
        const data = await loadDatasource();
        setDatasourceData(data);
        if (!data) {
          return;
        }
        const currentFaction = data[`${factionId}_translated`];
        if (!currentFaction) {
          return;
        }
        setFaction(currentFaction);
        let allDatasheets: Datasheet[] = [];
        if (currentFaction.is_subfaction) {
          // Sous-faction : uniquement ses propres datasheets
          if (currentFaction.datasheets?.length) {
            allDatasheets = [...currentFaction.datasheets];
          }
        } else {
          // Faction principale : fusion avec parent si besoin
          if (currentFaction.parent_id) {
            const parentFaction = data[`${currentFaction.parent_id}_translated`];
            if (parentFaction?.datasheets?.length) {
              const parentDatasheets = parentFaction.datasheets.filter((datasheet: Datasheet) => 
                !datasheet.keywords?.includes("Epic Hero")
              );
              allDatasheets = [...parentDatasheets];
            }
          }
          if (currentFaction.datasheets?.length) {
            allDatasheets = [...allDatasheets, ...currentFaction.datasheets];
          }
        }
        const uniqueDatasheets = Array.from(new Map(allDatasheets.map(item => [item.id, item])).values());
        const sortedDatasheets = sortDatasheets(uniqueDatasheets);
        setDatasheets(sortedDatasheets);
      } catch (error) {}
    }
    fetchDatasheets();
  }, [factionId, sortDatasheets]);

  useEffect(() => {
    loadDatasheets();
  }, [loadDatasheets, refreshKey]);

  useEffect(() => {
    if (!datasheets.length) return;
    
    const filtered = datasheets.filter(datasheet => {
      const nameMatch = datasheet.name.toLowerCase().includes(searchTerm.toLowerCase());
      const legendsMatch = showLegends || !datasheet.legends;
      
      // Vérifier si le terme de recherche est un nombre
      const searchNumber = parseInt(searchTerm);
      if (!isNaN(searchNumber)) {
        // Si la datasheet n'a pas de points ou est une légende sans points, on la filtre
        if (!datasheet.points || datasheet.points.length === 0) {
          return false;
        }

        // Trouver le coût minimum de la datasheet
        const minCost = Math.min(...datasheet.points.map(p => {
          const cost = parseInt(p.cost, 10);
          return isNaN(cost) ? Infinity : cost;
        }));

        // Si le coût minimum est Infinity (pas de coût valide), on filtre la datasheet
        if (minCost === Infinity) {
          return false;
        }

        return minCost <= searchNumber;
      }
      
      return nameMatch && legendsMatch;
    });
    setFilteredDatasheets(filtered);
  }, [searchTerm, datasheets, showLegends]);


  const handleDatasheetClick = (datasheet: Datasheet) => {
    if (isMobile) {
      setSelectedDatasheet(datasheet);
    } else {
      onSelectDatasheet(datasheet);
      setSelectedDatasheet(datasheet);
    }
  };

  const handleBack = () => {
    setSelectedDatasheet(null);
  };

  if (isMobile && selectedDatasheet) {
    return (
      <UnitCard
        unit={selectedDatasheet}
        army={{
          faction: faction?.name,
          subfaction: faction?.isSubfaction ? faction.name : undefined,
          chapter: undefined
        }}
        isBattleMode={false}
        onBack={handleBack}
        onUnitAdded={onUnitAdded}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        px: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {
          isMobile ? (
            <Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
              Datasheets disponibles
              </Typography>
            </Box>
          )
        }
          <TextField
            fullWidth
            size="small"
            placeholder="Chercher par nom ou pts..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setInternalSearchTerm('')}
                    edge="end"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
      </Box>
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: 0, 
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
        <List sx={{ 
          p: 0,
        }}>
          {faction && (
            <>
              {renderFactionSection(faction.name, filteredDatasheets)}
              {faction.allied_factions && faction.allied_factions.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                    Factions Alliées
                  </Typography>
                  {faction.allied_factions.map(alliedId => {
                    const alliedFaction = (Object.values(datasourceData) as FactionData[])
                      .find(f => f.id === alliedId);
                    return alliedFaction ? renderAlliedFactionSection(alliedFaction) : null;
                  })}
                </>
              )}
            </>
          )}
          {unalignedFaction && unalignedFaction.datasheets && unalignedFaction.datasheets.length > 0 && (
            <>
              {faction && <Divider sx={{ my: 2 }} />}
              <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                Unaligned
              </Typography>
              {renderAlliedFactionSection(unalignedFaction, true)}
            </>
          )}
          {(!faction && !unalignedFaction) && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucune datasheet trouvée
              </Typography>
            </Box>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default DatasheetList; 