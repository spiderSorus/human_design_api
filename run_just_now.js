const { calculateJustNowChart } = require('./index');

async function main() {
  const result = await calculateJustNowChart(37.7749, -122.4194);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
