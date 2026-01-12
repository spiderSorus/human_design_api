const { calculateChart } = require('./index');

async function main() {
    try {
        console.log('Running chart for 29 January 1956 @ 19:47 UTC (Los Angeles, CA)');
        // Location is required by the API. If you want a specific place, tell me the city (or lat/long).
        // Los Angeles, CA: 34.0522, -118.2437
        const result = await calculateChart('1956-01-29', '19:47', 34.0522, -118.2437);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
}

main();
