const swisseph = require('swisseph');
const { BODIES } = require('./bodies');
const { fetchBodyData } = require('./swisseph');
const { getGateDetails } = require('./gates');

async function calculatePositions(jd) {
  const results = {};
  const promises = [];

  for (const [name, id] of Object.entries(BODIES)) {
    promises.push((async () => {
      let longitude;
      if (name === 'Earth') {
        const sunData = await fetchBodyData(jd, swisseph.SE_SUN);
        longitude = (sunData.longitude + 180) % 360;
      } else if (name === 'SouthNode') {
        const nodeData = await fetchBodyData(jd, swisseph.SE_TRUE_NODE);
        longitude = (nodeData.longitude + 180) % 360;
      } else {
        const bodyData = await fetchBodyData(jd, id);
        longitude = bodyData.longitude;
      }
      results[name] = getGateDetails(longitude);
    })());
  }

  await Promise.all(promises);
  return results;
}

module.exports = { calculatePositions };

