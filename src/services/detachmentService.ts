import { Stratagem, Enhancement } from '../types/detachment';
import { Rule } from '../types/rule';
import { loadDatasource } from '../utils/datasourceDb';

export interface DetachmentRule {
  name: string;
  rules: Rule[];
}

export interface Detachment {
  name: string;
  detachment: string;
}

export class DetachmentService {
  static getDetachmentRulesFromObject(detachment: { name: string; rule: Rule[] }): DetachmentRule[] {
    return [{
      name: detachment.name,
      rules: detachment.rule
    }];
  }

  static async getDetachmentRulesFromFaction(factionId: string, detachmentId: string): Promise<Rule[]> {
    try {
      const datasource = await loadDatasource();

      // Recherche par id interne
      let factionData = datasource[`${factionId}_translated`];

      // Si la sous-faction n'a pas de détachements, utiliser ceux de la faction parente
      if (
        (!factionData?.rules?.detachment || factionData.rules.detachment.length === 0) &&
        factionData?.parent_id
      ) {
        const parentFaction = datasource[`${factionData.parent_id}_translated`];
        if (parentFaction && parentFaction.rules && parentFaction.rules.detachment) {
          factionData.rules.detachment = parentFaction.rules.detachment;
        }
      }


      let det = factionData.rules.detachment.find(
        (d: any) =>
          d.detachment.trim().toLowerCase() === (detachmentId || '').trim().toLowerCase()
      );

      // Si pas trouvé dans la sous-faction, chercher dans la faction parente
      if ((!det || !det.rule) && factionData.parent_id) {
        const parentFaction = datasource[`${factionData.parent_id}_translated`];
        if (parentFaction && parentFaction.rules && parentFaction.rules.detachment) {
          det = parentFaction.rules.detachment.find(
            (d: any) =>
              d.detachment.trim().toLowerCase() === (detachmentId || '').trim().toLowerCase()
          );
        }
      }

      if (!det || !det.rule) {
        return [];
      }

      return det.rule;
    } catch (error) {
      return [];
    }
  }

  static async getDetachmentEnhancements(factionId: string, detachmentId: string): Promise<Enhancement[]> {
    const datasource = await loadDatasource();
    // Recherche de la faction
    let factionData = datasource[`${factionId}_translated`];

    let enhancementList = factionData?.enhancements?.filter((enhancement: any) =>
      enhancement.detachment === detachmentId
    ) || [];

    // Si pas trouvé dans la sous-faction, chercher dans la faction parente
    if (enhancementList.length === 0 && factionData?.parent_id) {
      const parentFaction = datasource[`${factionData.parent_id}_translated`];
      enhancementList = parentFaction?.enhancements?.filter((enhancement: any) =>
        enhancement.detachment === detachmentId
      ) || [];
    }

    return enhancementList.map((enhancement: any) => ({
      name: enhancement.name,
      cost: enhancement.cost,
      description: enhancement.description,
      type: enhancement.type,
      keywords: enhancement.keywords || [],
      excludes: enhancement.excludes || [],
      faction_id: enhancement.faction_id,
      detachment: enhancement.detachment
    }));
  }

  static async getDetachmentStratagems(factionId: string, detachmentId: string): Promise<Stratagem[]> {
    const datasource = await loadDatasource();
    // Recherche de la faction
    let factionData = datasource[`${factionId}_translated`];


    let stratagemList = factionData?.stratagems?.filter((stratagem: any) =>
      stratagem.detachment === detachmentId
    ) || [];

    // Si pas trouvé dans la sous-faction, chercher dans la faction parente
    if (stratagemList.length === 0 && factionData?.parent_id) {
      const parentFaction = datasource[`${factionData.parent_id}_translated`];
      stratagemList = parentFaction?.stratagems?.filter((stratagem: any) =>
        stratagem.detachment === detachmentId
      ) || [];
    }


    return stratagemList.map((stratagem: any) => ({
      name: stratagem.name,
      cost: stratagem.cost,
      phase: stratagem.phase,
      when: stratagem.when,
      target: stratagem.target,
      effect: stratagem.effect,
      turn: stratagem.turn,
      type: stratagem.type || 'Battle Tactic'
    }));
  }

  private static getFactionKey(factionId: string, datasource: any): string {
    // Chercher la faction dans le datasource
    for (const [key, data] of Object.entries(datasource)) {
      if ((data as any).id === factionId) {
        return key;
      }
    }
    return factionId.toLowerCase();
  }

  static async getAvailableDetachments(factionId: string): Promise<Detachment[]> {
    try {
      const datasource = await loadDatasource();
      const factionData = datasource[`${factionId}_translated`];
      
      if (!factionData || !factionData.rules || !factionData.rules.detachment) {
        return [];
      }

      return factionData.rules.detachment.map((det: any) => ({
        name: det.name,
        detachment: det.detachment
      }));
    } catch (error) {
      return [];
    }
  }
}

export default DetachmentService; 