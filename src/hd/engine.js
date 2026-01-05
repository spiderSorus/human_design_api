const { parseUtcDateTime, toJulianDayUT } = require('./time');
const { calculatePositions } = require('./positions');
const { findDesignTime } = require('./design-time');
const { calculateDefinedChannels } = require('./channels');

async function calculateChart(birthDate, birthTime, latitude, longitude) {
  // keep signature (lat/lon currently unused)
  const dt = parseUtcDateTime(birthDate, birthTime);
  const jdPersonality = toJulianDayUT(dt);

  const personality = await calculatePositions(jdPersonality);
  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign);

  return {
    personality,
    design,
    definedChannels: calculateDefinedChannels(personality, design)
  };
}

async function calculateChartWithOptions(birthDate, birthTime, latitude, longitude, options = {}) {
  const { includeDesign = true } = options;

  const dt = parseUtcDateTime(birthDate, birthTime);
  const jdPersonality = toJulianDayUT(dt);
  const personality = await calculatePositions(jdPersonality);

  if (!includeDesign) {
    return {
      personality,
      design: null,
      definedChannels: calculateDefinedChannels(personality, null)
    };
  }

  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign);
  return {
    personality,
    design,
    definedChannels: calculateDefinedChannels(personality, design)
  };
}

module.exports = {
  calculateChart,
  calculateChartWithOptions
};

