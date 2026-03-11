/*
  Compare our engine vs ZenFemme (BodyGraphChart embed) for multiple charts.

  This script:
  1) Calls BodyGraphChart's embed endpoint used by ZenFemme:
       POST https://embed.bodygraphchart.com/v1/485/generate?token=...
  2) Computes our chart using calculateChartLocal.
  3) Prints a compact diff for key bodies and PHS summary.

  Usage:
    node compare_with_zenfemme.js
*/

const { calculateChartLocal } = require('./index');

const TOKEN = process.env.ZENFEMME_TOKEN;
if (!TOKEN) {
  throw new Error('Please set ZENFEMME_TOKEN env var');
}
const ENDPOINT = `https://embed.bodygraphchart.com/v1/485/generate?token=${TOKEN}`;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toZenFormData(input) {
  // BodyGraphChart validates day/hour are 2 digits.
  const [y, m, d] = input.localDate.split('-');
  const [hh, mm] = input.localTime.split(':');

  const params = new URLSearchParams();
  params.set('name', input.name || 'Apollo');
  params.set('year', y);
  params.set('month', pad2(m));
  params.set('day', pad2(d));
  params.set('hour', pad2(hh));
  params.set('minute', pad2(mm));
  params.set('timezone', input.timezone);
  params.set('latitude', String(input.latitude));
  params.set('longitude', String(input.longitude));
  params.set('birthplace', input.birthplace || '');
  return params;
}

async function fetchZenChart(input) {
  const body = toZenFormData(input);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://thezenfemme.com',
      'Referer': 'https://thezenfemme.com/free-chart',
      'User-Agent': 'Mozilla/5.0'
    },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ZenFemme/BodyGraphChart HTTP ${res.status}: ${text.slice(0, 250)}`);
  }

  return res.json();
}

function pickOur(res, key) {
  // res.personality has PascalCase body names.
  const obj = res.personality[key] || res.design[key];
  return obj ? `${obj.gate}.${obj.line}.${obj.color}.${obj.tone}.${obj.base}` : null;
}

function pickZen(zen, side, key) {
  // zen.Personality / zen.Design use spaced keys for nodes.
  // NOTE: the embed API returns PascalCase side keys: `Personality`, `Design`.
  const container = zen[side];
  const v = container?.[key];
  return v ? `${v.Gate}.${v.Line}.${v.Color}.${v.Tone}.${v.Base}` : null;
}

function phsSummary(res) {
  return {
    diet: res.ravePsychology?.design?.sun?.dietary_regime,
    env: res.ravePsychology?.design?.nodes?.environment_landscape,
    envStyle: res.ravePsychology?.design?.nodes?.environment_style
  };
}

function fmtRow(cols, widths) {
  return cols.map((c, i) => String(c ?? '').padEnd(widths[i])).join('  ');
}

async function compareOne(input, options = {}) {
  const zen = await fetchZenChart(input);

  const oursVanilla = await calculateChartLocal(
    input.localDate,
    input.localTime,
    input.timezone,
    input.latitude,
    input.longitude
  );

  const oursShifted = await calculateChartLocal(
    input.localDate,
    input.localTime,
    input.timezone,
    input.latitude,
    input.longitude,
    {
      personalityNodesSubdivisionMode: 'autoBodygraphchart'
    }
  );

  const bodies = [
    ['Personality', 'Sun'],
    ['Personality', 'Earth'],
    ['Personality', 'North Node'],
    ['Personality', 'South Node'],
    ['Design', 'Sun'],
    ['Design', 'Earth'],
    ['Design', 'North Node'],
    ['Design', 'South Node']
  ];

  // Mapping between Zen keys and our keys
  const zenToOurKey = {
    'Sun': 'Sun',
    'Earth': 'Earth',
    'North Node': 'NorthNode',
    'South Node': 'SouthNode'
  };

  const rows = bodies.map(([side, zenKey]) => {
    const ourKey = zenToOurKey[zenKey];
    const z = pickZen(zen, side, zenKey);
    const o0 = side === 'Personality'
      ? `${oursVanilla.personality[ourKey].gate}.${oursVanilla.personality[ourKey].line}.${oursVanilla.personality[ourKey].color}.${oursVanilla.personality[ourKey].tone}.${oursVanilla.personality[ourKey].base}`
      : `${oursVanilla.design[ourKey].gate}.${oursVanilla.design[ourKey].line}.${oursVanilla.design[ourKey].color}.${oursVanilla.design[ourKey].tone}.${oursVanilla.design[ourKey].base}`;
    const oS = side === 'Personality'
      ? `${oursShifted.personality[ourKey].gate}.${oursShifted.personality[ourKey].line}.${oursShifted.personality[ourKey].color}.${oursShifted.personality[ourKey].tone}.${oursShifted.personality[ourKey].base}`
      : `${oursShifted.design[ourKey].gate}.${oursShifted.design[ourKey].line}.${oursShifted.design[ourKey].color}.${oursShifted.design[ourKey].tone}.${oursShifted.design[ourKey].base}`;

    const ok0 = z === o0 ? 'OK' : 'DIFF';
    const okS = z === oS ? 'OK' : 'DIFF';
    return { side, key: zenKey, zen: z, ours: o0, oursShift: oS, ok0, okS };
  });

  const widths = [11, 12, 14, 14, 14, 6, 6];
  console.log('\n============================================================');
  console.log(`${input.localDate} ${input.localTime} ${input.timezone}  (${input.birthplace || ''})`);
  console.log(`lat/lon: ${input.latitude}, ${input.longitude}`);
  console.log('Personality Nodes mode: autoBodygraphchart (compatibility w/ BodyGraphChart embed)');
  console.log('============================================================');
  console.log(fmtRow(['Side', 'Body', 'Zen', 'Ours', 'Ours+AutoBGC', 'OK?', 'OK?A'], widths));
  console.log(fmtRow(['----', '----', '---', '----', '-----------', '---', '----'], widths));
  for (const r of rows) {
    console.log(fmtRow([r.side, r.key, r.zen, r.ours, r.oursShift, r.ok0, r.okS], widths));
  }

  console.log('\nPHS (ours):', phsSummary(oursShifted));

  const allVanillaOk = rows.every(r => r.ok0 === 'OK');
  const allShiftOk = rows.every(r => r.okS === 'OK');
  return { allVanillaOk, allShiftOk };
}

async function main() {
  // A small sample set. Add more charts by duplicating entries.
  // NOTE: coordinates can be approximate; ZenFemme uses them mainly for timezone/location validation.
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
    // Nearby times to test stability around boundaries
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

    // Additional validation sample provided by user
    {
      name: 'Apollo',
      localDate: '2011-03-24',
      localTime: '11:37',
      timezone: 'America/Los_Angeles',
      birthplace: 'Roseburg, Oregon, USA',
      latitude: 43.2165,
      longitude: -123.3417,
    },

    // Additional validation sample provided by user
    {
      name: 'Helena Sorus',
      localDate: '1978-04-21',
      localTime: '16:26',
      timezone: 'America/Los_Angeles',
      birthplace: 'Santa Rosa, California, USA',
      latitude: 38.4405,
      longitude: -122.7144
    },

    // Additional validation sample provided by user
    {
      name: 'Eliza Mei Sorus',
      localDate: '2015-11-03',
      localTime: '06:54',
      timezone: 'America/Los_Angeles',
      birthplace: 'Reno, Nevada, USA',
      latitude: 39.5296,
      longitude: -119.8138
    },

    // Additional validation sample provided by user
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

  let okVanilla = 0;
  let okAuto = 0;

  for (const s of samples) {
    const { allVanillaOk, allShiftOk: allAutoOk } = await compareOne(s);
    if (allVanillaOk) okVanilla++;
    if (allAutoOk) okAuto++;
  }

  console.log('\n================== SUMMARY ==================');
  console.log(`Samples: ${samples.length}`);
  console.log(`All bodies match (vanilla): ${okVanilla}/${samples.length}`);
  console.log(`All bodies match (personality nodes autoBodygraphchart): ${okAuto}/${samples.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
