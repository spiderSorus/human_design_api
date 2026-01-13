/*
  Export ALL samples from compare_with_zenfemme.js to JSON using only ZenFemme.

  Usage:
    export ZENFEMME_TOKEN="..."
    node export_zenfemme_all_samples_json.js > charts_all.json
*/

const { fetchZenChart } = require('./src/hd/zenfemme');

async function main() {
  if (!process.env.ZENFEMME_TOKEN) {
    throw new Error('Please set ZENFEMME_TOKEN env var');
  }

  // Keep in sync with compare_with_zenfemme.js sample set.
  const samples = [
    {
      name: 'Kay',
      localDate: '1982-11-09',
      localTime: '06:13',
      timezone: 'America/Los_Angeles',
      birthplace: 'Lakeview, Oregon',
      latitude: 42.1885,
      longitude: -120.3450
    },
    {
      name: 'Kay',
      localDate: '1982-11-09',
      localTime: '06:12',
      timezone: 'America/Los_Angeles',
      birthplace: 'Lakeview, Oregon',
      latitude: 42.1885,
      longitude: -120.3450
    },
    {
      name: 'Kay',
      localDate: '1982-11-09',
      localTime: '06:14',
      timezone: 'America/Los_Angeles',
      birthplace: 'Lakeview, Oregon',
      latitude: 42.1885,
      longitude: -120.3450
    },
    {
      name: 'Test',
      localDate: '2011-03-24',
      localTime: '11:37',
      timezone: 'America/Los_Angeles',
      birthplace: 'Roseburg, Oregon, USA',
      latitude: 43.2165,
      longitude: -123.3417
    },
    {
      name: 'Helena Sorus',
      localDate: '1978-04-21',
      localTime: '16:26',
      timezone: 'America/Los_Angeles',
      birthplace: 'Santa Rosa, California, USA',
      latitude: 38.4405,
      longitude: -122.7144
    },
    {
      name: 'Eliza Mei Sorus',
      localDate: '2015-11-03',
      localTime: '06:54',
      timezone: 'America/Los_Angeles',
      birthplace: 'Reno, Nevada, USA',
      latitude: 39.5296,
      longitude: -119.8138
    },
    {
      name: 'Greg Ames',
      localDate: '1956-01-29',
      localTime: '11:47',
      timezone: 'America/Los_Angeles',
      birthplace: 'Los Angeles, California, USA',
      latitude: 34.0522,
      longitude: -118.2437
    }
  ];

  const charts = [];
  for (const s of samples) {
    const zen = await fetchZenChart({
      localDate: s.localDate,
      localTime: s.localTime,
      timezone: s.timezone,
      latitude: s.latitude,
      longitude: s.longitude,
      name: s.name,
      birthplace: s.birthplace
    });
    charts.push({ sample: s, zen });
  }

  process.stdout.write(JSON.stringify({ generatedAt: new Date().toISOString(), charts }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

