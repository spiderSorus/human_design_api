const { HD_OFFSET_TROPICAL, GATES_SEQUENCE } = require('./constants');

function getGateDetails(tropicalLongitude, options = {}) {
  // options:
  // - tonePhaseShiftDegrees: number (applied within a Color, before computing Tone/Base)
  //   This exists for compatibility with some external chart engines.
  // - subdivisionMode: 'standard' | 'bodygraphchart' | 'autoBodygraphchart'
  //   'bodygraphchart' applies a small bias ONLY inside Tone/Base subdivision to emulate
  //   BodyGraphChart/ZenFemme rounding at boundaries.
  const { tonePhaseShiftDegrees = 0, subdivisionMode = 'standard' } = options;

  // Map Tropical to Human Design Wheel
  const hdDegree = (tropicalLongitude - HD_OFFSET_TROPICAL + 360) % 360;

  // Gate
  const gateIndex = Math.floor(hdDegree / 5.625);
  const gate = GATES_SEQUENCE[gateIndex];

  // Position within Gate
  const degreeInGate = hdDegree % 5.625;

  // Line (1-6)
  const lineIndex = Math.floor(degreeInGate / 0.9375);
  const line = lineIndex + 1;

  // Position within Line
  const degreeInLine = degreeInGate % 0.9375;

  // Color (1-6)
  const colorIndex = Math.floor(degreeInLine / 0.15625);
  const color = colorIndex + 1;

  // Position within Color
  const rawDegreeInColor = degreeInLine % 0.15625;
  // Apply optional phase shift and wrap within the Color segment.
  const degreeInColorStandard = (rawDegreeInColor + tonePhaseShiftDegrees + 0.15625) % 0.15625;

  const BGC_SHIFT_DEGREES = -0.005;
  const degreeInColorBGC = (degreeInColorStandard + BGC_SHIFT_DEGREES + 0.15625) % 0.15625;

  const TONE_SIZE = 0.026041666666666668;
  const BASE_SIZE = TONE_SIZE / 5;

  const toToneBase = (degInColor) => {
    const toneIndex = Math.floor(degInColor / TONE_SIZE) + 1;
    const degInTone = degInColor % TONE_SIZE;
    const baseIndex = Math.floor(degInTone / BASE_SIZE) + 1;
    return { toneIndex, baseIndex };
  };

  const stdTB = toToneBase(degreeInColorStandard);
  const bgcTB = toToneBase(degreeInColorBGC);

  // Decide which degreeInColor to use.
  // We only intend to use auto mode for *personality nodes*.
  // Heuristic (empirical):
  // - If BGC changes Tone (rare but happens, e.g. Kay), ZenFemme usually chooses BGC,
  //   BUT we have a counterexample (Roseburg 2011) where ZenFemme stays standard.
  // - If BGC changes Base but not Tone, ZenFemme chooses BGC *only if* the standard
  //   base is not the last base (base 5). If standard base is 5, ZenFemme stays standard.
  //   (This matches Eliza: std base=5, BGC base=4, ZenFemme chooses std.)
  let degreeInColor;
  if (subdivisionMode === 'bodygraphchart') {
    degreeInColor = degreeInColorBGC;
  } else if (subdivisionMode === 'autoBodygraphchart') {
    if (bgcTB.toneIndex !== stdTB.toneIndex) {
      // In our dataset, when the BGC shift flips tone it *should* be chosen.
      // (Kay: std 4.1 -> bgc 3.5, ZenFemme chooses bgc)
      degreeInColor = degreeInColorBGC;
    } else if (bgcTB.baseIndex !== stdTB.baseIndex) {
      degreeInColor = stdTB.baseIndex === 5 ? degreeInColorStandard : degreeInColorBGC;
    } else {
      degreeInColor = degreeInColorStandard;
    }
  } else {
    degreeInColor = degreeInColorStandard;
  }

  // Tone (1-6)
  const toneIndex = Math.floor(degreeInColor / 0.026041666666666668);
  const tone = toneIndex + 1;

  // Base (1-5)
  // Tone is divided into 5 bases.
  const degreeInTone = degreeInColor % 0.026041666666666668;
  const baseIndex = Math.floor(degreeInTone / (0.026041666666666668 / 5));
  const base = baseIndex + 1;

  return { gate, line, color, tone, base };
}

module.exports = { getGateDetails };
