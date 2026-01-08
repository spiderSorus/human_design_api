const { CHANNELS } = require('./constants');

// Human Design centers.
// Naming convention used here is lowerCamelCase for JSON friendliness.
const CENTERS = [
  'head',
  'ajna',
  'throat',
  'g',
  'heart', // aka Ego/Will
  'spleen',
  'solarPlexus',
  'sacral',
  'root'
];

// Gate -> center mapping (by standard BodyGraph).
const GATE_TO_CENTER = {
  // Head
  64: 'head', 61: 'head', 63: 'head',
  // Ajna
  47: 'ajna', 24: 'ajna', 4: 'ajna', 17: 'ajna', 11: 'ajna', 43: 'ajna',
  // Throat
  62: 'throat', 23: 'throat', 56: 'throat', 35: 'throat', 12: 'throat', 45: 'throat',
  33: 'throat', 31: 'throat', 8: 'throat', 20: 'throat', 16: 'throat',
  // G / Identity
  1: 'g', 2: 'g', 7: 'g', 13: 'g', 10: 'g', 15: 'g', 46: 'g', 25: 'g',
  // Heart / Ego
  21: 'heart', 26: 'heart', 40: 'heart', 51: 'heart',
  // Spleen
  48: 'spleen', 57: 'spleen', 44: 'spleen', 50: 'spleen', 32: 'spleen', 28: 'spleen', 18: 'spleen',
  // Solar Plexus
  6: 'solarPlexus', 37: 'solarPlexus', 49: 'solarPlexus', 55: 'solarPlexus', 30: 'solarPlexus',
  36: 'solarPlexus', 22: 'solarPlexus',
  // Sacral
  5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral', 9: 'sacral', 3: 'sacral', 42: 'sacral', 27: 'sacral', 34: 'sacral',
  // Root
  53: 'root', 60: 'root', 52: 'root', 19: 'root', 39: 'root', 41: 'root', 58: 'root', 38: 'root', 54: 'root'
};

function getChannelCenters([g1, g2]) {
  return [GATE_TO_CENTER[g1], GATE_TO_CENTER[g2]];
}

function calculateDefinedCenters(definedChannels) {
  const defined = new Set();
  for (const ch of definedChannels) {
    const [c1, c2] = getChannelCenters(ch);
    if (c1) defined.add(c1);
    if (c2) defined.add(c2);
  }

  const definedCenters = CENTERS.filter((c) => defined.has(c));
  const undefinedCenters = CENTERS.filter((c) => !defined.has(c));

  return { definedCenters, undefinedCenters };
}

// Helper: resolve whether there is at least one defined channel between two centers.
function hasDefinedCenterConnection(definedChannels, centerA, centerB) {
  return definedChannels.some(([g1, g2]) => {
    const c1 = GATE_TO_CENTER[g1];
    const c2 = GATE_TO_CENTER[g2];
    return (c1 === centerA && c2 === centerB) || (c1 === centerB && c2 === centerA);
  });
}

module.exports = {
  CENTERS,
  GATE_TO_CENTER,
  CHANNELS,
  calculateDefinedCenters,
  hasDefinedCenterConnection
};
