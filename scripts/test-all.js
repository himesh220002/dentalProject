const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../test-results.log');

/**
 * Detects clinic name from Git branch
 */
function getClinicName() {
    try {
        const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf-8' }).stdout.trim();
        if (branch.startsWith('clinic/')) {
            return branch.replace('clinic/', '').toUpperCase();
        }
    } catch (e) {
        // Fallback if git fails
    }
    return 'DR-TOOTH';
}

const CLINIC_ID = getClinicName();


/**
 * Removes ANSI escape codes for cleaner text files
 */
function stripAnsi(text) {
    if (!text) return '';
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

/**
 * Parses Vitest output to extract summary counts
 */
function parseSummary(output) {
    const report = {
        files: { total: 0, passed: 0, failed: 0 },
        tests: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };

    // Example match: "Test Files  7 passed (7)" or "Test Files  5 failed | 2 passed (7)"
    const fileMatch = output.match(/Test Files\s+(?:(\d+)\s+failed\s+\|\s+)?(\d+)\s+passed\s+\((\d+)\)/);
    if (fileMatch) {
        report.files.failed = parseInt(fileMatch[1] || '0');
        report.files.passed = parseInt(fileMatch[2]);
        report.files.total = parseInt(fileMatch[3]);
    }

    // Example match: "Tests       23 passed (23)" or "Tests       1 failed | 22 passed (23)"
    const testMatch = output.match(/Tests\s+(?:(\d+)\s+failed\s+\|\s+)?(?:(\d+)\s+skipped\s+\|\s+)?(\d+)\s+passed\s+\((\d+)\)/);
    if (testMatch) {
        report.tests.failed = parseInt(testMatch[1] || '0');
        report.tests.skipped = parseInt(testMatch[2] || '0');
        report.tests.passed = parseInt(testMatch[3]);
        report.tests.total = parseInt(testMatch[4]);
    }

    return report;
}

/**
 * Runs npm test in a specific subdirectory
 */
function runTests(prefix, name) {
    console.log(`\n[${CLINIC_ID}] Starting ${name} Tests... (this may take a minute)`);

    // Using --reporter=default to get the standard summary lines we can parse easily
    const result = spawnSync('npm', ['test', '--prefix', prefix], {
        encoding: 'utf-8',
        shell: true,
        env: { ...process.env, CI: 'true', NODE_ENV: 'test' }
    });

    const cleanOutput = stripAnsi(result.stdout + '\n' + result.stderr);
    const summary = parseSummary(cleanOutput);

    return {
        name,
        success: result.status === 0,
        output: cleanOutput,
        summary
    };
}

function generateReport() {
    const startTime = new Date();

    // 1. Run Server Tests
    const server = runTests('server', 'Server API');

    // 2. Run Client Tests
    const client = runTests('client', 'Client UI');

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const overallSuccess = server.success && client.success;

    // Build the systematic log
    let report = `================================================================================\n`;
    report += `              ${CLINIC_ID} DENTAL CLINIC - GLOBAL TEST REPORT\n`;
    report += `================================================================================\n`;
    report += `Date: ${startTime.toLocaleString()}\n`;
    report += `Duration: ${duration}s\n`;
    report += `Overall Status: ${overallSuccess ? '💚 PASS' : '💔 FAIL'}\n`;
    report += `--------------------------------------------------------------------------------\n\n`;

    report += `[CATEGORY: EXECUTIVE SUMMARY]\n`;
    report += `--------------------------------------------------------------------------------\n`;

    const renderTable = (res) => {
        let t = `${res.name}:\n`;
        t += `  - Files: ${res.summary.files.total} total (${res.summary.files.passed} passed, ${res.summary.files.failed} failed)\n`;
        t += `  - Tests: ${res.summary.tests.total} total (${res.summary.tests.passed} passed, ${res.summary.tests.failed} failed`;
        if (res.summary.tests.skipped > 0) t += `, ${res.summary.tests.skipped} skipped`;
        t += `)\n`;
        t += `  - Result: ${res.success ? 'PASSED' : 'FAILED'}\n\n`;
        return t;
    };

    report += renderTable(server);
    report += renderTable(client);

    report += `--------------------------------------------------------------------------------\n`;
    report += `[CATEGORY: DETAILED INSIGHTS - SERVER]\n`;
    report += `--------------------------------------------------------------------------------\n`;
    report += server.output || 'No output captured.\n';

    report += `\n--------------------------------------------------------------------------------\n`;
    report += `[CATEGORY: DETAILED INSIGHTS - CLIENT]\n`;
    report += `--------------------------------------------------------------------------------\n`;
    report += client.output || 'No output captured.\n';

    report += `\n================================================================================\n`;
    report += `                         END OF SYSTEMATIC LOG\n`;
    report += `================================================================================\n`;

    fs.writeFileSync(LOG_FILE, report);

    // Clean console output
    console.log(report);
    console.log(`\n[${CLINIC_ID}] Detailed systematic log saved to: ${LOG_FILE}\n`);

    if (!overallSuccess) {
        process.exit(1);
    }
}

generateReport();
