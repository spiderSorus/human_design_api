// Public entrypoint: keep this small and stable.
const engine = require('./src/hd/engine');
const { calculateGateTransitSegmentsUtc } = require('./src/hd/transits');

module.exports = {
  ...engine,
  calculateGateTransitSegmentsUtc
};

