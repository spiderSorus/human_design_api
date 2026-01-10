const { calculateChart } = require('./index');

async function main() {
    try {
        console.log('Running chart for 28 July 1984 @ 19:10 UTC');
        // Location is required by the API. If you want a specific place, tell me the city (or lat/long).
        // Walnut Creek, CA: 37.9101, -122.0652
        const result = await calculateChart('1984-07-28', '19:10', 37.9101, -122.0652);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
}

main();
