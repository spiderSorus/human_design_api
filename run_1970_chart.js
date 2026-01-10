const { calculateChart } = require('./index');

async function main() {
    try {
        console.log("Running chart for 14 April 1970 @ 09:45 UTC (Lexington, KY)");
        // Lexington, KY: 38.0406, -84.5037
        const result = await calculateChart('1970-04-14', '09:45', 38.0406, -84.5037);
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    }
}

main();