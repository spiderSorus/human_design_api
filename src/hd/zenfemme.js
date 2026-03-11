/*
  Minimal ZenFemme/BodyGraphChart backend.

  This wraps the same embed endpoint used by the ZenFemme “free chart” flow.
  It is intentionally NOT robust (token hardcoded via env, limited error handling)
  and is meant only for prototyping.

  Output shape: { personality, design } matching this repo's engine positions shape:
    { Sun: {gate,line,color,tone,base}, ... }
*/

const DEFAULT_ENDPOINT_BASE = 'https://embed.bodygraphchart.com/v1/485/generate';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toZenFormData(input) {
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
  // BodyGraphChart requires birthplace; for prototypes we can supply a placeholder.
  params.set('birthplace', input.birthplace || '');
  return params;
}

function mapZenSide(sideObj) {
  // sideObj keys are like: Sun, Earth, North Node, South Node, Moon, etc.
  // Values are like: { Gate, Line, Color, Tone, Base, ... }
  const out = {};
  if (!sideObj) return out;

  const keyMap = {
    'North Node': 'NorthNode',
    'South Node': 'SouthNode'
  };

  for (const [k, v] of Object.entries(sideObj)) {
    const name = keyMap[k] || k.replace(/\s+/g, '');
    if (!v) continue;
    out[name] = {
      gate: v.Gate,
      line: v.Line,
      color: v.Color,
      tone: v.Tone,
      base: v.Base
    };
  }
  return out;
}

async function fetchZenChart(input, options = {}) {
  const endpointBase = options.endpointBase || process.env.ZENFEMME_ENDPOINT_BASE || DEFAULT_ENDPOINT_BASE;
  const token = options.token || process.env.ZENFEMME_TOKEN;
  // Token is optional: the public ZenFemme free-chart flow uses a public embed endpoint.
  // If a token is supplied, include it for compatibility with older setups.
  const endpoint = token ? `${endpointBase}?token=${token}` : endpointBase;

  const body = toZenFormData(input);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Origin: 'https://thezenfemme.com',
      Referer: 'https://thezenfemme.com/free-chart',
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

async function calculatePositionsFromZenFemme(localDate, localTime, timezone, latitude, longitude, options = {}) {
  const zen = await fetchZenChart(
    {
      localDate,
      localTime,
      timezone,
      latitude,
      longitude,
      name: options.name,
      birthplace: options.birthplace || 'Unknown'
    },
    options
  );

  // Embed returns keys: Personality / Design.
  const personality = mapZenSide(zen.Personality);
  const design = mapZenSide(zen.Design);

  return { personality, design, _zenRaw: options.includeRaw ? zen : undefined };
}

module.exports = {
  fetchZenChart,
  calculatePositionsFromZenFemme
};
