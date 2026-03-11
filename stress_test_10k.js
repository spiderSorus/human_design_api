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
  { name: 'Johannesburg', tz: 'Africa/Johannesburg', lat: -26.2041, lon: 28.0473 },
  { name: 'Paris', tz: 'Europe/Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', tz: 'Asia/Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', tz: 'Asia/Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Mexico City', tz: 'America/Mexico_City', lat: 19.4326, lon: -99.1332 },
  { name: 'Cairo', tz: 'Africa/Cairo', lat: 30.0444, lon: 31.2357 }
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

const mapPoints = (side) => {
  if (!side) return null;
  const res = {};
  STANDARD_ORDER.forEach(key => {
    const p = side[key];
    if (p) {
      res[key] = {
        base: p.base,
        tone: p.tone,
        color: p.color
      };
    }
  });
  return res;
};

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
  points: {
    personality: mapPoints(chart.personality),
    design: chart.design ? mapPoints(chart.design) : null
  },
  channels: chart.definedChannels.map(ch => ch.join('-')).sort(),
  gates: {
    personality: STANDARD_ORDER.map(b => `${b}: ${chart.personality[b].gate}.${chart.personality[b].line}`),
    design: chart.design ? STANDARD_ORDER.map(b => `${b}: ${chart.design[b].gate}.${chart.design[b].line}`) : []
  },
  input: input
});

async function runSingleTest(n) {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const { date, time } = randomDate(new Date(1960, 0, 1), new Date());
  
  const input = {
    localDate: date,
    localTime: time,
    timezone: city.tz,
    latitude: city.lat,
    longitude: city.lon,
    name: `Stress_${n}`,
    birthplace: city.name
  };

  const paddedN = String(n).padStart(5, '0');

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

    fs.writeFileSync(path.join(testDir, `hd_${paddedN}.json`), JSON.stringify(clean(hdRaw, input), null, 2));
    fs.writeFileSync(path.join(testDir, `zf_${paddedN}.json`), JSON.stringify(clean(zfRaw, input), null, 2));
    
    let isMatch = true;
    if (hdRaw.type !== zfRaw.type) isMatch = false;
    if (JSON.stringify(hdRaw.definedChannels.sort()) !== JSON.stringify(zfRaw.definedChannels.sort())) isMatch = false;

    if (!isMatch) {
        const msg = `[FAIL] Chart ${paddedN} (${input.localDate} ${input.localTime}): mismatch!`;
        console.error(msg);
        fs.appendFileSync('stress_test.log', msg + '\n');
    } else {
        console.log(`[OK] Chart ${paddedN} (${input.localDate} ${input.localTime})`);
    }
  } catch (e) {
    const msg = `[ERROR] Chart ${paddedN}: ${e.message}`;
    console.error(msg);
    fs.appendFileSync('stress_test.log', msg + '\n');
  }
}

async function main() {
  const limit = parseInt(process.argv[2]) || 10;
  console.log(`Starting 10k Stress Test (Batch Size: ${limit})`);
  fs.appendFileSync('stress_test.log', `--- Run started at ${new Date().toISOString()} for ${limit} charts ---\n`);
  
  for (let i = 1; i <= limit; i++) {
    await runSingleTest(i);
    // API safety delay
    await new Promise(r => setTimeout(r, 200));
  }
}

main().catch(console.error);
