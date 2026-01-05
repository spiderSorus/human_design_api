const swisseph = require('swisseph');

// Body IDs
const BODIES = {
  Sun: swisseph.SE_SUN,
  Moon: swisseph.SE_MOON,
  NorthNode: swisseph.SE_TRUE_NODE,
  SouthNode: swisseph.SE_TRUE_NODE, // Calculated as opposite
  Mercury: swisseph.SE_MERCURY,
  Venus: swisseph.SE_VENUS,
  Mars: swisseph.SE_MARS,
  Jupiter: swisseph.SE_JUPITER,
  Saturn: swisseph.SE_SATURN,
  Uranus: swisseph.SE_URANUS,
  Neptune: swisseph.SE_NEPTUNE,
  Pluto: swisseph.SE_PLUTO,
  Earth: swisseph.SE_SUN // Calculated as opposite
};

module.exports = { BODIES };

