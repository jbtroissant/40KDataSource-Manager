import { ArmyRule } from '../types/army';
import { getUnitKeywords } from '../config/subfactionKeywords';
import { UnitWithEnhancements } from '../types/unit';

interface ArmyData {
  armyId: string;
  name: string;
  faction: string;
  factionId: string;
  points: number;
  chapter: string;
  armyRule: ArmyRule[];
  detachment: {
    detachment: string;
    name: string;
    description: string;
    rules: { text: string; type: string }[];
    stratagems: any[];
    enhancements: any[];
  };
  units: UnitWithEnhancements[];
  importDate: string;
  createdAt: string;
  updatedAt: string;
}

class ArmyService {
  private readonly STORAGE_KEY = 'armies';
  private static instance: ArmyService;
  private listeners: ((units: UnitWithEnhancements[]) => void)[] = [];
  private currentArmyId: string | null = null;
  private currentUnits: UnitWithEnhancements[] = [];

  private constructor() {
    // Écouter les changements de localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'army_list' && this.currentArmyId) {
        this.refreshUnits(this.currentArmyId);
      }
    });
  }

  static getInstance(): ArmyService {
    if (!ArmyService.instance) {
      ArmyService.instance = new ArmyService();
    }
    return ArmyService.instance;
  }

  subscribe(listener: (units: UnitWithEnhancements[]) => void) {
    // Vérifier si le listener est déjà dans la liste
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(units: UnitWithEnhancements[]) {
    this.currentUnits = units;
    // Créer une copie des listeners pour éviter les problèmes de modification pendant l'itération
    const listenersCopy = [...this.listeners];
    listenersCopy.forEach(listener => {
      try {
        listener(units);
      } catch (error) {
      }
    });
  }

  private convertToArmy(roster: any): ArmyData {
    const force = roster.roster.forces[0];
    
    // Récupérer le nom du catalogue (faction) et le diviser
    const catalogueName = force.catalogueName || 'Faction inconnue';
    const [faction = 'Faction inconnue', chapter = ''] = catalogueName.split(' - ');
    
    const units = this.extractUnits(force.selections);
    const armyRule = this.extractArmyRules(force.rules);
    const detachment = this.extractDetachment(force.selections);
    const points = this.calculateTotalPoints(units);

    const newArmy: ArmyData = {
      armyId: crypto.randomUUID(),
      name: roster.roster.name || 'Armée sans nom',
      faction: faction,
      factionId: faction.toLowerCase().replace(/\s+/g, ''),
      points: points,
      chapter: chapter,
      armyRule: armyRule,
      detachment: {
        detachment: detachment?.name || '',
        name: detachment?.name || '',
        description: '',
        rules: [{
          text: detachment?.rule || '',
          type: 'text'
        }],
        stratagems: [],
        enhancements: []
      },
      units: units,
      importDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newArmy;
  }

  private extractUnits(roster: any): any[] {
    // Implémentation de l'extraction des unités
    return [];
  }

  private extractArmyRules(roster: any): ArmyRule[] {
    // Implémentation de l'extraction des règles d'armée
    return [];
  }

  private extractDetachment(roster: any): { name: string; rule: string } | null {
    // Implémentation de l'extraction du détachement
    return null;
  }

  private calculateTotalPoints(units: any[]): number {
    return units.reduce((total, unit) => total + (unit.points || 0), 0);
  }

  async importRoster(roster: any): Promise<ArmyData> {
    const army = this.convertToArmy(roster);
    const armies = await this.getArmies();
    armies.push(army);
    await this.saveArmies(armies);
    return army;
  }

  async getArmies(): Promise<ArmyData[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async getArmyById(id: string): Promise<ArmyData | null> {
    const armies = await this.getArmies();
    return armies.find(army => army.armyId === id) || null;
  }

  private async saveArmies(armies: ArmyData[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(armies));
  }

  getArmyUnits(armyId: string): UnitWithEnhancements[] {
    this.currentArmyId = armyId;
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    this.currentUnits = army?.units || [];
    return this.currentUnits;
  }

  addUnit(armyId: string, unit: UnitWithEnhancements) {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    
    if (army) {
      const existingUnits = army.units || [];
      const unitExists = existingUnits.some((u: UnitWithEnhancements) => u.id === unit.id);
      
      if (!unitExists) {

        // Copier la sauvegarde invulnérable dans les stats si elle existe
        if (unit.abilities && unit.abilities.invul && unit.abilities.invul.value) {
          unit.stats = unit.stats.map(stat => ({
            ...stat,
            invul: unit.abilities!.invul!.value
          }));
        }

        // Ajouter les mots-clés spécifiques à la sous-faction
        const subfaction = army.subfaction || army.faction;
        if (subfaction) {
         
          const subfactionKeywords = getUnitKeywords(unit.name, subfaction);
          if (subfactionKeywords.length > 0) {
            unit.keywords = [...(unit.keywords || []), ...subfactionKeywords];
          }
        } else {
        }

        const updatedUnits = [...existingUnits, unit];
        const updatedArmy = {
          ...army,
          units: updatedUnits,
          updatedAt: new Date().toISOString()
        };
        
        const updatedArmies = armies.map((a: any) => 
          a.armyId === armyId ? updatedArmy : a
        );
        
        localStorage.setItem('army_list', JSON.stringify(updatedArmies));
        // PATCH: recharge la liste depuis le localStorage pour être sûr d'avoir la version à jour
        const refreshedArmies = JSON.parse(localStorage.getItem('army_list') || '[]');
        const refreshedArmy = refreshedArmies.find((a: any) => a.armyId === armyId);
        this.currentUnits = refreshedArmy?.units || [];
        this.notifyListeners(this.currentUnits);
      }
    }
  }

  removeUnit(armyId: string, unitId: string) {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      const existingUnits = army.units || [];
      const updatedUnits = existingUnits.filter((u: UnitWithEnhancements) => u.id !== unitId);
      
      const updatedArmy = {
        ...army,
        units: updatedUnits,
        updatedAt: new Date().toISOString()
      };
      
      const updatedArmies = armies.map((a: any) => 
        a.armyId === armyId ? updatedArmy : a
      );
      
      localStorage.setItem('army_list', JSON.stringify(updatedArmies));
      const refreshedArmies = JSON.parse(localStorage.getItem('army_list') || '[]');
      const refreshedArmy = refreshedArmies.find((a: any) => a.armyId === armyId);
      this.currentUnits = refreshedArmy?.units || [];
      this.notifyListeners(this.currentUnits);
    }
  }

  refreshUnits(armyId: string) {
    this.currentArmyId = armyId;
    const units = this.getArmyUnits(armyId);
    this.currentUnits = units;
    this.notifyListeners(units);
  }

  saveCurrentState(armyId: string) {
    const armies = JSON.parse(localStorage.getItem('army_list') || '[]');
    const army = armies.find((a: any) => a.armyId === armyId);
    
    if (army) {
      localStorage.setItem('army_list', JSON.stringify(armies));
      this.currentUnits = army.units || [];
      this.notifyListeners(army.units || []);
    }
  }
}

export const armyService = ArmyService.getInstance(); 