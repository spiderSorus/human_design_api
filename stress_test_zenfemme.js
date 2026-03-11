const fs = require('fs');
const path = require('path');
const { calculateChartLocal } = require('./index');

const testDir = 'test_charts';
const realToken = fs.existsSync('zen_femme.token') ? fs.readFileSync('zen_femme.token', 'utf8').trim() : '';

const CITIES = [
  { name: 'New York', tz: 'America/New_York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', tz: 'Europe/London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', tz: 'Asia/Tokyo', lat: 35.6895, lon: 139.6917 },
  { name: 'Sydney', tz: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Los Angeles', tz: 'America/Los_Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Berlin', tz: 'Europe/Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Mumbai', tz: 'Asia/Kolkata', lat: 19.0760, lon: 72.8777 },
  { name: 'Sao Paulo', tz: 'America/Sao_Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Moscow', tz: 'Europe/Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Johannesburg', tz: 'Africa/Johannesburg', lat: -26.2041, lon: 28.0473 }
];

const STANDARD_ORDER = [
  'Sun', 'Earth', 'NorthNode', 'SouthNode', 'Moon', 'Mercury', 'Venus', 
  'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
];

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const mm = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}` };
}

const clean = (chart, input) => ({
  name: input.name,
  type: chart.type,
  profile: chart.ravePsychology.profile,
  authority: chart.authority,
  digestion: chart.ravePsychology.design?.sun?.dietary_regime || null,
  motivation: chart.ravePsychology.personality.sun.motivation,
  perception: chart.ravePsychology.personality.sun.view,
  environment: chart.ravePsychology.design?.nodes?.environment_landscape || null,
  cross: chart.ravePsychology.cross,
  channels: chart.definedChannels.map(ch => ch.join('-')).sort(),
  gates: {
    personality: STANDARD_ORDER.map(b => `${b}: ${chart.personality[b].gate}.${chart.personality[b].line}`),
    design: chart.design ? STANDARD_ORDER.map(b => `${b}: ${chart.design[b].gate}.${chart.design[b].line}`) : []
  },
  input: input
});

async function runTest(n) {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const { date, time } = randomDate(new Date(1960, 0, 1), new Date());
  
  const input = {
    localDate: date,
    localTime: time,
    timezone: city.tz,
    latitude: city.lat,
    longitude: city.lon,
    name: `Test_${n}`,
    birthplace: city.name
  };

  try {
    const hdRaw = await calculateChartLocal(
      input.localDate, input.localTime, input.timezone, input.latitude, input.longitude,
      { 
        useZenFemme: false, 
        personalityNodesSubdivisionMode: 'autoBodygraphchart',
        designNodesSubdivisionMode: 'autoBodygraphchart' 
      }
    );

    const zfRaw = await calculateChartLocal(
      input.localDate, input.localTime, input.timezone, input.latitude, input.longitude,
      { useZenFemme: true, zenfemmeToken: realToken, name: input.name, birthplace: input.birthplace }
    );

    fs.writeFileSync(path.join(testDir, `hd_${n}.json`), JSON.stringify(clean(hdRaw, input), null, 2));
    fs.writeFileSync(path.join(testDir, `zf_${n}.json`), JSON.stringify(clean(zfRaw, input), null, 2));
    
    // Quick diff log
    if (hdRaw.type !== zfRaw.type) {
        console.error(`[FAIL] Chart ${n} (${input.localDate} ${input.localTime}): Type mismatch! HD=${hdRaw.type}, ZF=${zfRaw.type}`);
    } else {
        console.log(`[OK] Chart ${n} (${input.localDate} ${input.localTime})`);
    }
  } catch (e) {
    console.error(`[ERROR] Chart ${n}:`, e.message);
  }
}

async function main() {
  const limit = parseInt(process.argv[2]) || 10;
  console.log(`Starting stress test for ${limit} random charts...`);
  for (let i = 1; i <= limit; i++) {
    await runTest(i);
    // Tiny delay to be slightly nicer to API
    await new Promise(r => setTimeout(r, 100));
  }
}

main().catch(console.error);
