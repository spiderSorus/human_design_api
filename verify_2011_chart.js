const { calculateChart } = require('./index');

async function test() {
    try {
        console.log("Running Verification for User Chart (Mar 24, 2011, 11:37 AM PDT -> 18:37 UTC)");
        
        // Roseburg OR: 43.2165, -123.3417
        // Timezone: PDT (UTC-7)
        // 11:37 + 7 = 18:37 UTC
        
        const result = await calculateChart('2011-03-24', '18:37', 43.2165, -123.3417);
        
        const expectedPersonality = {
            "Sun": { gate: 25, line: 6 },
            "Earth": { gate: 46, line: 6 },
            "Moon": { gate: 5, line: 2 },
            "NorthNode": { gate: 11, line: 6 },
            "SouthNode": { gate: 12, line: 6 },
            "Mercury": { gate: 42, line: 2 },
            "Venus": { gate: 30, line: 3 },
            "Mars": { gate: 36, line: 1 },
            "Jupiter": { gate: 21, line: 5 },
            "Saturn": { gate: 48, line: 6 },
            "Uranus": { gate: 25, line: 3 },
            "Neptune": { gate: 30, line: 6 },
            "Pluto": { gate: 58, line: 4 }
        };

        const expectedDesign = {
            "Sun": { gate: 58, line: 3 },
            "Earth": { gate: 52, line: 3 },
            "Moon": { gate: 46, line: 1 },
            "NorthNode": { gate: 10, line: 5 },
            "SouthNode": { gate: 15, line: 5 },
            "Mercury": { gate: 26, line: 4 },
            "Venus": { gate: 43, line: 1 },
            "Mars": { gate: 38, line: 6 },
            "Jupiter": { gate: 36, line: 4 },
            "Saturn": { gate: 57, line: 2 },
            "Uranus": { gate: 36, line: 5 },
            "Neptune": { gate: 30, line: 3 },
            "Pluto": { gate: 58, line: 2 }
        };

        let passed = true;

        console.log("\n--- Personality Verification ---");
        for (const [planet, data] of Object.entries(expectedPersonality)) {
            const res = result.personality[planet];
            if (!res) {
                console.log(`❌ ${planet}: Missing in result`);
                passed = false;
                continue;
            }
            const matchGate = res.gate === data.gate;
            const matchLine = res.line === data.line;
            const icon = (matchGate && matchLine) ? "✅" : "❌";
            console.log(`${icon} ${planet}: Goal [${data.gate}.${data.line}] vs Got [${res.gate}.${res.line}]`);
            if (!matchGate || !matchLine) passed = false;
        }

        console.log("\n--- Design Verification ---");
        for (const [planet, data] of Object.entries(expectedDesign)) {
            const res = result.design[planet];
            if (!res) {
                console.log(`❌ ${planet}: Missing in result`);
                passed = false;
                continue;
            }
            const matchGate = res.gate === data.gate;
            const matchLine = res.line === data.line;
            const icon = (matchGate && matchLine) ? "✅" : "❌";
            console.log(`${icon} ${planet}: Goal [${data.gate}.${data.line}] vs Got [${res.gate}.${res.line}]`);
            if (!matchGate || !matchLine) passed = false;
        }

        // Expected Channels
        // "5-15 (Channel of Rhythm)"
        const expectedChannels = ["5-15"];
        
        console.log("\n--- Channel Verification ---");
        const calculatedCh = result.definedChannels.map(ch => ch.sort((a,b)=>a-b).join('-'));
        console.log("Calculated:", calculatedCh);
        
        const channelsMatch = expectedChannels.every(ch => calculatedCh.includes(ch));
        
        // Note: We might calculate EXTRA channels (e.g. 10-57 from Nodes/Saturn) which are technically correct based on activations but excluded in user's interpretation.
        // We only fail if we are MISSING expected channels.
        if (channelsMatch) console.log("✅ All Expected Channels Present");
        else {
            console.log("❌ Missing Channels:", expectedChannels.filter(ch => !calculatedCh.includes(ch)));
            passed = false;
        }

        if (passed) {
            console.log("\n✨ FULL VERIFICATION PASSED ✨");
        } else {
            console.log("\n⚠️ VERIFICATION FAILED ⚠️");
        }

    } catch (e) {
        console.error(e);
    }
}

test();
