import { Datasheet } from '../types/datasheet';
import { Enhancement } from '../types/detachment';
import { Unit as ArmyUnit } from '../types/army';
import { Unit as RosterUnit } from '../types/roster';

type UnitWithPoints = ArmyUnit | RosterUnit | Datasheet;

export const calculateTotalPoints = (units: UnitWithPoints[]): number => {
  return units.reduce((sum, unit) => {
    // Points de base de l'unité
    let basePoints = 0;
    if ('points' in unit) {
      if (typeof unit.points === 'number') {
        // Cas ArmyUnit
        basePoints = unit.points;
      } else if (Array.isArray(unit.points)) {
        // Cas Datasheet
        if (unit.points.length > 0) {
          const activePoint = unit.points.find(p => p.active);
          basePoints = activePoint ? parseInt(activePoint.cost, 10) : 0;
        }
      }
    } else if ('costs' in unit && Array.isArray(unit.costs)) {
      // Cas RosterUnit
      basePoints = unit.costs.reduce((sum, cost) => sum + cost.value, 0);
    }

    // Points des améliorations
    const enhancementPoints = (unit as any).enhancements?.reduce((enhSum: number, enhancement: Enhancement) => {
      const cost = typeof enhancement.cost === 'string' ? parseInt(enhancement.cost, 10) : enhancement.cost;
      return enhSum + (cost || 0);
    }, 0) || 0;

    return sum + basePoints + enhancementPoints;
  }, 0);
}; 