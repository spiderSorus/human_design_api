const fs = require('fs');
const path = require('path');

// Read the charts.json file
const chartsData = JSON.parse(fs.readFileSync('charts.json', 'utf8'));

// Create the charts directory if it doesn't exist
const chartsDir = './charts';
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true });
}

// Process each chart
chartsData.charts.forEach(chart => {
  // Convert name to lowercase with underscores
  const filename = chart.name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '') + '.json';
  
  const filepath = path.join(chartsDir, filename);
  
  // Write the individual chart to a file
  fs.writeFileSync(filepath, JSON.stringify(chart, null, 2), 'utf8');
  
  console.log(`Created: ${filepath}`);
});

console.log(`\nTotal files created: ${chartsData.charts.length}`);
