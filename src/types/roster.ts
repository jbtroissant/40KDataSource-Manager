export interface Roster {
  id: string;
  data: {
    roster: {
      name: string;
      costs: Cost[];
      forces: Force[];
    };
  };
}

export interface Cost {
  name: string;
  value: number;
}

export interface Force {
  rules: Rule[];
  selections: Selection[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
}

export interface Selection {
  id: string;
  name: string;
  type?: string;
  group?: string;
  profiles?: Profile[];
  selections?: Selection[];
  number?: number;
  categories?: Category[];
  rules?: Rule[];
  costs?: Cost[];
}

export interface Profile {
  id: string;
  name: string;
  type?: string;
  typeName?: string;
  characteristics?: Characteristic[];
  number?: number;
}

export interface Characteristic {
  name: string;
  $text: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface GroupedProfile {
  names: string[];
  count: number;
  characteristics: Record<string, string>;
  typeName: string;
}

export interface GroupedWeapon {
  name: string;
  count: number;
  profiles: any[];
  rules: any[];
}

export interface Unit {
  name: string;
  profiles?: Profile[];
  selections?: Selection[];
  rules?: Record<string, string>;
  keywords?: string[];
  costs?: Array<{
    name: string;
    value: number;
  }>;
}

export interface ProfileWeapon {
  id: string;
  name: string;
  isRanged: boolean;
  range: number;
  A: number;
  cap: number;
  S: number;
  AP: number;
  D: string;
} 