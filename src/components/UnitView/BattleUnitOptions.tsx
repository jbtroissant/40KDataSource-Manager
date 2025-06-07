import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { UnitWithEnhancements } from '../../types/unit';
import { armyService } from '../../services/armyService';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface BattleUnitOptionsProps {
  unit: UnitWithEnhancements;
  armyId: string | undefined;
  menuAnchorEl: HTMLElement | null;
  onMenuClose: () => void;
  onUnitUpdated?: () => void;
}

const BattleUnitOptions: React.FC<BattleUnitOptionsProps> = ({
  unit,
  armyId,
  menuAnchorEl,
  onMenuClose,
  onUnitUpdated
}) => {
  const { showSnackbar } = useSnackbar();
  const [menuKey, setMenuKey] = useState(0);

  const forceMenuRefresh = () => {
    setMenuKey(prev => prev + 1);
  };

  const handleMarkAsLoss = () => {
    if (!armyId) return;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    if (army) {
      if ('isCombinedUnit' in unit) {
        // Pour une unité combinée, marquer toutes les unités liées comme perdues et les délier
        const linkedUnits = army.units.filter((u: any) => u.linkedTo === unit.id);
        
        const updatedUnits = army.units.map((u: any) => {
          if (linkedUnits.some((linkedUnit: UnitWithEnhancements) => linkedUnit.id === u.id)) {
            const { isLinked, linkedTo, ...rest } = u;
            return { ...rest, isLost: true };
          }
          return u;
        }).filter((u: any) => u.id !== unit.id);
        
        const updatedArmy = {
          ...army,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
        
        const updatedArmies = armies.map((a: any) => 
          a.armyId === armyId ? updatedArmy : a
        );
        localStorage.setItem('army_list', JSON.stringify(updatedArmies));
        
        armyService.refreshUnits(armyId);
        showSnackbar('Unité combinée retirée comme perte', 'info');
      } else {
        if (unit.linkedTo) {
          const linkedUnits = army.units.filter((u: any) => u.linkedTo === unit.linkedTo);
          const remainingLinkedUnits = linkedUnits.filter((u: any) => !u.isLost && u.id !== unit.id);

          const updatedUnits = army.units.map((u: any) => {
            if (u.id === unit.id) {
              const { isLinked, linkedTo, ...rest } = u;
              return { ...rest, isLost: true };
            }
            return u;
          });

          if (remainingLinkedUnits.length <= 1) {
            const finalUnits = updatedUnits.map((u: any) => {
              if (u.isLinked && u.linkedTo === unit.linkedTo) {
                const { isLinked, linkedTo, ...rest } = u;
                return rest;
              }
              return u;
            }).filter((u: any) => u.id !== unit.linkedTo);

            const updatedArmy = {
              ...army,
              units: finalUnits,
              updatedAt: new Date().toISOString()
            };
            
            const updatedArmies = armies.map((a: any) => 
              a.armyId === armyId ? updatedArmy : a
            );
            localStorage.setItem('army_list', JSON.stringify(updatedArmies));
          } else {
            const updatedArmy = {
              ...army,
              units: updatedUnits,
              updatedAt: new Date().toISOString()
            };
            
            const updatedArmies = armies.map((a: any) => 
              a.armyId === armyId ? updatedArmy : a
            );
            localStorage.setItem('army_list', JSON.stringify(updatedArmies));
          }
        } else {
          const updatedUnits = army.units.map((u: any) => {
            if (u.id === unit.id) {
              return { ...u, isLost: true };
            }
            return u;
          });

          const updatedArmy = {
            ...army,
            units: updatedUnits,
            updatedAt: new Date().toISOString()
          };
          
          const updatedArmies = armies.map((a: any) => 
            a.armyId === armyId ? updatedArmy : a
          );
          localStorage.setItem('army_list', JSON.stringify(updatedArmies));
        }
        
        armyService.refreshUnits(armyId);
        showSnackbar('Unité retirée comme perte', 'info');
      }
    }
    forceMenuRefresh();
    onMenuClose();
  };

  const handleUnlinkUnits = () => {
    if (!armyId || !('isCombinedUnit' in unit)) return;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      const updatedUnits = army.units.map((u: any) => {
        if (u.isLinked && u.linkedTo === unit.id) {
          const { isLinked, linkedTo, ...rest } = u;
          return rest;
        }
        return u;
      }).filter((u: any) => u.id !== unit.id);
      
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArmies = armies.map((a: any) => 
        a.armyId === armyId ? updatedArmy : a
      );
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      armyService.refreshUnits(armyId);
      showSnackbar('Unités dissociées', 'success');
    }
    forceMenuRefresh();
    onMenuClose();
  };

  const handleRestoreUnit = () => {
    if (!armyId) return;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      const updatedUnits = army.units.map((u: any) => {
        if (u.id === unit.id) {
          const { isLost, ...rest } = u;
          return rest;
        }
        return u;
      });
      
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArmies = armies.map((a: any) => 
        a.armyId === armyId ? updatedArmy : a
      );
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      armyService.refreshUnits(armyId);
      showSnackbar('Unité rétablie', 'success');
    }
    forceMenuRefresh();
    onMenuClose();
  };

  const handleResetModifiedValues = () => {
    if (!armyId) return;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    if (army) {
      const updatedUnits = army.units.map((u: any) => {
        if (u.id !== unit.id) return u;
        let cleanedStats = u.stats;
        if (u.stats) {
          cleanedStats = u.stats.map((stat: any) => {
            const cleanedStat = { ...stat };
            Object.keys(cleanedStat).forEach(key => {
              if (key.startsWith('modified_')) {
                delete cleanedStat[key];
              }
            });
            return cleanedStat;
          });
        }
        let cleanedRangedWeapons = u.rangedWeapons;
        if (u.rangedWeapons) {
          cleanedRangedWeapons = u.rangedWeapons.map((weapon: any) => ({
            ...weapon,
            profiles: weapon.profiles.map((profile: any) => {
              const cleanedProfile = { ...profile };
              Object.keys(cleanedProfile).forEach(key => {
                if (key.startsWith('modified_')) {
                  delete cleanedProfile[key];
                }
              });
              return cleanedProfile;
            })
          }));
        }
        let cleanedMeleeWeapons = u.meleeWeapons;
        if (u.meleeWeapons) {
          cleanedMeleeWeapons = u.meleeWeapons.map((weapon: any) => ({
            ...weapon,
            profiles: weapon.profiles.map((profile: any) => {
              const cleanedProfile = { ...profile };
              Object.keys(cleanedProfile).forEach(key => {
                if (key.startsWith('modified_')) {
                  delete cleanedProfile[key];
                }
              });
              return cleanedProfile;
            })
          }));
        }
        return {
          ...u,
          stats: cleanedStats,
          rangedWeapons: cleanedRangedWeapons,
          meleeWeapons: cleanedMeleeWeapons
        };
      });
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      const updatedArmies = armies.map((a: any) => a.armyId === armyId ? updatedArmy : a);
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      if (armyId) {
        armyService.refreshUnits(armyId);
      }
      
      if (onUnitUpdated) {
        onUnitUpdated();
      }
    }
    forceMenuRefresh();
    onMenuClose();
  };

  const handleSetWarlord = () => {
    if (!armyId) return;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    if (army) {
      const currentWarlord = army.units.find((u: any) => u.warlord === true);
      
      const updatedUnits = army.units.map((u: any) => {
        if (u.id === unit.id) {
          if (u.warlord === true) {
            const { warlord, ...rest } = u;
            return rest;
          }
          return { ...u, warlord: true };
        }
        if (currentWarlord && u.id === currentWarlord.id) {
          const { warlord, ...rest } = u;
          return rest;
        }
        return u;
      });

      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      const updatedArmies = armies.map((a: any) => a.armyId === armyId ? updatedArmy : a);
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      
      if (armyId) {
        armyService.refreshUnits(armyId);
      }
      
      if (onUnitUpdated) {
        onUnitUpdated();
      }

      showSnackbar(
        unit.warlord ? 'Unité retirée comme Seigneur de Guerre' : 'Unité définie comme Seigneur de Guerre',
        'success'
      );
    }
    forceMenuRefresh();
    onMenuClose();
  };

  return (
    <Menu
      key={menuKey}
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={onMenuClose}
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 3,
        }
      }}
    >
      {'isCombinedUnit' in unit && (
        <MenuItem onClick={handleUnlinkUnits} sx={{ color: 'warning.main' }}>
          Dissocier les unités
        </MenuItem>
      )}
      {('isLost' in unit && unit.isLost) ? (
        <MenuItem onClick={handleRestoreUnit} sx={{ color: 'success.main' }}>
          Rétablir
        </MenuItem>
      ) : (
        <MenuItem onClick={handleMarkAsLoss} sx={{ color: 'error.main' }}>
          Retirer comme perte
        </MenuItem>
      )}
      <MenuItem onClick={handleResetModifiedValues} sx={{ color: 'info.main' }}>
        Réinitialiser les modifs
      </MenuItem>
      <MenuItem 
        onClick={handleSetWarlord} 
        sx={{ 
          color: unit.warlord ? 'warning.main' : 'primary.main',
          fontWeight: unit.warlord ? 'bold' : 'normal'
        }}
      >
        {unit.warlord ? 'Retirer comme Seigneur de Guerre' : 'Définir comme Seigneur de Guerre'}
      </MenuItem>
    </Menu>
  );
};

export default BattleUnitOptions; 