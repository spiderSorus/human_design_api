const { CHANNELS } = require('./constants');

function calculateDefinedChannels(personality, design) {
  const activeGates = new Set();

  Object.values(personality).forEach((p) => activeGates.add(p.gate));
  if (design) {
    Object.values(design).forEach((d) => activeGates.add(d.gate));
  }

  const defined = [];
  for (const [g1, g2] of CHANNELS) {
    if (activeGates.has(g1) && activeGates.has(g2)) {
      defined.push([g1, g2]);
    }
  }
  return defined;
}

module.exports = { calculateDefinedChannels };

