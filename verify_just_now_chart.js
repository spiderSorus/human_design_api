const { calculateChartWithOptions } = require('./index');

/**
 * Basic verification:
 * - just-now chart does NOT compute design
 * - channels are computed from personality-only gates
 */
async function test() {
    try {
        // Same date as existing verification, but in just-now mode
        const result = await calculateChartWithOptions('1982-11-09', '14:13', 42.1888, -120.3464, { includeDesign: false });

        if (result.design !== null) {
            console.error('❌ Expected design to be null for just-now chart');
            process.exit(1);
        }

        // Ensure we have personality gates
        if (!result.personality || !result.personality.Sun) {
            console.error('❌ Missing personality data');
            process.exit(1);
        }

        // Ensure no channel relies on design-only gates by recomputing expected from personality gates
        const activeGates = new Set(Object.values(result.personality).map(v => v.gate));
        const allChannelsPersonalityOnly = result.definedChannels.every(([g1, g2]) => activeGates.has(g1) && activeGates.has(g2));

        if (!allChannelsPersonalityOnly) {
            console.error('❌ Found a channel that is not fully supported by personality-only gates');
            console.error('Defined channels:', result.definedChannels);
            process.exit(1);
        }

        console.log('✅ Just-now verification passed');
        console.log('Personality Sun:', result.personality.Sun);
        console.log('Defined channels:', result.definedChannels);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
