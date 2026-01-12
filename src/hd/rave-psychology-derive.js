const {
  tone: toneLookup,
  color: colorLookup,
  line: lineLookup,
  bases,
  harmonics,
  phs_regime_labels,
  environment_activity,
  phsDetails,
  content_library,
  cognition_library,
  asIntKeyedLookup
} = require('./rave-psychology');

function orientationLabelForTone(tone, { leftLabel, rightLabel }) {
  const left = isLeftTone(tone);
  if (left === null) return null;
  return left ? leftLabel : rightLabel;
}

function pickDefined(obj, keys) {
  return keys.reduce((acc, k) => {
    if (obj[k] !== undefined && obj[k] !== null) acc[k] = obj[k];
    return acc;
  }, {});
}

function deriveFromActivation(activation) {
  if (!activation) return null;
  const { line, color, tone } = activation;

  const toneRow = asIntKeyedLookup(toneLookup, tone);
  const colorRow = asIntKeyedLookup(colorLookup, color);
  const lineRow = asIntKeyedLookup(lineLookup, line);

  const orientation = toneRow?.orientation;

  return {
    raw: { line, color, tone },
    tone: toneRow ?? null,
    color: colorRow ?? null,
    line: lineRow ?? null,
    // A few convenient common rollups
    cognition: toneRow?.cognition ?? null,
    internalSense: toneRow?.internal_sense ?? null,
    orientation: orientation ?? null,
    binary: toneRow?.binary ?? null,
    motivation: colorRow?.motivation ?? null,
    transference: colorRow?.transference ?? null,
    phsDetermination: colorRow?.phs_determination ?? null,
    // fixing depends on the tone-derived orientation
    fixing: orientation && colorRow?.fixing ? colorRow.fixing[orientation] ?? null : null,
    view: lineRow?.view ?? null,
    environment: lineRow?.environment ?? null
  };
}

function isLeftTone(tone) {
  const t = Number(tone);
  if (!Number.isFinite(t)) return null;
  return t <= 3;
}

function deriveRavePsychologyAndPHS(chart) {
  // We lean on the most common convention:
  // - Personality: use Personality Sun (line/color/tone) and Personality Nodes (line/color)
  // - Design: use Design Sun (line/color/tone) and Design Nodes (line/color)
  //
  // If a chart is personality-only (design is null), we derive only personality.

  const pSun = chart?.personality?.Sun;
  const pEarth = chart?.personality?.Earth;
  const pNodes = {
    line: chart?.personality?.NorthNode?.line,
    color: chart?.personality?.NorthNode?.color
  };

  const pNorthNode = chart?.personality?.NorthNode;

  const pSunDerived = deriveFromActivation(pSun);
  const pNodeLine = asIntKeyedLookup(lineLookup, pNodes.line);
  const pNodeColor = asIntKeyedLookup(colorLookup, pNodes.color);

  const harmonicColor = harmonics?.[Number(pSun?.color)] ?? null;
  const transferenceMotivation = harmonicColor ? asIntKeyedLookup(colorLookup, harmonicColor)?.motivation ?? null : null;

  const pSunBase = asIntKeyedLookup(bases, pSun?.base);
  const pEarthBase = asIntKeyedLookup(bases, pEarth?.base);

  const harmonicLine = harmonics?.[Number(pNodes.line)] ?? null;
  const nodeViewDistraction = harmonicLine ? asIntKeyedLookup(lineLookup, harmonicLine)?.view ?? null : null;

  const personality = {
    sun: {
      cognition: pSunDerived?.cognition ?? null,
      motivation: pSunDerived?.motivation ?? null,
      motivation_transference: transferenceMotivation,
      trajectory: pSunDerived?.fixing ?? null,
      view: pSunDerived?.line?.view ?? null,
      distraction: pSunDerived?.line?.distraction ?? null,
      orientation: orientationLabelForTone(pSun?.tone, {
        leftLabel: 'Left (Strategic)',
        rightLabel: 'Right (Receptive)'
      }),
      base: pSunBase
    },
    earth: {
      base: pEarthBase
    },
    nodes: {
      view: pNodeLine?.view ?? null,
      view_distraction: nodeViewDistraction,
      orientation: orientationLabelForTone(chart?.personality?.NorthNode?.tone, {
        leftLabel: 'Left (Strategic)',
        rightLabel: 'Right (Receptive)'
      }),
      base: asIntKeyedLookup(bases, pNorthNode?.base)
    }
  };

  if (!chart?.design) {
    return {
      personality,
      design: null
    };
  }

  const dSun = chart?.design?.Sun;
  const dEarth = chart?.design?.Earth;
  const dNodes = {
    line: chart?.design?.NorthNode?.line,
    color: chart?.design?.NorthNode?.color
  };

  const dSouthNode = chart?.design?.SouthNode;

  const dSunDerived = deriveFromActivation(dSun);
  const dNodeLine = asIntKeyedLookup(lineLookup, dNodes.line);
  const dNodeColor = asIntKeyedLookup(colorLookup, dNodes.color);
  const southNodeTone = chart?.design?.SouthNode?.tone;
  const leftSouthNode = isLeftTone(southNodeTone);
  const environmentStyle =
    leftSouthNode === null ? null : leftSouthNode ? environment_activity.left : environment_activity.right;

  const dSunColor = chart?.design?.Sun?.color;
  const leftDesignSun = isLeftTone(chart?.design?.Sun?.tone);
  const regimeKey = leftDesignSun === null ? null : leftDesignSun ? 'left' : 'right';
  const regimeRow = regimeKey && dSunColor ? phs_regime_labels?.[Number(dSunColor)] ?? null : null;
  const dietaryRegime = regimeRow && regimeKey ? `${regimeRow.name}/${regimeRow[regimeKey]}` : null;

  const design = {
    sun: {
      internal_sense: dSunDerived?.internalSense ?? null,
      determination: dSunDerived?.phsDetermination ?? null,
      fixing: dSunDerived?.fixing ?? null,
      dietary_regime: dietaryRegime,
      base: asIntKeyedLookup(bases, chart?.design?.Sun?.base)
    },
    earth: {
      base: asIntKeyedLookup(bases, dEarth?.base)
    },
    nodes: {
      // Correction: landscape comes from Design South Node line.
      environment_landscape: asIntKeyedLookup(lineLookup, chart?.design?.SouthNode?.line)?.environment ?? null,
      environment_style: environmentStyle,
      observed_trajectory: dNodeLine?.view ?? null,
      orientation: orientationLabelForTone(chart?.design?.SouthNode?.tone, {
        leftLabel: 'Left (Active)',
        rightLabel: 'Right (Passive)'
      }),
      base: asIntKeyedLookup(bases, dSouthNode?.base)
    }
  };

  const summary = {
    mind: personality.sun.motivation,
    vision: personality.nodes.view,
    body: design.sun.dietary_regime,
    space: design.nodes.environment_landscape
  };

  const descriptions = {
    mind: content_library?.psychology_motivation?.[Number(pSun?.color)] ?? null,
    vision: content_library?.psychology_view?.[Number(pNorthNode?.line)] ?? null,
    mind_cognition: cognition_library?.[Number(pSun?.tone)] ?? null,
    body: content_library?.phs_determination?.[Number(dSunColor)] ?? null,
    body_internal_sense: cognition_library?.[Number(chart?.design?.Sun?.tone)] ?? null,
    space: content_library?.phs_environment?.[Number(chart?.design?.SouthNode?.line)] ?? null,
    dietary_regime_description:
      content_library?.phs_fixing_library?.internal?.[Number(dSunColor)]?.[regimeKey] ?? null,
    environment_style_description:
      content_library?.phs_fixing_library?.external?.[Number(chart?.design?.SouthNode?.line)]?.[
        isLeftTone(chart?.design?.SouthNode?.tone) ? 'left' : 'right'
      ] ?? null
  };

  return { personality, design, summary, descriptions };
}

module.exports = {
  deriveRavePsychologyAndPHS
};
