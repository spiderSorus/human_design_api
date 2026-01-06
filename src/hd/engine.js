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

// Convenience helper for a “just now” chart (transit/personality-only).
// Returns a JSON-serializable plain object: { personality, design: null, definedChannels }.
//
// Note: This uses UTC clock time for determinism and avoids implicit local timezone conversions.
async function calculateJustNowChart(latitude, longitude, options = {}) {
  const { now = new Date() } = options;

  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');

  const date = `${y}-${m}-${d}`;
  const time = `${hh}:${mm}`;

  return calculateChartWithOptions(date, time, latitude, longitude, {
    ...options,
    includeDesign: false
  });
}

module.exports = {
  calculateChart,
  calculateChartWithOptions,
  calculateJustNowChart
};
