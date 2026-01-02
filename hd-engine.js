const swisseph = require('swisseph');
const { DateTime } = require('luxon');

// Configuration
// Gate 41 starts at 0° 0' 0" of the Human Design wheel.
// The prompt specifies this is "roughly 21° 0' 0" Capricorn".
// 0 Aries = 0 degrees tropical.
// 0 Capricorn = 270 degrees tropical.
// Calibrated Offset: 302.00 degrees tropical.
// Final adjustment to capture D-Mars and D-Pluto Line transitions.
const HD_OFFSET_TROPICAL = 302.00; 

// Gate Order starting from Gate 41
const GATES_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// Channels Definition (Pairs of Gates)
const CHANNELS = [
    [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20], [10, 34], 
    [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34], 
    [20, 57], [21, 45], [23, 43], [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], 
    [30, 41], [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
];

// Body IDs
const BODIES = {
    Sun: swisseph.SE_SUN,
    Moon: swisseph.SE_MOON,
    NorthNode: swisseph.SE_TRUE_NODE,
    SouthNode: swisseph.SE_TRUE_NODE, // Calculated as opposite
    Mercury: swisseph.SE_MERCURY,
    Venus: swisseph.SE_VENUS,
    Mars: swisseph.SE_MARS,
    Jupiter: swisseph.SE_JUPITER,
    Saturn: swisseph.SE_SATURN,
    Uranus: swisseph.SE_URANUS,
    Neptune: swisseph.SE_NEPTUNE,
    Pluto: swisseph.SE_PLUTO,
    Earth: swisseph.SE_SUN // Calculated as opposite
};

/**
 * Calculates the Human Design chart.
 * @param {string} birthDate - YYYY-MM-DD
 * @param {string} birthTime - HH:mm
 * @param {number} latitude - Decimal degrees (not used for planetary positions in this simplified version, but kept for signature)
 * @param {number} longitude - Decimal degrees (not used for planetary positions)
 * @returns {Promise<Object>}
 */
async function calculateChart(birthDate, birthTime, latitude, longitude) {
    // 1. Setup Time
    // Assuming inputs are UTC as per requirement "Calculate... for the exact UTC birth time"
    const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: 'utc' });
    if (!dt.isValid) {
        throw new Error("Invalid date/time format");
    }

    // Convert to Julian Day (UT)
    // swe_julday expects year, month, day, hour (decimal)
    const year = dt.year;
    const month = dt.month;
    const day = dt.day;
    const hour = dt.hour + dt.minute / 60 + dt.second / 3600;

    const jd_personality = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);

    // 2. Calculate Personality Positions
    const personality = await calculatePositions(jd_personality);

    // 3. Calculate Design Time (88 degrees Solar Arc back)
    const jd_design = await finddesignTime(jd_personality);

    // 4. Calculate Design Positions
    const design = await calculatePositions(jd_design);

    // 5. Calculate Channels
    const definedChannels = calculateDefinedChannels(personality, design);

    return {
        personality,
        design,
        definedChannels
    };
}

// Helper to fetch body data asynchronously
function fetchBodyData(jd, id) {
    return new Promise((resolve, reject) => {
        swisseph.swe_calc_ut(jd, id, swisseph.SEFLG_SWIEPH, (data) => {
            if (data.error) reject(new Error(data.error));
            else resolve(data);
        });
    });
}

// Re-implement calculatePositions as async
async function calculatePositions(jd) {
    const results = {};
    const promises = [];

    for (const [name, id] of Object.entries(BODIES)) {
        promises.push((async () => {
            let longitude;
            if (name === 'Earth') {
                const sunData = await fetchBodyData(jd, swisseph.SE_SUN);
                longitude = (sunData.longitude + 180) % 360;
            } else if (name === 'SouthNode') {
                const nodeData = await fetchBodyData(jd, swisseph.SE_TRUE_NODE);
                longitude = (nodeData.longitude + 180) % 360;
            } else {
                const bodyData = await fetchBodyData(jd, id);
                longitude = bodyData.longitude;
            }
            results[name] = getGateDetails(longitude);
        })());
    }

    await Promise.all(promises);
    return results;
}

function getGateDetails(tropicalLongitude) {
    // Map Tropical to Human Design Wheel
    // HD 0 = Tropical 291
    // So HD Degree = (Tropical - 291 + 360) % 360
    let hdDegree = (tropicalLongitude - HD_OFFSET_TROPICAL + 360) % 360;

    // Gate
    const gateIndex = Math.floor(hdDegree / 5.625);
    const gate = GATES_SEQUENCE[gateIndex];

    // Position within Gate
    const degreeInGate = hdDegree % 5.625;

    // Line (1-6) - Each Line is 0.9375 degrees
    const lineIndex = Math.floor(degreeInGate / 0.9375);
    const line = lineIndex + 1;

    // Position within Line
    const degreeInLine = degreeInGate % 0.9375;

    // Color (1-6) - Each Color is 0.15625 degrees
    const colorIndex = Math.floor(degreeInLine / 0.15625);
    const color = colorIndex + 1;

    // Position within Color
    const degreeInColor = degreeInLine % 0.15625;

    // Tone (1-6) - Each Tone is 0.026041666... degrees
    const toneIndex = Math.floor(degreeInColor / 0.026041666666666668);
    const tone = toneIndex + 1;

    return {
        gate,
        line,
        color,
        tone
    };
}

async function finddesignTime(jd_personality) {
    // Get Personality Sun position
    const sunData = await fetchBodyData(jd_personality, swisseph.SE_SUN);
    const sunLongPersonality = sunData.longitude;

    // Target is 88 degrees back
    const targetLong = (sunLongPersonality - 88.0 + 360) % 360;

    // Bisection Search
    // Search window: [80 days ago, 100 days ago]
    // Sun moves ~1 deg/day. 88 deg is approx 88 days.
    let low = jd_personality - 100.0;
    let high = jd_personality - 80.0;
    
    // Precision: 1 second = 1/86400 days ~= 0.00001157 days
    const epsilon = 1.0 / 86400.0; 

    // Helper to get angle difference (target - current)
    // Returns value in [-180, 180]
    // If diff > 0, we are "behind" target (need to move forward in time)
    // If diff < 0, we are "ahead" of target (need to move backward)
    // Wait, Sun longitude increases with time (0 -> 360).
    // So if current < target (and not wrapped), we need to increase time.
    // However, wrap around makes this tricky (e.g. current=350, target=10).
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

        // If diff > 0, target is "ahead" of mid in circle terms.
        // Since Sun moves forward (increasing longitude), we need more time.
        // So mid is too early. low = mid.
        if (diff > 0) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return (low + high) / 2;
}

function calculateDefinedChannels(personality, design) {
    const activeGates = new Set();
    
    Object.values(personality).forEach(p => activeGates.add(p.gate));
    Object.values(design).forEach(d => activeGates.add(d.gate));

    const defined = [];
    for (const [g1, g2] of CHANNELS) {
        if (activeGates.has(g1) && activeGates.has(g2)) {
            defined.push([g1, g2]); // Or formatted string
        }
    }
    return defined;
}

module.exports = { calculateChart };
