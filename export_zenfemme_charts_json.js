/*
  Export a batch of sample charts to JSON using the ZenFemme backend.

  Usage:
    export ZENFEMME_TOKEN="..."
    node export_zenfemme_charts_json.js > charts.json
*/

const { fetchZenChart } = require('./src/hd/zenfemme');
const { zenToFlatChart } = require('./src/hd/zenflat');

async function main() {
  // For safety, do not hardcode tokens in-repo.
  // If you need a token for your ZenFemme/BodyGraphChart setup, provide it via env.
  const token = process.env.ZENFEMME_TOKEN;
  if (!token) {
    throw new Error('Please set ZENFEMME_TOKEN env var');
  }

  const samples = [
    {
      name: 'Kai',
      localDate: '1982-11-09',
      localTime: '06:13',
      timezone: 'America/Los_Angeles',
      birthplace: 'Lakeview, Oregon',
      latitude: 42.1885,
      longitude: -120.3450
    },
    {
      name: 'Apollo',
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
    },
    {
      name: 'Saint linda',
      localDate: '1942-03-26',
      localTime: '13:15',
      timezone: 'America/Los_Angeles',
      birthplace: 'Red Bluff, CA, USA',
      latitude: 40.1785,
      longitude: -122.2358
    },
    {
      name: 'Ashes',
      localDate: '1984-11-09',
      localTime: '09:17',
      timezone: 'America/Los_Angeles',
      birthplace: 'Pullman (Washington), United States (USA)',
      // Approx Pullman, WA
      latitude: 46.7298,
      longitude: -117.1817
    }
  ];

  const charts = [];
  for (const s of samples) {
    const zenFull = await fetchZenChart({
      localDate: s.localDate,
      localTime: s.localTime,
      timezone: s.timezone,
      latitude: s.latitude,
      longitude: s.longitude,
      name: s.name,
      birthplace: s.birthplace
    }, { token });

    charts.push(zenToFlatChart({ sample: s, zenFull }));
  }

  process.stdout.write(JSON.stringify({ generatedAt: new Date().toISOString(), charts }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
