/*
  Export ALL samples from compare_with_zenfemme.js to JSON using only ZenFemme.

  Usage:
    export ZENFEMME_TOKEN="..."
    node export_zenfemme_all_samples_json.js > charts_all.json
*/

const { fetchZenChart } = require('./src/hd/zenfemme');

function stripKeysDeep(value, keysToStrip) {
  if (Array.isArray(value)) {
    return value.map((v) => stripKeysDeep(v, keysToStrip));
  }
  if (!value || typeof value !== 'object') return value;

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (keysToStrip.has(k)) continue;
    out[k] = stripKeysDeep(v, keysToStrip);
  }
  return out;
}

function simplifyPropertiesGates(zen) {
  if (!zen || typeof zen !== 'object') return zen;
  const props = zen.Properties;
  if (!props || typeof props !== 'object') return zen;

  // Convert `Properties.Gates.list` from objects like {id, option} to strings like "<gate>.<line>".
  // We derive line from the available placements (Personality/Design) when possible.
  const gateToLine = new Map();
  for (const side of ['Personality', 'Design']) {
    const placements = zen[side];
    if (!placements || typeof placements !== 'object') continue;
    for (const v of Object.values(placements)) {
      const gate = v?.Gate;
      const line = v?.Line;
      if (typeof gate === 'number' && typeof line === 'number') {
        gateToLine.set(gate, line);
      }
    }
  }

  // If you want to keep a derived gates list, you could compute it here.
  // For now (per request) we remove Properties.Gates entirely.
  if (props.Gates !== undefined) delete props.Gates;

  // Also remove the top-level numeric Gates list.
  if (zen.Gates !== undefined) delete zen.Gates;

  return zen;
}

async function main() {
  if (!process.env.ZENFEMME_TOKEN) {
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
    });

    // For prototypes: strip marketing/presentation fields we don't want to lock in yet.
    // This includes both top-level fields (ChartUrl) and nested `description`/`link` keys.
    let zen = stripKeysDeep(
      zenFull || {},
      new Set([
        'ChartUrl',
        'Description',
        'Link',
        'description',
        'link',
        'Tooltips',
        'tooltips',
        'svg',
        'Svg',
        'EmailAddress',
        'email',
        'Email'
        , 'Planets'
        , 'planets'
      ])
    );

    zen = simplifyPropertiesGates(zen);

    charts.push({ name: s.name, zen });
  }

  process.stdout.write(JSON.stringify({ generatedAt: new Date().toISOString(), charts }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
