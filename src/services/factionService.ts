import { Faction } from '../types/faction';

class FactionService {
  private factions: Faction[] = [];

  async getFactionById(id: string): Promise<Faction | null> {
    // TODO: Implémenter la récupération d'une faction depuis l'API
    return this.factions.find(faction => faction.id === id) || null;
  }

  async getAllFactions(): Promise<Faction[]> {
    // TODO: Implémenter la récupération de toutes les factions depuis l'API
    return this.factions;
  }

  async getSubfactions(parentFactionId: string): Promise<Faction[]> {
    // TODO: Implémenter la récupération des sous-factions depuis l'API
    return this.factions.filter(faction => 
      faction.is_subfaction && faction.parent_faction_id === parentFactionId
    );
  }
}

export const factionService = new FactionService(); 