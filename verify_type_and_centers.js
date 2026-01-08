// Quick verification script for new output fields.
// Usage: node verify_type_and_centers.js

const { calculateChart } = require('./index');

(async () => {
  // Example from earlier conversation: 1982-11-09 06:13 Lakeview, OR (local PST => 14:13 UTC)
  const chart = await calculateChart('1982-11-09', '14:13', 42.1888, -120.3458);

  if (!chart.type) throw new Error('Missing chart.type');
  if (!Array.isArray(chart.definedCenters)) throw new Error('Missing chart.definedCenters');
  if (!Array.isArray(chart.undefinedCenters)) throw new Error('Missing chart.undefinedCenters');

  console.log('type:', chart.type);
  console.log('definedCenters:', chart.definedCenters);
  console.log('undefinedCenters:', chart.undefinedCenters);
  console.log('ok');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
