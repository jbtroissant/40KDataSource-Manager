import { useState, useEffect } from 'react';
import { Army } from '../types/army';
import { StorageService } from '../services/storageService';

/**
 * Hook pour gérer l'état des armées
 * @returns L'état des armées et les fonctions pour le modifier
 */
export function useArmy() {
  const [armyList, setArmyList] = useState<Army[]>([]);
  const [selectedArmy, setSelectedArmy] = useState<Army | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    loadArmyList();
  }, []);

  /**
   * Charge la liste des armées depuis le stockage local
   */
  const loadArmyList = async () => {
    try {
      setLoading(true);
      const savedArmies = StorageService.loadArmyList();
      setArmyList(savedArmies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setArmyList([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sauvegarde la liste des armées dans le stockage local
   */
  const saveArmyList = async (armies: Army[]) => {
    try {
      setLoading(true);
      StorageService.saveArmyList(armies);
      setArmyList(armies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajoute une armée à la liste
   */
  const addArmy = async (army: Army) => {
    try {
      setLoading(true);
      const updatedArmies = [...armyList, army];
      StorageService.saveArmyList(updatedArmies);
      setArmyList(updatedArmies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprime une armée de la liste
   */
  const deleteArmy = async (armyId: string) => {
    try {
      setLoading(true);
      StorageService.deleteArmy(armyId);
      setArmyList(prev => prev.filter(army => army.armyId !== armyId));
      if (selectedArmy?.armyId === armyId) {
        setSelectedArmy(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour une armée existante
   */
  const updateArmy = async (armyId: string, updates: Partial<Army>) => {
    try {
      setLoading(true);
      const updatedArmies = armyList.map(army => 
        army.armyId === armyId ? { ...army, ...updates } : army
      );
      StorageService.saveArmyList(updatedArmies);
      setArmyList(updatedArmies);
      
      // Mettre à jour l'armée sélectionnée si nécessaire
      if (selectedArmy?.armyId === armyId) {
        setSelectedArmy(prev => prev ? { ...prev, ...updates } : null);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  };



  return {
    armyList,
    selectedArmy,
    setSelectedArmy,
    loading,
    error,
    loadArmyList,
    saveArmyList,
    addArmy,
    deleteArmy,
    updateArmy,
  };
} 