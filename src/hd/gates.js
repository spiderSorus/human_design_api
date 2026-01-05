const { HD_OFFSET_TROPICAL, GATES_SEQUENCE } = require('./constants');

function getGateDetails(tropicalLongitude) {
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
  const degreeInColor = degreeInLine % 0.15625;

  // Tone (1-6)
  const toneIndex = Math.floor(degreeInColor / 0.026041666666666668);
  const tone = toneIndex + 1;

  return { gate, line, color, tone };
}

module.exports = { getGateDetails };

