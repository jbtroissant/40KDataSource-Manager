import { Datasheet } from '../types/datasheet';

class DatasheetService {
  private datasheets: Datasheet[] = [];

  async getDatasheetsByFaction(factionId: string): Promise<Datasheet[]> {
    // TODO: Implémenter la récupération des datasheets depuis l'API
    return this.datasheets.filter(datasheet => datasheet.faction_id === factionId);
  }

  async getDatasheetById(id: string): Promise<Datasheet | null> {
    // TODO: Implémenter la récupération d'une datasheet depuis l'API
    return this.datasheets.find(datasheet => datasheet.id === id) || null;
  }
}

export const datasheetService = new DatasheetService(); 