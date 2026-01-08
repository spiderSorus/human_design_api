const swisseph = require('swisseph');

const { BODIES } = require('./bodies');
const { fetchBodyData } = require('./swisseph');
const { getGateDetails } = require('./gates');
const { parseUtcDateTime, toJulianDayUT } = require('./time');

// NOTE: Earth and SouthNode are derived bodies (opposites of Sun/TrueNode respectively)
// but we still treat them as separate “planets” for output.
async function getBodyGateAtJd(jd, bodyName) {
  // Important: Swiss Ephemeris body IDs can be 0 (e.g. Sun), so we must not use a truthy check.
  if (!Object.prototype.hasOwnProperty.call(BODIES, bodyName)) {
    throw new Error(`Unknown body: ${bodyName}`);
  }

  let longitude;
  if (bodyName === 'Earth') {
    const sunData = await fetchBodyData(jd, swisseph.SE_SUN);
    longitude = (sunData.longitude + 180) % 360;
  } else if (bodyName === 'SouthNode') {
    const nodeData = await fetchBodyData(jd, swisseph.SE_TRUE_NODE);
    longitude = (nodeData.longitude + 180) % 360;
  } else {
    const bodyData = await fetchBodyData(jd, BODIES[bodyName]);
    longitude = bodyData.longitude;
  }

  return getGateDetails(longitude).gate;
}

async function getBodyGateLineAtJd(jd, bodyName) {
  // Important: Swiss Ephemeris body IDs can be 0 (e.g. Sun), so we must not use a truthy check.
  if (!Object.prototype.hasOwnProperty.call(BODIES, bodyName)) {
    throw new Error(`Unknown body: ${bodyName}`);
  }

  let longitude;
  if (bodyName === 'Earth') {
    const sunData = await fetchBodyData(jd, swisseph.SE_SUN);
    longitude = (sunData.longitude + 180) % 360;
  } else if (bodyName === 'SouthNode') {
    const nodeData = await fetchBodyData(jd, swisseph.SE_TRUE_NODE);
    longitude = (nodeData.longitude + 180) % 360;
  } else {
    const bodyData = await fetchBodyData(jd, BODIES[bodyName]);
    longitude = bodyData.longitude;
  }

  const details = getGateDetails(longitude);
  return { gate: details.gate, line: details.line };
}

function jdToIsoUtc(jd) {
  // Swiss Ephemeris helper returns UTC date/time from Julian Day
  const dt = swisseph.swe_revjul(jd, swisseph.SE_GREG_CAL);
  const y = String(dt.year).padStart(4, '0');
  const m = String(dt.month).padStart(2, '0');
  const d = String(dt.day).padStart(2, '0');

  const hour = dt.hour;
  const hh = String(Math.floor(hour)).padStart(2, '0');
  const mm = String(Math.floor((hour - Math.floor(hour)) * 60)).padStart(2, '0');
  const ss = String(Math.floor((((hour - Math.floor(hour)) * 60) - Math.floor((hour - Math.floor(hour)) * 60)) * 60)).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}

// Finds the first gate-change boundary between [jdLeft, jdRight], assuming gateLeft != gateRight.
// Returns the earliest JD at which the gate becomes gateRight (within precision).
async function findBoundaryJd(bodyName, jdLeft, leftKey, jdRight, rightKey, opts) {
  const { boundaryResolutionSeconds = 10, maxIterations = 80, getKeyAtJd } = opts;
  const resolutionDays = boundaryResolutionSeconds / 86400;

  let left = jdLeft;
  let right = jdRight;

  // Invariant: key(left)=leftKey, key(right)=rightKey.
  for (let i = 0; i < maxIterations && (right - left) > resolutionDays; i++) {
    const mid = (left + right) / 2;
    const midKey = await getKeyAtJd(mid, bodyName);
    if (midKey === leftKey) left = mid;
    else right = mid;
  }
  return right;
}

function normalizeBodies(bodies) {
  if (!bodies) return Object.keys(BODIES);
  if (!Array.isArray(bodies)) throw new Error('bodies must be an array of body names');
  return bodies;
}

/**
 * Build Gantt-friendly “gate transit segments” for one or more bodies.
 *
 * Output shape:
 * {
 *   range: { start: ISO, end: ISO },
 *   bodies: {
 *     Sun: [ { gate: 34, start: ISO, end: ISO }, ... ],
 *     Moon: [ ... ]
 *   }
 * }
 *
 * Strategy to minimize ephemeris queries:
 * 1) Sample forward with `stepMinutes` until a gate change is detected
 * 2) When detected, binary-search the boundary time to `boundaryResolutionSeconds`
 */
async function calculateGateTransitSegmentsUtc(startDate, startTime, endDate, endTime, options = {}) {
  const {
    bodies,
    // coarse stepping (lower => more calls, but faster detection)
    stepMinutes = 60,
    // boundary precision
    boundaryResolutionSeconds = 10,
    // safety to avoid infinite loops / runaway memory
    // Note: with long ranges + resolution:'gateLine', the Moon alone can exceed 20k segments.
    maxSegmentsPerBody = 250000,
    // Optional: also return a flat list of rows useful for many Gantt libs
    // [{ body, gate, start, end }]
    includeRows = false,
    // 'gate' or 'gateLine'
    resolution = 'gate'
  } = options;

  const startDt = parseUtcDateTime(startDate, startTime);
  const endDt = parseUtcDateTime(endDate, endTime);
  const jdStart = toJulianDayUT(startDt);
  const jdEnd = toJulianDayUT(endDt);

  if (jdEnd <= jdStart) throw new Error('End must be after start');

  const stepDays = stepMinutes / (24 * 60);
  const bodyList = normalizeBodies(bodies);

  const result = {
    range: { start: `${startDate}T${startTime}Z`, end: `${endDate}T${endTime}Z` },
    bodies: {}
  };

  const rows = [];

  const getKeyAtJd = async (jd, bodyName) => {
    if (resolution === 'gateLine') {
      const gl = await getBodyGateLineAtJd(jd, bodyName);
      return `${gl.gate}.${gl.line}`;
    }
    const g = await getBodyGateAtJd(jd, bodyName);
    return String(g);
  };

  const parseKey = (key) => {
    if (resolution === 'gateLine') {
      const [gateStr, lineStr] = String(key).split('.');
      return { gate: Number(gateStr), line: Number(lineStr) };
    }
    return { gate: Number(key) };
  };

  for (const bodyName of bodyList) {
    let segments = [];
    let segStartJd = jdStart;
    let lastKey = await getKeyAtJd(segStartJd, bodyName);
    let cursorJd = segStartJd;

    while (cursorJd < jdEnd) {
      if (segments.length > maxSegmentsPerBody) {
        throw new Error(`Too many segments for ${bodyName}. Try a larger stepMinutes or smaller range.`);
      }

      const nextJd = Math.min(cursorJd + stepDays, jdEnd);
      const nextKey = await getKeyAtJd(nextJd, bodyName);

      if (nextKey === lastKey) {
        cursorJd = nextJd;
        continue;
      }

      // Gate/line key changed somewhere between cursorJd and nextJd.
      const boundaryJd = await findBoundaryJd(bodyName, cursorJd, lastKey, nextJd, nextKey, {
        boundaryResolutionSeconds,
        getKeyAtJd
      });

      const parsed = parseKey(lastKey);

      segments.push({ ...parsed, start: jdToIsoUtc(segStartJd), end: jdToIsoUtc(boundaryJd) });

      if (includeRows) {
        rows.push({
          body: bodyName,
          ...parsed,
          start: jdToIsoUtc(segStartJd),
          end: jdToIsoUtc(boundaryJd)
        });
      }

      // Start new segment at boundary.
      segStartJd = boundaryJd;
      cursorJd = boundaryJd;
      lastKey = nextKey;
    }

    // Close last segment.
    const parsed = parseKey(lastKey);
    segments.push({ ...parsed, start: jdToIsoUtc(segStartJd), end: jdToIsoUtc(jdEnd) });

    if (includeRows) {
      rows.push({
        body: bodyName,
        ...parsed,
        start: jdToIsoUtc(segStartJd),
        end: jdToIsoUtc(jdEnd)
      });
    }

    result.bodies[bodyName] = segments;
  }

  if (includeRows) return { ...result, rows };
  return result;
}

module.exports = {
  calculateGateTransitSegmentsUtc,
  // exported for testing/advanced use
  getBodyGateAtJd,
  jdToIsoUtc
};
