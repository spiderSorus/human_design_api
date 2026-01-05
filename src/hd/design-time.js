const swisseph = require('swisseph');
const { fetchBodyData } = require('./swisseph');

async function findDesignTime(jdPersonality) {
  // Get Personality Sun position
  const sunData = await fetchBodyData(jdPersonality, swisseph.SE_SUN);
  const sunLongPersonality = sunData.longitude;

  // Target is 88 degrees back
  const targetLong = (sunLongPersonality - 88.0 + 360) % 360;

  // Bisection Search window: [80 days ago, 100 days ago]
  let low = jdPersonality - 100.0;
  let high = jdPersonality - 80.0;
  const epsilon = 1.0 / 86400.0; // 1 second in days

  const getDiff = (current, target) => {
    let diff = target - current;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  };

  while ((high - low) > epsilon) {
    const mid = (low + high) / 2;
    const midData = await fetchBodyData(mid, swisseph.SE_SUN);
    const midLong = midData.longitude;

    const diff = getDiff(midLong, targetLong);

    if (diff > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

module.exports = { findDesignTime };

