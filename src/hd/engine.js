const { parseUtcDateTime, parseZonedDateTimeToUtc, toJulianDayUT } = require('./time');
const { calculatePositions } = require('./positions');
const { calculatePositionsFromZenFemme } = require('./zenfemme');
const { findDesignTime } = require('./design-time');
const { calculateDefinedChannels } = require('./channels');
const { calculateDefinedCenters } = require('./centers');
const { deriveType, deriveAuthority } = require('./type');
const { deriveRavePsychologyAndPHS } = require('./rave-psychology-derive');

async function calculateChart(birthDate, birthTime, latitude, longitude, options = {}) {
  const dt = parseUtcDateTime(birthDate, birthTime);
  const jdPersonality = toJulianDayUT(dt);

  const personality = await calculatePositions(jdPersonality, {
    ...options.positionsOptions,
    subdivisionModeByBody: {
      ...(options.positionsOptions?.subdivisionModeByBody || {}),
      ...(options.personalityNodesSubdivisionMode
        ? {
            NorthNode: options.positionsOptions?.subdivisionModeByBody?.NorthNode || options.personalityNodesSubdivisionMode,
            SouthNode: options.positionsOptions?.subdivisionModeByBody?.SouthNode || options.personalityNodesSubdivisionMode
          }
        : {})
    }
  });
  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign, {
    ...options.positionsOptions,
    subdivisionModeByBody: {
      ...(options.positionsOptions?.subdivisionModeByBody || {}),
      ...(options.designNodesSubdivisionMode
        ? {
            NorthNode: options.positionsOptions?.subdivisionModeByBody?.NorthNode || options.designNodesSubdivisionMode,
            SouthNode: options.positionsOptions?.subdivisionModeByBody?.SouthNode || options.designNodesSubdivisionMode
          }
        : {})
    }
  });

  const definedChannels = calculateDefinedChannels(personality, design);
  const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
  const type = deriveType({ definedChannels, definedCenters });
  const authority = deriveAuthority(definedCenters);

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
    type,
    authority
  };
}

async function calculateChartLocal(localDate, localTime, timezone, latitude, longitude, options = {}) {
  const useZenFemme = options.useZenFemme || process.env.HD_EPHEMERIS_BACKEND === 'zenfemme';

  if (useZenFemme) {
    const { personality, design, _zenRaw } = await calculatePositionsFromZenFemme(
      localDate,
      localTime,
      timezone,
      latitude,
      longitude,
      {
        token: options.zenfemmeToken,
        endpointBase: options.zenfemmeEndpointBase,
        includeRaw: options.includeZenRaw,
        name: options.name,
        birthplace: options.birthplace
      }
    );

    const definedChannels = calculateDefinedChannels(personality, design);
    const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
    const type = deriveType({ definedChannels, definedCenters });
    const authority = deriveAuthority(definedCenters);

    return {
      input: {
        date: null,
        time: null,
        localDate,
        localTime,
        timezone,
        latitude,
        longitude
      },
      ravePsychology: deriveRavePsychologyAndPHS({ personality, design }),
      personality,
      design,
      definedChannels,
      definedCenters,
      undefinedCenters,
      type,
      authority,
      ...(options.includeZenRaw ? { zenfemme: _zenRaw } : {})
    };
  }

  const dtUtc = parseZonedDateTimeToUtc(localDate, localTime, timezone);
  const dateUtc = dtUtc.toISODate();
  const timeUtc = dtUtc.toFormat('HH:mm');
  const chart = await calculateChart(dateUtc, timeUtc, latitude, longitude, options);
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
  
  const personality = await calculatePositions(jdPersonality, {
    ...options.positionsOptions,
    subdivisionModeByBody: {
      ...(options.positionsOptions?.subdivisionModeByBody || {}),
      ...(options.personalityNodesSubdivisionMode
        ? {
            NorthNode: options.positionsOptions?.subdivisionModeByBody?.NorthNode || options.personalityNodesSubdivisionMode,
            SouthNode: options.positionsOptions?.subdivisionModeByBody?.SouthNode || options.personalityNodesSubdivisionMode
          }
        : {})
    }
  });

  if (!includeDesign) {
    const definedChannels = calculateDefinedChannels(personality, null);
    const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
    const type = deriveType({ definedChannels, definedCenters });
    const authority = deriveAuthority(definedCenters);

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
      type,
      authority
    };
  }

  const jdDesign = await findDesignTime(jdPersonality);
  const design = await calculatePositions(jdDesign, {
    ...options.positionsOptions,
    subdivisionModeByBody: {
      ...(options.positionsOptions?.subdivisionModeByBody || {}),
      ...(options.designNodesSubdivisionMode
        ? {
            NorthNode: options.positionsOptions?.subdivisionModeByBody?.NorthNode || options.designNodesSubdivisionMode,
            SouthNode: options.positionsOptions?.subdivisionModeByBody?.SouthNode || options.designNodesSubdivisionMode
          }
        : {})
    }
  });
  const definedChannels = calculateDefinedChannels(personality, design);
  const { definedCenters, undefinedCenters } = calculateDefinedCenters(definedChannels);
  const type = deriveType({ definedChannels, definedCenters });
  const authority = deriveAuthority(definedCenters);

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
    type,
    authority
  };
}

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
