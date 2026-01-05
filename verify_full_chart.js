const { calculateChart } = require('./index');

async function test() {
    try {
        console.log("Running Full Verification for User Chart (Nov 9, 1982, 06:13 AM PST -> 14:13 UTC)");
        
        const result = await calculateChart('1982-11-09', '14:13', 42.1888, -120.3464);
        
        // Expected Data from User JSON
        const expectedPersonality = {
            "Sun": { gate: 1, line: 4 },
            "Earth": { gate: 2, line: 4 },
            "Moon": { gate: 59, line: 4 },
            "NorthNode": { gate: 52, line: 2 },
            "SouthNode": { gate: 58, line: 2 },
            "Mercury": { gate: 44, line: 4 },
            "Venus": { gate: 1, line: 6 },
            "Mars": { gate: 58, line: 3 },
            "Jupiter": { gate: 43, line: 2 },
            "Saturn": { gate: 50, line: 2 },
            "Uranus": { gate: 34, line: 4 },
            "Neptune": { gate: 11, line: 3 },
            "Pluto": { gate: 50, line: 2 }
        };

        const expectedDesign = {
            "Sun": { gate: 7, line: 6 },
            "Earth": { gate: 13, line: 6 },
            "Moon": { gate: 24, line: 4 },
            "NorthNode": { gate: 39, line: 4 },
            "SouthNode": { gate: 38, line: 4 },
            "Mercury": { gate: 59, line: 6 },
            "Venus": { gate: 56, line: 1 },
            "Mars": { gate: 28, line: 4 },
            "Jupiter": { gate: 28, line: 2 },
            "Saturn": { gate: 57, line: 3 },
            "Uranus": { gate: 34, line: 1 },
            "Neptune": { gate: 11, line: 2 },
            "Pluto": { gate: 32, line: 5 }
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

        // Expected Channels (Implied from planets provided in user JSON context)
        // 34-57 (P-Uranus 34, D-Saturn 57)
        // 28-38 (D-Mars 28, D-SouthNode 38)
        // 11-56 (P-Neptune 11, D-Venus 56)
        const expectedChannels = ["34-57", "28-38", "11-56"];
        
        console.log("\n--- Channel Verification ---");
        const calculatedCh = result.definedChannels.map(ch => ch.sort((a,b)=>a-b).join('-'));
        console.log("Calculated:", calculatedCh);
        
        const channelsMatch = expectedChannels.every(ch => calculatedCh.includes(ch));
        if (channelsMatch) console.log("✅ All Expected Channels Present");
        else {
            console.log("❌ Missing Channels");
            passed = false;
        }

        if (passed) {
            console.log("\n✨ FULL VERIFICATION PASSED ✨");
            process.exit(0);
        } else {
            console.log("\n⚠️ VERIFICATION FAILED ⚠️");
            process.exit(1);
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

test();
