const fs = require('fs');
const path = require('path');

const REQUIRED_GATES = new Set([1, 2, 5, 7, 8, 13, 14, 15, 29, 31, 33, 46]);
const zfDir = 'zf_charts';
const files = fs.readdirSync(zfDir).filter(f => f.endsWith('.json'));

const people = files.map(file => {
  const data = JSON.parse(fs.readFileSync(path.join(zfDir, file), 'utf8'));
  const gates = new Set();
  
  // Extract gates from personality and design
  const extract = (list) => {
    list.forEach(gStr => {
      const match = gStr.match(/(\d+)\./);
      if (match) gates.add(parseInt(match[1]));
    });
  };

  extract(data.gates.personality);
  extract(data.gates.design);

  return { name: data.name, gates };
});

console.log(`Loaded ${people.length} people. Searching for Pentas...`);

function getCombinations(array, size) {
  const result = [];
  function helper(start, combo) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

const pentas = getCombinations(people, 5);
const validPentas = [];

pentas.forEach(penta => {
  const collectiveGates = new Set();
  penta.forEach(person => {
    person.gates.forEach(g => collectiveGates.add(g));
  });

  const hasAll = [...REQUIRED_GATES].every(g => collectiveGates.has(g));
  if (hasAll) {
    validPentas.push(penta.map(p => p.name));
  }
});

console.log(`\nFound ${validPentas.length} valid Pentas:`);
console.log('====================================');
validPentas.forEach((p, i) => {
  console.log(`${i + 1}. ${p.join(', ')}`);
});
