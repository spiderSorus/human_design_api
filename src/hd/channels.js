const { CHANNELS } = require('./constants');
const { BODIES } = require('./bodies');

const STANDARD_BODIES = Object.keys(BODIES);

function calculateDefinedChannels(personality, design) {
  const activeGates = new Set();

  STANDARD_BODIES.forEach((body) => {
    if (personality[body]) {
      activeGates.add(personality[body].gate);
    }
    if (design && design[body]) {
      activeGates.add(design[body].gate);
    }
  });

  const defined = [];
  for (const [g1, g2] of CHANNELS) {
    if (activeGates.has(g1) && activeGates.has(g2)) {
      defined.push([g1, g2]);
    }
  }
  return defined;
}

module.exports = { calculateDefinedChannels };

