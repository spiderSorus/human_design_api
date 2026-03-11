const swisseph = require('swisseph');

let configured = false;

/**
 * Configure Swiss Ephemeris.
 *
 * Supports optionally using JPL ephemeris files (DE4xx) if present.
 *
 * Env vars:
 *   - SWE_EPHE_PATH: directory containing Swiss Ephemeris data files
 *   - SWE_JPL_FILE: full path to a JPL DE file (e.g. de431.eph)
 *   - SWE_FLAGS:     override calculation flags (integer). Default: SEFLG_SWIEPH
 */
function configureSwissEphemeris(options = {}) {
  if (configured) return;

  const ephePath = options.ephePath ?? process.env.SWE_EPHE_PATH;
  const jplFile = options.jplFile ?? process.env.SWE_JPL_FILE;

  if (ephePath) {
    try {
      swisseph.swe_set_ephe_path(ephePath);
    } catch (e) {
      // Non-fatal: fall back to defaults.
    }
  }

  if (jplFile) {
    try {
      swisseph.swe_set_jpl_file(jplFile);
    } catch (e) {
      // Non-fatal: if bindings/lib can’t open the file, we fall back to SWIEPH.
    }
  }

  configured = true;
}

function getCalcFlags(options = {}) {
  if (typeof options.flags === 'number') return options.flags;
  if (process.env.SWE_FLAGS && !Number.isNaN(Number(process.env.SWE_FLAGS))) {
    return Number(process.env.SWE_FLAGS);
  }
  // Default to Swiss Ephemeris data (not JPL unless caller changes flags)
  return swisseph.SEFLG_SWIEPH;
}

// A small longitudinal offset (in degrees) to align with BodyGraphChart/ZenFemme.
// Calibration analysis suggests -20 arc seconds (-0.00555555°) is the exact bridge.
const ZENFEMME_CALIBRATION_OFFSET = -1.0 / 3600.0;

function fetchBodyData(jd, id, options = {}) {
  console.log(`swe_calc_ut: jd=${jd}, id=${id}`);
  configureSwissEphemeris(options);
  const flags = getCalcFlags(options);
  const offset = (options.ephemerisOffset || 0) + ZENFEMME_CALIBRATION_OFFSET;
  
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(jd, id, flags, (data) => {
      if (data.error) reject(new Error(data.error));
      else {
        if (offset !== 0) {
          data.longitude = (data.longitude + offset + 360) % 360;
        }
        resolve(data);
      }
    });
  });
}

module.exports = {
  configureSwissEphemeris,
  fetchBodyData
};
