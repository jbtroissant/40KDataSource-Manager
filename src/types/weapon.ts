export interface WeaponProfile {
  name: string;
  range?: string;
  attacks: string | number;
  skill: string | number;
  strength: string | number;
  ap: string | number;
  damage: string | number;
  keywords?: string[];
  hidden?: boolean;
}

export interface Weapon {
  profiles: WeaponProfile[];
  active?: boolean;
} 