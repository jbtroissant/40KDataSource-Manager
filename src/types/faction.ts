import { Datasheet } from './datasheet';

export interface Faction {
  id: string;
  name: string;
  is_subfaction: boolean;
  parent_faction_id?: string;
  description?: string;
  logo_url?: string;
  datasheets?: Datasheet[];
} 