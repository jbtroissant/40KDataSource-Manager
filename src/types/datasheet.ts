import { Enhancement } from './detachment';

export interface Datasheet {
  id: string;
  name: string;
  faction_id: string;
  factions: string[];
  points: Array<{
    cost: string;
    keyword: string | null;
    models: string;
    active: boolean;
  }>;
  keywords: string[];
  factionKeywords: string[];
  abilities: {
    core: string[];
    damaged?: {
      range: string;
      description: string;
      showDamagedAbility: boolean;
      showDescription: boolean;
    };
    faction: string[];
    invul?: {
      info: string;
      showAtTop: boolean;
      showInfo: boolean;
      showInvulnerableSave: boolean;
      value: string;
    };
    other: {
      name: string;
      description: string;
      showAbility: boolean;
      showDescription: boolean;
    }[];
    primarch: {
      name: string;
      showAbility: boolean;
      abilities: {
        name: string;
        description: string;
        showAbility: boolean;
        showDescription: boolean;
      }[];
    }[];
    special: {
      name: string;
      description: string;
      showAbility: boolean;
      showDescription: boolean;
    }[];
    wargear: {
      name: string;
      description: string;
      showAbility: boolean;
      showDescription: boolean;
    }[];
    feelNoPainValue?: string;
    scoutValue?: string;
    deadlyDemiseValue?: string;
  };
  stats: {
    active: boolean;
    ld: string;
    m: string;
    name: string;
    oc: string;
    showDamagedMarker: boolean;
    showName: boolean;
    sv: string;
    t: string;
    w: string;
    invul?: string;
    invulInfo?: string;
    statId?: string;
  }[];
  meleeWeapons: {
    active: boolean;
    profiles: {
      active: boolean;
      ap: string;
      attacks: string;
      damage: string;
      keywords: string[];
      name: string;
      range: string;
      skill: string;
      strength: string;
    }[];
  }[];
  rangedWeapons: {
    active: boolean;
    profiles: {
      active: boolean;
      ap: string;
      attacks: string;
      damage: string;
      keywords: string[];
      name: string;
      range: string;
      skill: string;
      strength: string;
    }[];
  }[];
  composition: string[];
  fluff: string;
  imperialArmour: boolean;
  leader: string;
  leadBy?: string[];
  loadout: string;
  source: string;
  transport: string;
  wargear: string[];
  cardType: string;
  legends?: boolean;
  enhancements?: Enhancement[];
  isLinked?: boolean;
  linkedTo?: string;
  isLost?: boolean;
  warlord?: boolean;
} 

export interface LinkedUnit extends Datasheet {
  linkedUnits: Datasheet[];
  isLinked: true;
  isCombinedUnit: true;
}

// Fonction utilitaire pour convertir les points en nombre
export const getPointsAsNumber = (points: string): number => {
  return parseInt(points, 10);
};

// Fonction utilitaire pour convertir un nombre en chaîne de points
export const getPointsAsString = (points: number): string => {
  return points.toString();
};

// Fonction utilitaire pour créer une unité liée
export const createLinkedUnit = (units: Datasheet[]): LinkedUnit => {
  // Calculer les points totaux
  const combinedPoints = units.reduce((acc, unit) => {
    const unitPoints = unit.points.find(p => p.active)?.cost || '0';
    return acc + getPointsAsNumber(unitPoints);
  }, 0);

  // Combiner les mots-clés et les mots-clés de faction
  const combinedKeywords = Array.from(new Set(units.flatMap(unit => unit.keywords || [])));
  const combinedFactionKeywords = Array.from(new Set(units.flatMap(unit => unit.factionKeywords || [])));
  
  // Combiner les capacités
  const combinedAbilities = {
    core: Array.from(new Set(units.flatMap(unit => unit.abilities.core || []))),
    faction: Array.from(new Set(units.flatMap(unit => unit.abilities.faction || []))),
    other: Array.from(new Set(units.flatMap(unit => unit.abilities.other || []))),
    special: Array.from(new Set(units.flatMap(unit => unit.abilities.special || []))),
    wargear: Array.from(new Set(units.flatMap(unit => unit.abilities.wargear || []))),
    primarch: Array.from(new Set(units.flatMap(unit => unit.abilities.primarch || []))),
    damaged: units.find(unit => unit.abilities.damaged)?.abilities.damaged,
    invul: units.find(unit => unit.abilities.invul)?.abilities.invul
  };

  // Combiner les statistiques et ajouter un statId unique à chaque stat
  const combinedStats = units.flatMap(unit =>
    (unit.stats || []).map(stat => ({
      ...stat,
      statId: stat.statId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15))
    }))
  );

  // Combiner les armes
  const combinedMeleeWeapons = units.flatMap(unit => unit.meleeWeapons || []);
  const combinedRangedWeapons = units.flatMap(unit => unit.rangedWeapons || []);

  // Combiner les autres propriétés
  const combinedComposition = Array.from(new Set(units.flatMap(unit => unit.composition || [])));
  const combinedWargear = Array.from(new Set(units.flatMap(unit => unit.wargear || [])));
  const combinedEnhancements = Array.from(new Set(units.flatMap(unit => unit.enhancements || [])));

  // Combiner les loadouts de toutes les unités
  const combinedLoadout = units.map(unit => {
    if (unit.loadout) {
      return `${unit.name}:\n${unit.loadout}`;
    }
    return null;
  }).filter(Boolean).join('\n\n');

  // Créer l'ID de l'unité liée
  const linkedUnitId = `linked-${units.map(u => u.id).join('-')}`;

  // Mettre à jour les unités liées avec une référence à l'unité combinée
  units.forEach(unit => {
    unit.isLinked = true;
    unit.linkedTo = linkedUnitId;
  });

  // Créer l'unité liée
  const linkedUnit: LinkedUnit = {
    id: linkedUnitId,
    name: units.map(u => u.name).join(' + '),
    faction_id: units[0].faction_id,
    factions: units[0].factions,
    points: [{
      cost: '0',
      keyword: null,
      models: '1',
      active: true
    }],
    keywords: combinedKeywords,
    factionKeywords: combinedFactionKeywords,
    abilities: combinedAbilities,
    stats: combinedStats,
    meleeWeapons: combinedMeleeWeapons,
    rangedWeapons: combinedRangedWeapons,
    composition: combinedComposition,
    fluff: units[0].fluff,
    imperialArmour: units.some(unit => unit.imperialArmour),
    leader: units[0].leader,
    loadout: combinedLoadout,
    source: units[0].source,
    transport: units[0].transport,
    wargear: combinedWargear,
    cardType: units[0].cardType,
    legends: units.some(unit => unit.legends),
    enhancements: combinedEnhancements,
    linkedUnits: [], // Ne plus stocker les unités liées ici
    isLinked: true,
    isCombinedUnit: true
  };

  return linkedUnit;
}; 