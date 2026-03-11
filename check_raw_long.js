const swisseph = require('swisseph');
const { fetchBodyData } = require('./src/hd/swisseph');

async function check() {
  const jdP = 2456126.288888889; // Personality
  const jdD = 2456034.7001294666; // Design

  const dataP = await fetchBodyData(jdP, swisseph.SE_TRUE_NODE);
  const dataD = await fetchBodyData(jdD, swisseph.SE_TRUE_NODE);

  console.log(`Personality JD: ${jdP}, Long: ${dataP.longitude}`);
  console.log(`Design JD:      ${jdD}, Long: ${dataD.longitude}`);
  
  const dataMeanP = await fetchBodyData(jdP, swisseph.SE_MEAN_NODE);
  const dataMeanD = await fetchBodyData(jdD, swisseph.SE_MEAN_NODE);
  console.log(`Mean Personality: ${dataMeanP.longitude}`);
  console.log(`Mean Design:      ${dataMeanD.longitude}`);
}

check().catch(console.error);
