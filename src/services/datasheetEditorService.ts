import { Datasheet } from '../types/datasheet';
import { loadDatasource, saveDatasourceBloc } from '../utils/datasourceDb';

export interface DatasheetEditorService {
  saveDatasheet: (factionId: string, datasheet: Datasheet) => Promise<void>;
  saveTranslations: (factionId: string, translations: Record<string, string>, language: 'fr' | 'en') => Promise<void>;
  loadTranslations: (factionId: string, language: 'fr' | 'en') => Promise<Record<string, string>>;
  validateDatasheet: (datasheet: Datasheet) => string[];
  validateTranslations: (datasheet: Datasheet, translations: Record<string, string>) => string[];
}

class DatasheetEditorServiceImpl implements DatasheetEditorService {
  async saveDatasheet(factionId: string, datasheet: Datasheet): Promise<void> {
    const translatedKey = `${factionId}_translated`;
    const datasource = await loadDatasource();
    
    if (!datasource || !datasource[translatedKey]) {
      throw new Error(`Faction ${factionId} not found in datasource`);
    }

    const updatedDatasheets = datasource[translatedKey].datasheets.map((ds: Datasheet) => 
      ds.id === datasheet.id ? datasheet : ds
    );

    datasource[translatedKey].datasheets = updatedDatasheets;
    await saveDatasourceBloc(translatedKey, datasource[translatedKey]);
  }

  async saveTranslations(factionId: string, translations: Record<string, string>, language: 'fr' | 'en'): Promise<void> {
    const flatKey = `${factionId}_flat_${language}`;
    await saveDatasourceBloc(flatKey, translations);
  }

  async loadTranslations(factionId: string, language: 'fr' | 'en'): Promise<Record<string, string>> {
    const datasource = await loadDatasource();
    const flatKey = `${factionId}_flat_${language}`;
    return datasource?.[flatKey] || {};
  }

  validateDatasheet(datasheet: Datasheet): string[] {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!datasheet.id) errors.push('ID manquant');
    if (!datasheet.name) errors.push('Nom manquant');
    if (!datasheet.faction_id) errors.push('ID de faction manquant');
    if (!datasheet.points || datasheet.points.length === 0) errors.push('Points manquants');

    // Validation des statistiques
    if (!datasheet.stats || datasheet.stats.length === 0) {
      errors.push('Statistiques manquantes');
    } else {
      datasheet.stats.forEach((stat, index) => {
        if (!stat.m) errors.push(`Statistique M manquante pour le profil ${index + 1}`);
        if (!stat.t) errors.push(`Statistique T manquante pour le profil ${index + 1}`);
        if (!stat.sv) errors.push(`Statistique Sv manquante pour le profil ${index + 1}`);
        if (!stat.w) errors.push(`Statistique W manquante pour le profil ${index + 1}`);
        if (!stat.ld) errors.push(`Statistique Ld manquante pour le profil ${index + 1}`);
        if (!stat.oc) errors.push(`Statistique OC manquante pour le profil ${index + 1}`);
      });
    }

    // Validation des capacités
    if (!datasheet.abilities) {
      errors.push('Capacités manquantes');
    } else {
      if (!datasheet.abilities.core) errors.push('Capacités de base manquantes');
      if (!datasheet.abilities.faction) errors.push('Capacités de faction manquantes');
    }

    return errors;
  }

  validateTranslations(datasheet: Datasheet, translations: Record<string, string>): string[] {
    const errors: string[] = [];
    // Champs de base
    if (datasheet.name && typeof datasheet.name === 'string' && datasheet.name.startsWith('datasheets.')) {
      if (!translations[datasheet.name]) {
        errors.push(`Traduction manquante pour la clé ${datasheet.name}`);
      }
    }
    if (datasheet.fluff && typeof datasheet.fluff === 'string' && datasheet.fluff.startsWith('datasheets.')) {
      if (!translations[datasheet.fluff]) {
        errors.push(`Traduction manquante pour la clé ${datasheet.fluff}`);
      }
    }
    // Capacités de base
    if (datasheet.abilities?.core) {
      datasheet.abilities.core.forEach((ability, i) => {
        if (ability && typeof ability === 'string' && ability.startsWith('datasheets.')) {
          if (!translations[ability]) {
            errors.push(`Traduction manquante pour la capacité de base ${i + 1}`);
          }
        }
      });
    }
    // Capacités de faction
    if (datasheet.abilities?.faction) {
      datasheet.abilities.faction.forEach((ability, i) => {
        if (ability && typeof ability === 'string' && ability.startsWith('datasheets.')) {
          if (!translations[ability]) {
            errors.push(`Traduction manquante pour la capacité de faction ${i + 1}`);
          }
        }
      });
    }
    // Armes de mêlée
    if (datasheet.meleeWeapons) {
      datasheet.meleeWeapons.forEach((weapon, wIdx) => {
        weapon.profiles.forEach((profile, pIdx) => {
          if (profile.name && typeof profile.name === 'string' && profile.name.startsWith('datasheets.')) {
            if (!translations[profile.name]) {
              errors.push(`Traduction manquante pour le nom de l'arme de mêlée ${wIdx + 1}`);
            }
          }
          if (profile.keywords && Array.isArray(profile.keywords)) {
            profile.keywords.forEach((kw, kIdx) => {
              if (kw && typeof kw === 'string' && kw.startsWith('datasheets.')) {
                if (!translations[kw]) {
                  errors.push(`Traduction manquante pour les mots-clés de l'arme de mêlée ${wIdx + 1}`);
                }
              }
            });
          }
        });
      });
    }
    // Armes à distance
    if (datasheet.rangedWeapons) {
      datasheet.rangedWeapons.forEach((weapon, wIdx) => {
        weapon.profiles.forEach((profile, pIdx) => {
          if (profile.name && typeof profile.name === 'string' && profile.name.startsWith('datasheets.')) {
            if (!translations[profile.name]) {
              errors.push(`Traduction manquante pour le nom de l'arme à distance ${wIdx + 1}`);
            }
          }
          if (profile.keywords && Array.isArray(profile.keywords)) {
            profile.keywords.forEach((kw, kIdx) => {
              if (kw && typeof kw === 'string' && kw.startsWith('datasheets.')) {
                if (!translations[kw]) {
                  errors.push(`Traduction manquante pour les mots-clés de l'arme à distance ${wIdx + 1}`);
                }
              }
            });
          }
        });
      });
    }
    return errors;
  }
}

export const datasheetEditorService = new DatasheetEditorServiceImpl(); 