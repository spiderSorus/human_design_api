const swisseph = require('swisseph');
const { BODIES } = require('./bodies');
const { fetchBodyData } = require('./swisseph');
const { getGateDetails } = require('./gates');

async function calculatePositions(jd, options = {}) {
  const {
    gateDetailsOptions = {},
    tonePhaseShiftByBody = {},
    subdivisionModeByBody = {},
    swissephOptions = {}
  } = options;
  const results = {};

  for (const [name, id] of Object.entries(BODIES)) {
    let longitude;
    if (name === 'Earth') {
      const sunData = await fetchBodyData(jd, swisseph.SE_SUN, swissephOptions);
      longitude = (sunData.longitude + 180) % 360;
    } else if (name === 'SouthNode') {
      const nodeData = await fetchBodyData(jd, swisseph.SE_TRUE_NODE, swissephOptions);
      longitude = (nodeData.longitude + 180) % 360;
    } else {
      const bodyData = await fetchBodyData(jd, id, swissephOptions);
      longitude = bodyData.longitude;
    }
    const tonePhaseShiftDegrees = tonePhaseShiftByBody[name];
    const subdivisionMode = subdivisionModeByBody[name];
    results[name] = getGateDetails(longitude, {
      ...gateDetailsOptions,
      ...(typeof tonePhaseShiftDegrees === 'number' ? { tonePhaseShiftDegrees } : {}),
      ...(typeof subdivisionMode === 'string' ? { subdivisionMode } : {})
    });
    if (name === 'NorthNode') {
      console.log(`Positions: NorthNode jd=${jd}, long=${longitude}, gate=${results[name].gate}.${results[name].line}`);
    }
  }

  return results;
}

module.exports = { calculatePositions };
