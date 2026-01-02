const { calculateHumanDesign } = require('./main');

// User Data: 11/09/1982 at 6:13 am in Lakeview, Oregon
const birthData = {
    year: 1982,
    month: 11,
    day: 9,
    hour: 6,
    minute: 13,
    lat: 42.1888,
    lon: -120.3464
};

// Expected Channels from user's provided chart
const expectedChannels = [
    [11, 56],
    [34, 57],
    [28, 38]
];

// Helper to check if a channel exists in the results
function hasChannel(results, ch) {
    return results.channels.some(c => 
        (c[0] === ch[0] && c[1] === ch[1]) || 
        (c[0] === ch[1] && c[1] === ch[0])
    );
}

calculateHumanDesign(
    birthData.year, 
    birthData.month, 
    birthData.day, 
    birthData.hour, 
    birthData.minute, 
    birthData.lat, 
    birthData.lon
).then(results => {
    console.log("Calculated Chart for User:");
    console.log(JSON.stringify(results, null, 2));

    console.log("\n--- Verification ---");
    let allFound = true;
    expectedChannels.forEach(ch => {
        const found = hasChannel(results, ch);
        console.log(`Channel ${ch[0]}-${ch[1]}: ${found ? 'FOUND' : 'MISSING'}`);
        if (!found) allFound = false;
    });

    if (allFound) {
        console.log("\nSUCCESS: All expected channels found.");
    } else {
        console.log("\nFAILURE: Some channels are missing. Calculation logic likely needs offset adjustment.");
    }
});
