const { calculateChartLocal } = require('./index');
const fs = require('fs');

async function reproduce() {
  const input = {
    localDate: "2012-07-18", localTime: "02:56", timezone: "Asia/Singapore",
    latitude: 1.3521, longitude: 103.8198
  };

  const chart = await calculateChartLocal(
    input.localDate, input.localTime, input.timezone, input.latitude, input.longitude,
    { useZenFemme: false }
  );

  // We need to see the raw longitudes.
  // I'll modify engine.js to return them temporarily if needed, 
  // but wait, I can just use swisseph.js directly.
  const { fetchBodyData } = require('./src/hd/swisseph');
  const swisseph = require('swisseph');
  const { findDesignTime } = require('./src/hd/design-time');
  const { toJulianDayUT, parseZonedDateTimeToUtc } = require('./src/hd/time');

  const dtP = parseZonedDateTimeToUtc(input.localDate, input.localTime, input.timezone);
  const jdP = toJulianDayUT(dtP);
  const jdD = await findDesignTime(jdP);

  const resP = await fetchBodyData(jdP, swisseph.SE_TRUE_NODE);
  const resD = await fetchBodyData(jdD, swisseph.SE_TRUE_NODE);

  console.log(`Raw Long P: ${resP.longitude}`);
  console.log(`Raw Long D: ${resD.longitude}`);
}

reproduce().catch(console.error);
