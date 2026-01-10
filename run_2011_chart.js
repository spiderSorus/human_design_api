const { calculateChart } = require('./index');

async function main() {
    try {
        console.log("Running chart for 24 March 2011 @ 18:37 UTC");
        // Coordinates for Roseburg, OR (from verify_2011_chart.js)
        const result = await calculateChart('2011-03-24', '18:37', 43.2165, -123.3417);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();