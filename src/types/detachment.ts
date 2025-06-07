import { Rule } from './rule';
import { getPointsAsString } from './datasheet';

export interface Detachment {
  detachment: string;
  name: string;
  description: string;
  rules: Rule[];
  stratagems: Stratagem[];
  enhancements: Enhancement[];
}

export interface Stratagem {
  name: string;
  cost: string;
  phase: string[];
  when: string;
  target: string;
  effect: string;
  turn: 'either' | 'your' | 'opponents';
  type: string;
}

export interface Enhancement {
  name: string;
  cost: string;
  description: string;
  type: string;
  keywords: string[];
  excludes: string[];
  faction_id?: string;
  detachment?: string;
} 

// Fonction utilitaire pour créer un Enhancement avec un coût en nombre
export const createEnhancement = (enhancement: Omit<Enhancement, 'cost'> & { cost: number }): Enhancement => {
  return {
    ...enhancement,
    cost: getPointsAsString(enhancement.cost)
  };
}; 