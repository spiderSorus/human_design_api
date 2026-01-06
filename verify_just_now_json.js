const { calculateJustNowChart } = require('./index');

/**
 * Regression check: just-now helper returns a JSON-serializable payload.
 */
async function test() {
  try {
    const result = await calculateJustNowChart(37.7749, -122.4194, {
      now: new Date(Date.UTC(2026, 0, 6, 18, 37, 0))
    });

    // should not include design
    if (result.design !== null) {
      console.error('❌ Expected design to be null');
      process.exit(1);
    }

    // should be JSON stringify-able
    const json = JSON.stringify(result);
    if (!json || json.length < 10) {
      console.error('❌ Expected JSON output');
      process.exit(1);
    }

    console.log('✅ Just-now JSON serialization passed');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

test();

