const assert = require('assert');
const { calculateGateTransitSegmentsUtc } = require('./index');

// Basic sanity checks for transit segmentation.
// Run: node verify_transits.js

async function main() {
  const data = await calculateGateTransitSegmentsUtc(
    '2026-01-01', '00:00',
    '2026-01-02', '00:00',
    { bodies: ['Sun', 'Moon'], stepMinutes: 60, boundaryResolutionSeconds: 60 }
  );

  const dataWithRows = await calculateGateTransitSegmentsUtc(
    '2026-01-01', '00:00',
    '2026-01-02', '00:00',
    { bodies: ['Sun', 'Moon'], stepMinutes: 60, boundaryResolutionSeconds: 60, includeRows: true }
  );

  for (const body of ['Sun', 'Moon']) {
    const segs = data.bodies[body];
    assert.ok(Array.isArray(segs) && segs.length >= 1, `${body} should have >= 1 segment`);
    assert.equal(segs[0].start, '2026-01-01T00:00:00Z');
    assert.equal(segs[segs.length - 1].end, '2026-01-02T00:00:00Z');

    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      assert.ok(Number.isInteger(s.gate), `${body} segment gate should be integer`);
      assert.ok(s.start < s.end, `${body} segment start should be < end`);
      if (i > 0) {
        assert.equal(segs[i - 1].end, s.start, `${body} segments should be contiguous`);
      }
    }
  }

  assert.ok(Array.isArray(dataWithRows.rows), 'includeRows=true should return rows[]');
  assert.ok(dataWithRows.rows.length >= 2, 'rows should include at least one row per body');

  console.log('verify_transits: OK');
}

main().catch((e) => {
  console.error('verify_transits: FAILED');
  console.error(e);
  process.exit(1);
});
