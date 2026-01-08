const { calculateGateTransitSegmentsUtc } = require('./index');

async function main() {
  // Example: 7-day transit segments for fast-moving bodies for a Gantt chart
  const data = await calculateGateTransitSegmentsUtc(
    '2026-01-01', '00:00',
    '2026-01-08', '00:00',
    {
      bodies: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'],
      stepMinutes: 30,
      boundaryResolutionSeconds: 30
    }
  );

  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
