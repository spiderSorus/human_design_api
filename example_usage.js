const { calculateChart } = require('./hd-engine');

async function test() {
    try {
        // Ra Uru Hu (Robert Alan Krakower)
        // April 9, 1948, 00:05, Montreal (UTC-5 usually, or similar)
        // Let's assume input is UTC. 
        // If he was born 00:05 Local, that's roughly 05:05 UTC.
        const result = await calculateChart('1948-04-09', '05:05', 45.5017, -73.5673);
        
        console.log("Calculated Chart for Ra Uru Hu (approx UTC):");
        console.log(JSON.stringify(result, null, 2));

        // Check if Gate 41 logic works (roughly)
        // Start of year (Jan 22ish) should have Sun in Gate 41.
        const startYear = await calculateChart('2024-01-23', '12:00', 0, 0);
        console.log("\nChart for Jan 23, 2024:");
        console.log("Sun Personality:", startYear.personality.Sun);
        
    } catch (e) {
        console.error(e);
    }
}

test();
