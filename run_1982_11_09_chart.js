const { calculateChartLocal } = require('./index');

async function main() {
    try {
        console.log('Running chart for 09 November 1982 @ 06:13 local time (Lakeview, OR)');
        // We accept local time + timezone and convert to UTC internally.
        // Lakeview, OR uses America/Los_Angeles timezone rules.
        const timezone = 'America/Los_Angeles';
        // Using approximate coordinates for Lakeview, Oregon.
  // ZenFemme / BodyGraphChart compatibility mode for Personality Nodes only.
  const result = await calculateChartLocal('1982-11-09', '06:13', timezone, 42.1885, -120.3450, {
    personalityNodesSubdivisionMode: 'autoBodygraphchart'
  });
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
}

main();
