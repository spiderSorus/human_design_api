// Utilities to convert a ZenFemme/BodyGraphChart payload into the flattened
// schema used by charts.json.

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

function stripPrefixKeys(flat, prefixes) {
  const out = {};
  for (const [k, v] of Object.entries(flat)) {
    if (prefixes.some((p) => k === p || k.startsWith(p + '.'))) continue;
    out[k] = v;
  }
  return out;
}

// In many Zen payloads, objects use {id, option, key, ...}. Keep just `option`.
function simplifyIdOptionObjects(value) {
  if (Array.isArray(value)) return value.map(simplifyIdOptionObjects);
  if (!value || typeof value !== 'object') return value;

  const hasOption = Object.prototype.hasOwnProperty.call(value, 'option');
  const hasId = Object.prototype.hasOwnProperty.call(value, 'id');
  const hasKey = Object.prototype.hasOwnProperty.call(value, 'key');
  const hasName = Object.prototype.hasOwnProperty.call(value, 'name');
  const hasDescription = Object.prototype.hasOwnProperty.call(value, 'description');
  const hasDescriptionCaps = Object.prototype.hasOwnProperty.call(value, 'Description');
  const hasLink = Object.prototype.hasOwnProperty.call(value, 'link');
  const hasLinkCaps = Object.prototype.hasOwnProperty.call(value, 'Link');

  // Clean noisy metadata if present.
  if (hasDescription) delete value.description;
  if (hasDescriptionCaps) delete value.Description;
  if (hasLink) delete value.link;
  if (hasLinkCaps) delete value.Link;
  if (hasName) delete value.name;

  if (hasOption && (hasId || hasKey) && Object.keys(value).length <= 3) {
    return value.option;
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = simplifyIdOptionObjects(v);
  return out;
}

// Flatten to a single-level object with dot-path keys.
// Arrays are preserved as arrays.
function flattenObject(value, prefix = '', out = {}) {
  if (Array.isArray(value)) {
    out[prefix] = value;
    return out;
  }

  if (!value || typeof value !== 'object') {
    out[prefix] = value;
    return out;
  }

  for (const [k, v] of Object.entries(value)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flattenObject(v, key, out);
    } else {
      out[key] = v;
    }
  }
  return out;
}

function buildPlacementTree(zen) {
  const out = { personality: {}, design: {} };
  const sides = [
    ['Personality', 'personality'],
    ['Design', 'design']
  ];
  for (const [zenSide, outSide] of sides) {
    const placements = zen?.[zenSide];
    if (!placements || typeof placements !== 'object') continue;
    for (const [body, v] of Object.entries(placements)) {
      if (!v) continue;
      const key = body
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      out[outSide][key] = {
        gate: v.Gate,
        line: v.Line,
        color: v.Color,
        tone: v.Tone,
        base: v.Base
      };
    }
  }
  return out;
}

function zenToFlatChart({ sample, zenFull }) {
  const zenStripped = simplifyIdOptionObjects(
    stripKeysDeep(
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
        'Email',
        'Planets',
        'planets',
        // These are large + redundant and not useful for our purposes.
        'Gates'
      ])
    )
  );

  const positions = buildPlacementTree(zenStripped);

  let flat = flattenObject(zenStripped);
  // Drop gates sections entirely (redundant/unhelpful).
  flat = stripPrefixKeys(flat, ['Gates', 'Properties.Gates']);
  // De-duplication: placements are already represented as `positions`.
  flat = stripPrefixKeys(flat, ['Personality', 'Design']);

  // Move everything into a single `properties` object.
  // Additionally, prefer dropping the `Properties.` prefix for readability.
  const properties = {};
  for (const [k, v] of Object.entries(flat)) {
    if (k.startsWith('Properties.')) {
      properties[k.slice('Properties.'.length)] = v;
    } else {
      properties[k] = v;
    }
  }

  // Requested pruning: remove conscious/unconscious centers (and related center lists)
  // since they are redundant/noisy for now.
  delete properties.ConsciousCenters;
  delete properties.UnconsciousCenters;
  delete properties.DefinedCenters;
  delete properties.OpenCenters;
  // Also remove any flattened remnants.
  for (const k of Object.keys(properties)) {
    if (k.startsWith('DefinedCenters.') || k.startsWith('OpenCenters.')) {
      delete properties[k];
    }
  }

  return {
    ...sample,
    positions,
    properties
  };
}

module.exports = {
  zenToFlatChart
};
