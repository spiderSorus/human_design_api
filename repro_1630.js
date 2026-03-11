const { calculateChartLocal } = require('./index');
const fs = require('fs');

async function reproduce() {
  const input = {
    localDate: "2012-07-18",
    localTime: "02:56",
    timezone: "Asia/Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    name: "Repro_1630"
  };

  console.log("Calculating Repro 1630 (Local)...");
  const chart = await calculateChartLocal(
    input.localDate, input.localTime, input.timezone, input.latitude, input.longitude,
    { 
      useZenFemme: false, 
      personalityNodesSubdivisionMode: 'autoBodygraphchart',
      designNodesSubdivisionMode: 'autoBodygraphchart'
    }
  );

  const pNN = chart.personality.NorthNode;
  const dNN = chart.design.NorthNode;

  console.log(`Personality NorthNode: ${pNN.gate}.${pNN.line} color:${pNN.color}`);
  console.log(`Design NorthNode:      ${dNN.gate}.${dNN.line} color:${dNN.color}`);
  
  // ZF reference for 1630: 
  // Personality NN: 34.5 color:2
  // Design NN: 9.1 color:1
}

reproduce().catch(console.error);
