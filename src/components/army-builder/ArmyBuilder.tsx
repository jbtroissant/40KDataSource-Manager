import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DatasheetList from './DatasheetList';
import UnitCard from '../UnitView/UnitCard';
import ArmyList from './ArmyList';
import { useParams, useNavigate } from 'react-router-dom';
import { Datasheet } from '../../types/datasheet';
import { Enhancement } from '../../types/detachment';
import ScreenLayout from '../layout/ScreenLayout';
import DetachmentDetails from '../DetachmentDetails';
import DetachmentSelector from '../DetachmentSelector';
import FactionRules from '../FactionRules';
import { armyService } from '../../services/armyService';
import PointsProgressBar from './PointsProgressBar';
import { UnitWithEnhancements as ArmyUnit } from '../../types/unit';

const ArmyBuilder: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { armyId } = useParams<{ armyId: string }>();
  const navigate = useNavigate();
  
  const [selectedDatasheet, setSelectedDatasheet] = useState<Datasheet | null>(null);
  const [armyUnits, setArmyUnits] = useState<ArmyUnit[]>([]);
  const [factionId, setFactionId] = useState<string>('');
  const [factionName, setFactionName] = useState<string>('');
  const [armyName, setArmyName] = useState<string>('');
  const [detachmentDetailOpen, setDetachmentDetailOpen] = useState<boolean>(false);
  const [detachmentSelectorOpen, setDetachmentSelectorOpen] = useState<boolean>(false);
  const [isFirstCreation, setIsFirstCreation] = useState<boolean>(false);
  const [detachment, setDetachment] = useState<any>(null);
  const [factionRulesOpen, setFactionRulesOpen] = useState(false);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isFromArmyList, setIsFromArmyList] = useState<boolean>(false);
  const [showCombinedUnitsDialog, setShowCombinedUnitsDialog] = useState(false);
  const [hasCheckedCombinedUnits, setHasCheckedCombinedUnits] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'datasheet' | 'army', id: string } | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFactions = async () => {
    };

    loadFactions();
  }, []);

  useEffect(() => {
    if (!armyId) return;
    // Récupérer l'armée depuis le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    if (army) {
      setArmyName(army.name);
      setFactionId(army.factionId);
      setFactionName(army.faction);
      setArmyUnits(army.units || []);
      setDetachment(
        army.detachment && army.detachment.name
          ? army.detachment
          : null
      );
      
      // Vérifier si aucun détachement n'est sélectionné
      const isNewCreation = !army.detachment || !army.detachment.name;
      setIsFirstCreation(isNewCreation);
      
      // Ouvrir le sélecteur uniquement si aucun détachement
      if (isNewCreation) {
        setDetachmentSelectorOpen(true);
      }
      
      // Vérifier les unités combinées
      if (!hasCheckedCombinedUnits && checkForCombinedUnits(army.units || [])) {
        setShowCombinedUnitsDialog(true);
      }
      setHasCheckedCombinedUnits(true);
      
      // Calculer les points initiaux
      const initialPoints = calculateTotalPoints(army.units || []);
      setTotalPoints(initialPoints);
      
      // Récupérer les datasheets de la faction
      const datasource = JSON.parse(localStorage.getItem('datasource') || '{}');
      if (datasource[army.factionId]) {
      }
      setIsLoading(false);
    } else {
      // Rediriger vers la page d'accueil si l'armée n'existe pas
      navigate('/');
    }
  }, [armyId, navigate, hasCheckedCombinedUnits]);

  const calculateTotalPoints = (units: ArmyUnit[]) => {
    return units.reduce((sum, unit) => {
      const activePoint = unit.points.find(p => p.active);
      const basePoints = activePoint ? parseInt(activePoint.cost) : 0;
      const enhancementPoints = (unit.enhancements || []).reduce((enhSum: number, enhancement: Enhancement) => {
        const cost = typeof enhancement.cost === 'string' ? parseInt(enhancement.cost, 10) : enhancement.cost;
        return enhSum + (cost || 0);
      }, 0);
      return sum + basePoints + enhancementPoints;
    }, 0);
  };

  // Effet pour mettre à jour les points automatiquement
  useEffect(() => {
    const newTotalPoints = calculateTotalPoints(armyUnits);
    setTotalPoints(newTotalPoints);
  }, [armyUnits]);

  const handleDatasheetSelect = (datasheet: Datasheet) => {
    setSelectedDatasheet(datasheet);
    setIsFromArmyList(false);
    setSelectedItem({ type: 'datasheet', id: datasheet.id });
  };

  const handleAddUnit = (unit: Datasheet) => {
    // Ajouter l'unité à l'armée
    const newUnit: ArmyUnit = {
      ...unit,
      datasheetId: unit.id,
      stats: (unit.stats || []).map(stat => ({
        ...stat,
        statId: stat.statId && typeof stat.statId === 'string' && stat.statId.length > 0
          ? stat.statId
          : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15))
      })),
      // Ajoutez d'autres propriétés selon vos besoins
    };
    
    const updatedUnits = [...armyUnits, newUnit];
    setArmyUnits(updatedUnits);
    
    // Mettre à jour l'armée dans le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const updatedArmies = armies.map((a: any) => {
      if (a.armyId === armyId) {
        return {
          ...a,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    
    localStorage.setItem('army_list', JSON.stringify(updatedArmies));
  };

  const handleRemoveUnit = (unitId: string) => {
    // Retirer l'unité de l'armée
    const updatedUnits = armyUnits.filter(unit => unit.id !== unitId);
    
    // Mettre à jour l'état local immédiatement
    setArmyUnits(updatedUnits);
    
    // Mettre à jour l'armée dans le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const updatedArmies = armies.map((a: any) => {
      if (a.armyId === armyId) {
        return {
          ...a,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    
    localStorage.setItem('army_list', JSON.stringify(updatedArmies));
    
    // Forcer une mise à jour des points
    const newTotalPoints = calculateTotalPoints(updatedUnits);
    setTotalPoints(newTotalPoints);
  };

  const handleOpenDetachmentDetail = () => {
    setDetachmentDetailOpen(true);
  };

  const handleCloseDetachmentDetail = () => {
    setDetachmentDetailOpen(false);
  };

  const handleOpenFactionRules = () => {
    setFactionRulesOpen(true);
  };

  const handlePointsChange = (points: number) => {
    setTotalPoints(points);
  };

  const handleUnitAdded = () => {
    if (armyId) {
      // Rafraîchir les unités dans le service
      armyService.refreshUnits(armyId);
      // Récupérer les unités mises à jour
      const updatedUnits = armyService.getArmyUnits(armyId);
      setArmyUnits(updatedUnits);
      // Mettre à jour les points
      const newTotalPoints = calculateTotalPoints(updatedUnits);
      setTotalPoints(newTotalPoints);
    }
  };

  // Effet pour écouter les changements d'armée
  useEffect(() => {
    if (armyId) {
      const updatedUnits = armyService.getArmyUnits(armyId);
      setArmyUnits(updatedUnits);
      
      // Mettre à jour les points
      const newTotalPoints = calculateTotalPoints(updatedUnits);
      setTotalPoints(newTotalPoints);
    }
  }, [armyId]);

  const handleUnitSelect = (unit: ArmyUnit) => {
    setSelectedDatasheet(unit);
    setIsFromArmyList(true);
    setSelectedItem({ type: 'army', id: unit.id });
  };

  const handleOptionsClick = () => {
    // Ici, vous pouvez ajouter la logique pour gérer les options de l'unité
    // Par exemple, ouvrir un menu contextuel ou une boîte de dialogue
  };

  const handleUnitUpdated = () => {
    // Rafraîchir la liste des unités après la mise à jour
    if (armyId) {
      // Rafraîchir les unités dans le service
      armyService.refreshUnits(armyId);
      
      // Récupérer les unités mises à jour
      const updatedUnits = armyService.getArmyUnits(armyId);
      setArmyUnits(updatedUnits);
      
      // Si une datasheet est sélectionnée, la mettre à jour avec la version la plus récente
      if (selectedDatasheet) {
        const updatedDatasheet = updatedUnits.find(unit => unit.id === selectedDatasheet.id);
        if (updatedDatasheet) {
          setSelectedDatasheet(updatedDatasheet);
        }
      }
      
      // Mettre à jour les points totaux
      const newTotalPoints = calculateTotalPoints(updatedUnits);
      setTotalPoints(newTotalPoints);
    }
  };

  const handleDetachmentChange = (newDetachment: any) => {
    setDetachment(newDetachment);
    setDetachmentSelectorOpen(false);

    // Supprimer tous les enhancements des unités
    const updatedUnits = armyUnits.map(unit => ({
      ...unit,
      enhancements: []
    }));
    setArmyUnits(updatedUnits);

    // Mettre à jour l'armée dans le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const updatedArmies = armies.map((a: any) => {
      if (a.armyId === armyId) {
        return {
          ...a,
          detachment: newDetachment,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    localStorage.setItem('army_list', JSON.stringify(updatedArmies));
  };

  // Fonction pour vérifier la présence d'unités combinées
  const checkForCombinedUnits = (units: ArmyUnit[]) => {
    return units.some(unit => 'isCombinedUnit' in unit);
  };

  // Fonction pour supprimer les unités combinées
  const removeCombinedUnits = () => {
    const updatedUnits = armyUnits.filter(unit => !('isCombinedUnit' in unit));
    setArmyUnits(updatedUnits);
    
    // Mettre à jour le localStorage
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const updatedArmies = armies.map((a: any) => {
      if (a.armyId === armyId) {
        return {
          ...a,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });
    localStorage.setItem('army_list', JSON.stringify(updatedArmies));
    
    // Mettre à jour les points
    const newTotalPoints = calculateTotalPoints(updatedUnits);
    setTotalPoints(newTotalPoints);
  };

  const handleContinueToBuilder = () => {
    removeCombinedUnits();
    setShowCombinedUnitsDialog(false);
  };

  const handleCancel = () => {
    setShowCombinedUnitsDialog(false);
    navigate(-1); // Retourner à la page précédente
  };

  // En mobile, si l'armée contient au moins une unité, afficher l'onglet ArmyList par défaut
  useEffect(() => {
    if (isMobile && armyUnits.length > 0) {
      setSelectedTab(1);
    }
  }, [isMobile, armyUnits.length]);

  return (
    <>
      <ScreenLayout
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src={`https://raw.githubusercontent.com/ronplanken/40k-Data-Card/master/src/dc/${factionId}.svg`}
              alt={factionName}
              sx={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
              }}
            />
            {isMobile ? armyName : `Création de liste - ` + armyName}
          </Box>
        }
        leftAction={
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        tabsLabels={isMobile ? undefined : ["Unités disponibles", "Liste d'armée en cours"]}
        leftContent={
            !isMobile && (
              <DatasheetList 
                factionId={factionId}
                onSelectDatasheet={handleDatasheetSelect}
                onAdd={handleAddUnit}
                onUnitAdded={handleUnitAdded}
                selectedItem={selectedItem}
                detachment={detachment}
              />
            )
        }
        rightContent={
            <ArmyList 
              units={armyUnits.map(u => ({
                ...u,
                datasheetId: u.datasheetId ?? u.id
              }))} 
              armyName={armyName}
              lastUpdated={new Date().toLocaleDateString('fr-FR')}
              factionName={factionName}
              factionId={factionId}
              detachment={detachment}
              totalPoints={totalPoints}
              onOpenFactionRules={handleOpenFactionRules}
              onOpenDetachmentDetail={handleOpenDetachmentDetail}
              onRemove={handleRemoveUnit}
              onPointsChange={handlePointsChange}
              onSelectUnit={handleUnitSelect}
              onDetachmentChange={handleDetachmentChange}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              onUnitAdded={handleUnitAdded}
            />
        }
        pinLeft={!isMobile}
        pinRight={!isMobile}
        topContent={isMobile ? 
          <Box sx={{ mx:2, mt: 1.5, }}>
            <PointsProgressBar totalPoints={totalPoints} />
          </Box>
         : undefined}
        selectedTab={isMobile ? 1 : selectedTab}
        onTabChange={setSelectedTab}
      >
        <Box sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          {selectedDatasheet && !isMobile && (
            <UnitCard 
              unit={selectedDatasheet}
              army={{
                faction: factionName,
                factionId: factionId
              }}
              isFromArmyList={isFromArmyList}
              isBattleMode={false}
              onUnitAdded={handleUnitAdded}
              onOptionsClick={handleOptionsClick}
              onUnitUpdated={handleUnitUpdated}
            />
          )}
        </Box>
      </ScreenLayout>
      <FactionRules
        open={factionRulesOpen}
        onClose={() => setFactionRulesOpen(false)}
        factionId={factionId}
        factionName={factionName}
      />
      <DetachmentDetails
        open={detachmentDetailOpen}
        onClose={handleCloseDetachmentDetail}
        detachment={detachment}
        faction={{
          id: factionId,
          name: factionName,
          iconUrl: '',
          rules: {}
        }}
      />
      <Dialog
        open={showCombinedUnitsDialog}
        onClose={handleCancel}
        aria-labelledby="combined-units-dialog-title"
      >
        <DialogTitle id="combined-units-dialog-title">
          Attention - Unités combinées détectées
        </DialogTitle>
        <DialogContent>
          <Typography>
            Votre liste comporte des unités combinées. Si vous continuez, elles seront effacées.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Annuler
          </Button>
          <Button onClick={handleContinueToBuilder} color="primary" variant="contained">
            Continuer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArmyBuilder; 