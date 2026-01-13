const { calculateChartLocal } = require('./index');

async function main() {
  try {
    if (!process.env.ZENFEMME_TOKEN) {
      throw new Error('Please set ZENFEMME_TOKEN env var to use ZenFemme backend');
    }

    console.log('Running *ZenFemme backend* chart for 09 November 1982 @ 06:13 local time (Lakeview, OR)');
    const timezone = 'America/Los_Angeles';
    const result = await calculateChartLocal('1982-11-09', '06:13', timezone, 42.1885, -120.3450, {
      useZenFemme: true,
      includeZenRaw: false
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();

