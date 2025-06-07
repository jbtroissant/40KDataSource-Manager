import { Army } from '../types/army';

const STORAGE_KEY = 'army_list';

/**
 * Service de gestion du stockage local
 */
export class StorageService {
  /**
   * Sauvegarde une liste d'armées dans le localStorage
   * @param armies - La liste d'armées à sauvegarder
   * @throws Error si la sauvegarde échoue
   */
  public static saveArmyList(armies: Army[]): void {
    try {
      const serializedData = JSON.stringify(armies);
      localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
      throw new Error('Impossible de sauvegarder les données');
    }
  }

  /**
   * Charge la liste d'armées depuis le localStorage
   * @returns La liste d'armées chargée ou un tableau vide si aucune donnée n'existe
   * @throws Error si le chargement échoue
   */
  public static loadArmyList(): Army[] {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      
      if (!serializedData) {
        return [];
      }

      const data = JSON.parse(serializedData);
      
      if (!Array.isArray(data)) {
        return [];
      }

      const armies = data.map(army => this.ensureValidArmy(army));
      return armies;
    } catch (error) {
      return [];
    }
  }

  /**
   * Ajoute une armée à la liste existante
   * @param army - L'armée à ajouter
   * @throws Error si l'ajout échoue
   */
  public static addArmy(army: Army): void {
    try {
      const armies = this.loadArmyList();
      armies.push(army);
      this.saveArmyList(armies);
    } catch (error) {
      throw new Error('Impossible d\'ajouter l\'armée');
    }
  }

  /**
   * Supprime une armée de la liste par son ID
   * @param armyId - L'ID de l'armée à supprimer
   * @throws Error si la suppression échoue
   */
  public static deleteArmy(armyId: string): void {
    try {
      const armies = this.loadArmyList();
      const filteredArmies = armies.filter(army => army.armyId !== armyId);
      this.saveArmyList(filteredArmies);
    } catch (error) {
      throw new Error('Impossible de supprimer l\'armée');
    }
  }

  private static ensureValidArmy(data: any): Army {
    const defaultArmy: Army = {
      armyId: '',
      name: '',
      points: 0,
      faction: '',
      factionId: '',
      chapter: '',
      armyRule: [],
      detachment: {
        detachment: '',
        name: '',
        description: '',
        rules: [],
        stratagems: [],
        enhancements: []
      },
      units: [],
      importDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!data || typeof data !== 'object') {
      return defaultArmy;
    }

    // Fusionner les données avec les valeurs par défaut
    const army = {
      ...defaultArmy,
      ...data,
      // S'assurer que les tableaux sont toujours des tableaux
      armyRule: Array.isArray(data.armyRule) ? data.armyRule : [],
      units: Array.isArray(data.units) ? data.units.map((unit: any) => ({
        ...unit,
        // S'assurer que les capacités ont le champ unitName
        unitAbilities: Array.isArray(unit.unitAbilities) ? unit.unitAbilities.map((ability: any) => ({
          ...ability,
          unitName: ability.unitName || unit.name
        })) : [],
        factionAbilities: Array.isArray(unit.factionAbilities) ? unit.factionAbilities.map((ability: any) => ({
          ...ability,
          unitName: ability.unitName || unit.name
        })) : [],
        coreAbilities: Array.isArray(unit.coreAbilities) ? unit.coreAbilities.map((ability: any) => ({
          ...ability,
          unitName: ability.unitName || unit.name
        })) : [],
        // S'assurer que les caractéristiques sont des nombres
        carac: Array.isArray(unit.carac) ? unit.carac.map((carac: any) => ({
          ...carac,
          M: typeof carac.M === 'object' ? carac.M : { origin: typeof carac.M === 'string' ? parseInt(carac.M) || 0 : (typeof carac.M === 'number' ? carac.M : 0), modified: typeof carac.M === 'string' ? parseInt(carac.M) || 0 : (typeof carac.M === 'number' ? carac.M : 0) },
          T: typeof carac.T === 'object' ? carac.T : { origin: typeof carac.T === 'string' ? parseInt(carac.T) || 0 : (typeof carac.T === 'number' ? carac.T : 0), modified: typeof carac.T === 'string' ? parseInt(carac.T) || 0 : (typeof carac.T === 'number' ? carac.T : 0) },
          SV: typeof carac.SV === 'object' ? carac.SV : { origin: typeof carac.SV === 'string' ? parseInt(carac.SV) || 0 : (typeof carac.SV === 'number' ? carac.SV : 0), modified: typeof carac.SV === 'string' ? parseInt(carac.SV) || 0 : (typeof carac.SV === 'number' ? carac.SV : 0) },
          W: typeof carac.W === 'object' ? carac.W : { origin: typeof carac.W === 'string' ? parseInt(carac.W) || 0 : (typeof carac.W === 'number' ? carac.W : 0), modified: typeof carac.W === 'string' ? parseInt(carac.W) || 0 : (typeof carac.W === 'number' ? carac.W : 0) },
          LD: typeof carac.LD === 'object' ? carac.LD : { origin: typeof carac.LD === 'string' ? parseInt(carac.LD) || 0 : (typeof carac.LD === 'number' ? carac.LD : 0), modified: typeof carac.LD === 'string' ? parseInt(carac.LD) || 0 : (typeof carac.LD === 'number' ? carac.LD : 0) },
          OC: typeof carac.OC === 'object' ? carac.OC : { origin: typeof carac.OC === 'string' ? parseInt(carac.OC) || 0 : (typeof carac.OC === 'number' ? carac.OC : 0), modified: typeof carac.OC === 'string' ? parseInt(carac.OC) || 0 : (typeof carac.OC === 'number' ? carac.OC : 0) },
          INV: typeof carac.INV === 'string' ? parseInt(carac.INV) || 0 : (typeof carac.INV === 'number' ? carac.INV : 0),
          number: typeof carac.number === 'string' ? parseInt(carac.number) || 1 : (typeof carac.number === 'number' ? carac.number : 1)
        })) : [],
        // S'assurer que les armes ont les bonnes valeurs
        weapons: Array.isArray(unit.weapons) ? unit.weapons.map((weapon: any) => ({
          ...weapon,
          profileWeapon: Array.isArray(weapon.profileWeapon) ? weapon.profileWeapon.map((profile: any) => ({
            ...profile,
            range: typeof profile.range === 'object' ? profile.range : { origin: typeof profile.range === 'string' ? parseInt(profile.range) || 0 : (typeof profile.range === 'number' ? profile.range : 0), modified: typeof profile.range === 'string' ? parseInt(profile.range) || 0 : (typeof profile.range === 'number' ? profile.range : 0) },
            A: typeof profile.A === 'object' ? profile.A : { origin: typeof profile.A === 'string' ? parseInt(profile.A) || 0 : (typeof profile.A === 'number' ? profile.A : 0), modified: typeof profile.A === 'string' ? parseInt(profile.A) || 0 : (typeof profile.A === 'number' ? profile.A : 0) },
            cap: typeof profile.cap === 'object' ? profile.cap : { origin: typeof profile.cap === 'string' ? parseInt(profile.cap) || 0 : (typeof profile.cap === 'number' ? profile.cap : 0), modified: typeof profile.cap === 'string' ? parseInt(profile.cap) || 0 : (typeof profile.cap === 'number' ? profile.cap : 0) },
            S: typeof profile.S === 'object' ? profile.S : { origin: typeof profile.S === 'string' ? parseInt(profile.S) || 0 : (typeof profile.S === 'number' ? profile.S : 0), modified: typeof profile.S === 'string' ? parseInt(profile.S) || 0 : (typeof profile.S === 'number' ? profile.S : 0) },
            AP: typeof profile.AP === 'object' ? profile.AP : { origin: typeof profile.AP === 'string' ? parseInt(profile.AP) || 0 : (typeof profile.AP === 'number' ? profile.AP : 0), modified: typeof profile.AP === 'string' ? parseInt(profile.AP) || 0 : (typeof profile.AP === 'number' ? profile.AP : 0) },
            // D reste une chaîne de caractères
            D: typeof profile.D === 'string' ? profile.D : (typeof profile.D === 'number' ? profile.D.toString() : '')
          })) : []
        })) : []
      })) : [],
      // S'assurer que l'ID existe
      armyId: data.armyId || crypto.randomUUID(),
      // S'assurer que la date d'import existe
      importDate: data.importDate || defaultArmy.importDate,
      // S'assurer que la faction existe
      faction: data.faction || defaultArmy.faction,
      // S'assurer que le détachement existe
      detachment: {
        detachmentName: data.detachment?.detachment || defaultArmy.detachment.detachment,
        rulesName: data.detachment?.name || defaultArmy.detachment.name,
        description: data.detachment?.description || defaultArmy.detachment.description,
        rules: data.detachment?.rules || defaultArmy.detachment.rules,
        stratagems: data.detachment?.stratagems || defaultArmy.detachment.stratagems,
        enhancements: data.detachment?.enhancements || defaultArmy.detachment.enhancements
      }
    };

    return army;
  }
} 