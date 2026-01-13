const { parseUtcDateTime, parseZonedDateTimeToUtc, toJulianDayUT } = require('./time');
const { calculatePositions } = require('./positions');
const { findDesignTime } = require('./design-time');
const { calculateDefinedChannels } = require('./channels');
const { calculateDefinedCenters } = require('./centers');
const { deriveType } = require('./type');
const { deriveRavePsychologyAndPHS } = require('./rave-psychology-derive');

async function calculateChart(birthDate, birthTime, latitude, longitude, options = {}) {
  // keep signature (lat/lon currently unused)
  const dt = parseUtcDateTime(birthDate, birthTime);
  const jdPersonality = toJulianDayUT(dt);

  const personality = await calculatePositions(jdPersonality, {
    ...options.positionsOptions,
    subdivisionModeByBody: {
      ...(options.positionsOptions?.subdivisionModeByBody || {}),
      // ZenFemme/BodyGraphChart compatibility should only affect personality nodes.
      ...(options.personalityNodesSubdivisionMode
        ? {
            NorthNode: options.positionsOptions?.subdivisionModeByBody?.NorthNode || options.personalityNodesSubdivisionMode,
            SouthNode: options.positionsOptions?.subdivisionModeByBody?.SouthNode || options.personalityNodesSubdivisionMode
          }
        : {})
    }
  });
  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign, options.positionsOptions);

  const definedChannels = calculateDefinedChannels(personality, design);
  const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
  const type = deriveType({ definedChannels, definedCenters });

  return {
    input: {
      date: birthDate,
      time: birthTime,
      latitude,
      longitude
    },
    ravePsychology: deriveRavePsychologyAndPHS({ personality, design }),
    personality,
    design,
    definedChannels,
    definedCenters,
    undefinedCenters,
    type
  };
}

// Timezone-aware variant: accepts a local date/time + IANA timezone, converts to UTC,
// and then delegates to calculateChart.
async function calculateChartLocal(localDate, localTime, timezone, latitude, longitude, options = {}) {
  const dtUtc = parseZonedDateTimeToUtc(localDate, localTime, timezone);
  const dateUtc = dtUtc.toISODate();
  const timeUtc = dtUtc.toFormat('HH:mm');
  const chart = await calculateChart(dateUtc, timeUtc, latitude, longitude, options);
  // Enrich input metadata so callers can see exactly what was used.
  chart.input = {
    ...chart.input,
    localDate,
    localTime,
    timezone
  };
  return chart;
}

async function calculateChartWithOptions(birthDate, birthTime, latitude, longitude, options = {}) {
  const { includeDesign = true } = options;

  const dt = parseUtcDateTime(birthDate, birthTime);
  const jdPersonality = toJulianDayUT(dt);
  const personality = await calculatePositions(jdPersonality, options.positionsOptions);

  if (!includeDesign) {
    const definedChannels = calculateDefinedChannels(personality, null);
    const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
    const type = deriveType({ definedChannels, definedCenters });

    return {
      input: {
        date: birthDate,
        time: birthTime,
        latitude,
        longitude
      },
      ravePsychology: deriveRavePsychologyAndPHS({ personality, design: null }),
      personality,
      design: null,
      definedChannels,
      definedCenters,
      undefinedCenters,
      type
    };
  }

  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign, options.positionsOptions);
  const definedChannels = calculateDefinedChannels(personality, design);
  const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
  const type = deriveType({ definedChannels, definedCenters });

  return {
    input: {
      date: birthDate,
      time: birthTime,
      latitude,
      longitude
    },
    ravePsychology: deriveRavePsychologyAndPHS({ personality, design }),
    personality,
    design,
    definedChannels,
    definedCenters,
    undefinedCenters,
    type
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
  calculateChartLocal,
  calculateChartWithOptions,
  calculateJustNowChart
};
