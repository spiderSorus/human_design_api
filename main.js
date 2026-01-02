const swisseph = require('swisseph');
const { DateTime } = require('luxon');

// Order of Gates starting from 0 Aries
const GATES_ORDER = [
    25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 
    7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 
    10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36
];

/**
 * Maps a celestial longitude to Human Design Gate, Line, Color, and Tone.
 * Each Gate is 5.625 degrees.
 */
function getGateDetails(longitude) {
    // Standardize to 0-360
    const normalized = (longitude + 360) % 360;
    
    // Gate calculation (1-64)
    // Map degree to index in the wheel (0-63)
    const index = Math.floor(normalized / 5.625);
    const gate = GATES_ORDER[index];
    
    // Line calculation (1-6)
    // The remainder within the gate determines the line
    const positionInGate = normalized % 5.625;
    const lineRaw = (positionInGate / 5.625) * 6;
    const line = Math.floor(lineRaw) + 1;
    
    // Color calculation (1-6)
    const colorRaw = (lineRaw % 1) * 6;
    const color = Math.floor(colorRaw) + 1;

    return { gate, line, color };
}

/**
 * Core Engine: Returns full HD chart data
 */
async function calculateHumanDesign(year, month, day, hour, minute, lat, lon) {
    return new Promise((resolve) => {
        // 1. Calculate Personality (Conscious) Julian Day
        swisseph.swe_julday(year, month, day, hour + (minute / 60), swisseph.SE_GREG_CAL, (jd_personality) => {
            
            // 2. Calculate Design (Unconscious) Time
            // Design is exactly 88 degrees of the Sun's movement before birth.
            // Simplified here as ~88 days prior.
            const jd_design = jd_personality - 88.0; 

            const bodies = {
                Sun: swisseph.SE_SUN,
                Earth: swisseph.SE_SUN, // Calculated as opposite of Sun
                Moon: swisseph.SE_MOON,
                NorthNode: swisseph.SE_TRUE_NODE,
                SouthNode: swisseph.SE_TRUE_NODE, // Calculated as opposite of NorthNode
                Mercury: swisseph.SE_MERCURY,
                Venus: swisseph.SE_VENUS,
                Mars: swisseph.SE_MARS,
                Jupiter: swisseph.SE_JUPITER,
                Saturn: swisseph.SE_SATURN,
                Uranus: swisseph.SE_URANUS,
                Neptune: swisseph.SE_NEPTUNE,
                Pluto: swisseph.SE_PLUTO
            };

            const results = { personality: {}, design: {} };

            // Helper to process bodies for a given JD
            const processBodies = (jd, type) => {
                let pending = Object.keys(bodies).length;
                
                Object.keys(bodies).forEach((name) => {
                    const id = bodies[name];
                    
                    swisseph.swe_calc_ut(jd, id, swisseph.SEFLG_SWIEPH, (body) => {
                        let long = body.longitude;
                        
                        // Handle Earth (opposite Sun)
                        if (name === 'Earth') {
                            long = (long + 180) % 360;
                        }
                        
                        // Handle SouthNode (opposite NorthNode)
                        if (name === 'SouthNode') {
                            long = (long + 180) % 360;
                        }

                        results[type][name] = getGateDetails(long);
                        
                        pending--;
                        if (pending === 0 && Object.keys(results.personality).length > 0 && Object.keys(results.design).length > 0) {
                            // Only resolve when BOTH personality and design are done
                            // But since we are calling this twice (async?), we need a better sync mechanism.
                            // However, swe_calc_ut is sync if not using ephemeris files? 
                            // The callback structure implies async or CPS.
                        }
                    });
                });
            };

            // Using Promises for cleaner flow
            const calcBody = (jd, name, id) => {
                return new Promise((res) => {
                    swisseph.swe_calc_ut(jd, id, swisseph.SEFLG_SWIEPH, (body) => {
                        let long = body.longitude;
                        if (name === 'Earth' || name === 'SouthNode') {
                            long = (long + 180) % 360;
                        }
                        res({ name, details: getGateDetails(long) });
                    });
                });
            };

            const allBodyPromises = [];

            // Personality
            Object.keys(bodies).forEach(name => {
                allBodyPromises.push(
                    calcBody(jd_personality, name, bodies[name]).then(data => {
                        results.personality[name] = data.details;
                    })
                );
            });

            // Design
            Object.keys(bodies).forEach(name => {
                allBodyPromises.push(
                    calcBody(jd_design, name, bodies[name]).then(data => {
                        results.design[name] = data.details;
                    })
                );
            });

            Promise.all(allBodyPromises).then(() => {
                results.channels = calculateChannels(results);
                resolve(results);
            });
        });
    });
}

function calculateChannels(data) {
    const activeGates = new Set([
        ...Object.values(data.personality).map(v => v.gate),
        ...Object.values(data.design).map(v => v.gate)
    ]);
    
    // User verified channels + Standard examples
    const channelMap = [
        [20, 57], [10, 34], [43, 23], 
        [11, 56], [34, 57], [28, 38]
        // Add full list of 36 channels for complete implementation
    ]; 
    
    return channelMap.filter(ch => activeGates.has(ch[0]) && activeGates.has(ch[1]));
}

module.exports = {
    calculateHumanDesign,
    getGateDetails
};
