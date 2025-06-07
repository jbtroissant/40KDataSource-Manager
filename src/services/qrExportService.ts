export function getArmyExportQrData({ factionId, armyName, version, detachment, units }: {
  factionId: string;
  armyName: string;
  version: string;
  detachment: any;
  units: Array<{ datasheetId: string; points: number; enhancements: Array<{ name: string; cost: number | string }> }>;
}) {
  return JSON.stringify({
    factionId,
    armyName,
    version,
    detachment: detachment?.name || '',
    units: units.map(u => {
      const unitObj: any = {
        dId: u.datasheetId,
        ps: u.points
      };
      if (u.enhancements && u.enhancements.length > 0) {
        unitObj.enhancements = u.enhancements.map(e => ({ name: e.name, cost: e.cost }));
      }
      return unitObj;
    })
  });
} 
