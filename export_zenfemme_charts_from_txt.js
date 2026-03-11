/*
  Regenerate charts.json using stored samples in charts.txt.

  charts.txt stores birth data only, one sample per line:
    <name>|<YYYY-MM-DD>|<HH:MM>|<IANA timezone>|<latitude>|<longitude>|<birthplace>

  Usage:
    export ZENFEMME_TOKEN="..."
    node export_zenfemme_charts_from_txt.js charts.txt > charts.json
*/

const fs = require('fs');
const path = require('path');

const { fetchZenChart } = require('./src/hd/zenfemme');
const { zenToFlatChart } = require('./src/hd/zenflat');

function parseChartsTxt(text) {
  // New simplified format (birth data only):
  //   <name>|<YYYY-MM-DD>|<HH:MM>|<IANA timezone>|<latitude>|<longitude>|<birthplace>
  const lines = String(text || '').split(/\r?\n/);
  const samples = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const parts = line.split('|');
    if (parts.length < 7) {
      throw new Error(`Invalid charts.txt line (expected 7 pipe-separated fields): ${line}`);
    }

    const [name, localDate, localTime, timezone, latStr, lonStr, ...birthplaceParts] = parts;
    const latitude = Number(latStr);
    const longitude = Number(lonStr);
    const birthplace = birthplaceParts.join('|').trim();

    if (!name || !localDate || !localTime || !timezone || !birthplace) {
      throw new Error(`Invalid charts.txt line (missing required fields): ${line}`);
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error(`Invalid charts.txt line (bad lat/lon): ${line}`);
    }

    samples.push({
      name: name.trim(),
      localDate: localDate.trim(),
      localTime: localTime.trim(),
      timezone: timezone.trim(),
      birthplace,
      latitude,
      longitude
    });
  }

  // De-dupe exact duplicates
  const seen = new Set();
  const unique = [];
  for (const s of samples) {
    const key = `${s.name}|${s.localDate}|${s.localTime}|${s.timezone}|${s.latitude}|${s.longitude}|${s.birthplace}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(s);
  }
  return unique;
}

// Allow reuse in other scripts without executing main().
module.exports = { parseChartsTxt };

async function main() {
  let token = process.env.ZENFEMME_TOKEN;
  if (!token) {
    try {
      if (fs.existsSync('zen_femme.token')) {
        token = fs.readFileSync('zen_femme.token', 'utf8').trim();
      }
    } catch (err) {
      // ignore
    }
  }

  if (!token) {
    throw new Error('Please set ZENFEMME_TOKEN env var or create zen_femme.token file');
  }

  const inputPath = process.argv[2] || 'charts.txt';
  const abs = path.resolve(process.cwd(), inputPath);
  const text = fs.readFileSync(abs, 'utf8');
  const samples = parseChartsTxt(text);
  if (!samples.length) {
    throw new Error(`No samples parsed from ${inputPath}`);
  }

  const charts = [];
  for (const s of samples) {
    const zenFull = await fetchZenChart(
      {
        localDate: s.localDate,
        localTime: s.localTime,
        timezone: s.timezone,
        latitude: s.latitude,
        longitude: s.longitude,
        name: s.name,
        birthplace: s.birthplace
      },
      { token }
    );
    charts.push(zenToFlatChart({ sample: s, zenFull }));
  }

  process.stdout.write(JSON.stringify({ generatedAt: new Date().toISOString(), charts }, null, 2));
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
