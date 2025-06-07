interface SubfactionKeyword {
  subfactionName: string;
  units: {
    unitName: string;
    keywords: string[];
  }[];
}

export const subfactionKeywords: SubfactionKeyword[] = [
  {
    subfactionName: "Dark Angels",
    units: [
      {
        unitName: "Terminator Squad",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Terminator Assault Squad",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Librarian in Terminator Armour",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Chaplain in Terminator Armour",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Captain in Terminator Armour",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Ancient in Terminator Armour",
        keywords: ["Deathwing"]
      },
      {
        unitName: "BLADEGUARD ANCIENT",
        keywords: ["Deathwing"]
      },
      {
        unitName: "BLADEGUARD VETERAN SQUAD",
        keywords: ["Deathwing"]
      },
      {
        unitName: "STERNGUARD VETERAN SQUAD",
        keywords: ["Deathwing"]
      },
      {
        unitName: "VANGUARD VETERAN SQUAD WITH JUMP PACKS",
        keywords: ["Deathwing"]
      },  
      {
        unitName: "LAND RAIDER",
        keywords: ["Deathwing"]
      },
      {
        unitName: "LAND RAIDER CRUSADER",
        keywords: ["Deathwing"]
      },
      {
        unitName: "LAND RAIDER REDEEMER",
        keywords: ["Deathwing"]
      },
      {
        unitName: "REPULSOR",
        keywords: ["Deathwing"]
      },
      {
        unitName: "REPULSOR EXECUTIONER",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Ballistus Dreadnought",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Brutalis Dreadnought",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Dreadnought",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Redemptor Dreadnought",
        keywords: ["Deathwing"]
      },
      {
        unitName: "Outrider Squad",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Invader ATV",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Chaplain on Bike",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Storm Speeder Hailstrike",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Storm Speeder Hammerstrike",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Storm Speeder Thunderstrike",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Stormhawk Interceptor",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Stormraven Gunship",
        keywords: ["Ravenwing"]
      },  
      {
        unitName: "Stormtalon Gunship",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Land Speeder",
        keywords: ["Ravenwing"]
      },
      {
        unitName: "Land Speeder",
        keywords: ["Ravenwing"]
      },    
    ]
  }
];

export const getUnitKeywords = (unitName: string, subfactionName: string): string[] => {


  const subfaction = subfactionKeywords.find(sf => sf.subfactionName === subfactionName);
  if (!subfaction) {
    return [];
  }

  
  const unit = subfaction.units.find(u => {
    const match = u.unitName.toLowerCase() === unitName.toLowerCase();

    return match;
  });

  if (!unit) {
    return [];
  }

  return unit.keywords;
}; 