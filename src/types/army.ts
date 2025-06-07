import { Detachment } from './detachment';
import { Datasheet } from './datasheet';
import { Enhancement } from './detachment';

export interface ArmyList{
  armyList: Army[];
}


export interface Army {
  armyId: string;
  name: string;
  points: number;
  faction: string;
  factionId: string;
  subfaction?: string;
  chapter: string;
  armyRule: ArmyRule[];
  detachment: Detachment;
  units: Unit[];
  importDate: string;
  createdAt: string;
  updatedAt: string;
  totalPoints?: number;
  factionRules?: FactionRule[];
  obsolete?: boolean;
  version?: string;
}

export interface ArmyRule {
  name: string;
  rule: {
    name: string;
    text: string;
  }[];
  order: number;
}

export interface FactionRules {
  army?: ArmyRule[];
  detachment?: {
    name: string;
    detachment: string;
  }[];
  detachment_rules?: {
    [key: string]: {
      detachment: string;
      description: string;
    };
  };
  enhancements?: {
    name: string;
    description: string;
    cost: number;
  }[];
  stratagems?: {
    name: string;
    description: string;
    cost: number;
  }[];
}

export interface Ability {
  id: string;
  type: string;
  name: string;
  description: string;
  unitName?: string;
}

// Nouveau type pour les valeurs de caractéristiques
export type CharacteristicValue = {
  origin: string | number;
  modified: string | number;
};

// Nouveau type pour les stats d'armes
export interface WeaponStat {
  range: CharacteristicValue;
  A: CharacteristicValue;
  CAP: CharacteristicValue; // équivalent CT ou CC
  S: CharacteristicValue;   // équivalent Force
  AP: CharacteristicValue;
  D: CharacteristicValue;
}

export interface Carac {
  id: string;
  name: string;
  type: string;
  M: CharacteristicValue;
  T: CharacteristicValue;
  SV: CharacteristicValue;
  W: CharacteristicValue;
  LD: CharacteristicValue;
  OC: CharacteristicValue;
  INV?: number;
  number: number;
}

export interface Unit {
  id: string;
  name: string;
  points: number;
  carac: Carac[];
  unitAbilities?: Ability[];
  factionAbilities?: Ability[];
  coreAbilities?: Ability[];
  unitKeywords?: Keyword[];
  factionKeywords?: Keyword[];
  weapons?: Weapon[];
  isLinked?: boolean;
  linkedTo?: string;
  isLost?: boolean;
}

export interface CombinedUnit extends Unit {
  isCombined: true;
  sourceUnits: string[];
}

export interface Keyword {
  type: 'faction' | 'unit';
  id: string;
  name: string;
}

export interface Weapon {
  id: string;
  name: string;
  isRanged: boolean;
  weaponKeywords: WeaponKeyword[];
  profileWeapon: ProfileWeapon[];
  number: number;
}

export interface ProfileWeapon {
  id: string;
  name: string;
  isRanged: boolean;
  range: CharacteristicValue;
  A: CharacteristicValue;
  cap: CharacteristicValue; // équivalent CT ou CC
  S: CharacteristicValue;   // équivalent Force
  AP: CharacteristicValue;
  D: string;
}

export interface WeaponKeyword {
  id: string;
  name: string;
  description: string;
}

interface FactionRule {
  name: string;
  description: string;
}

export interface ArmyUnit extends Datasheet {
  enhancements?: Enhancement[];
  datasheetId?: string;
  // ...autres propriétés
} 