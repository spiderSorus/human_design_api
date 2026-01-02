const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runAllTests() {
    const testDir = __dirname; // Current directory where test files are located
    const files = fs.readdirSync(testDir);
    
    // Filter for files starting with 'verify_' and ending with '.js'
    const testFiles = files.filter(file => file.startsWith('verify_') && file.endsWith('.js') && file !== 'test_runner.js');

    console.log(`Found ${testFiles.length} verification scripts.`);
    let allPassed = true;

    for (const file of testFiles) {
        console.log(`\n---------------------------------------------------`);
        console.log(`🚀 Running ${file}...`);
        console.log(`---------------------------------------------------`);
        
        try {
            execSync(`node ${file}`, { stdio: 'inherit' });
            console.log(`✅ ${file} passed.`);
        } catch (error) {
            console.error(`❌ ${file} failed.`);
            allPassed = false;
        }
    }

    console.log(`\n---------------------------------------------------`);
    if (allPassed) {
        console.log("✨ ALL TESTS PASSED ✨");
        process.exit(0);
    } else {
        console.error("⚠️ SOME TESTS FAILED ⚠️");
        process.exit(1);
    }
}

runAllTests();
