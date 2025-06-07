import { Datasheet } from './datasheet';
import { Enhancement } from './detachment';

export interface UnitWithEnhancements extends Datasheet {
  datasheetId: string;
  enhancements?: Enhancement[];
  isLinked?: boolean;
  linkedTo?: string;
  isCombinedUnit?: boolean;
  isLost?: boolean;
  warlord?: boolean;
  // Ajoute ici d'autres propriétés spécifiques si besoin
} 