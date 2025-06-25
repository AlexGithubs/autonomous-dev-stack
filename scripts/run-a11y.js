#!/usr/bin/env node

const { chromium } = require('playwright');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PAGES_TO_TEST = [
  { name: 'Home', url: '/' },
  { name: 'API Health', url: '/api/hello' },
];

async function runA11yTests() {
  console.log('♿ Starting accessibility tests...');
  
  // Create reports directory
  const reportsDir = path.join(__dirname, '../reports/a11y');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];
  let hasViolations = false;
  
  for (const pageConfig of PAGES_TO_TEST) {
    console.log(`\nTesting: ${pageConfig.name} (${pageConfig.url})`);
    
    const page = await context.newPage();
    
    try {
      await page.goto(`${BASE_URL}${pageConfig.url}`, { waitUntil: 'networkidle' });
      
      // Skip axe injection for API endpoints
      if (pageConfig.url.startsWith('/api')) {
        console.log('  ✓ API endpoint - skipping accessibility tests');
        continue;
      }
      
      // Inject axe-core
      await injectAxe(page);
      
      // Run accessibility checks
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
          rules: {
            'color-contrast': { enabled: true },
            'html-has-lang': { enabled: true },
            'image-alt': { enabled: true },
            'meta-viewport': { enabled: true },
            'document-title': { enabled: true },
            'link-name': { enabled: true },
            'heading-order': { enabled: true },
            'label': { enabled: true },
          },
        },
      });
      
      // Get violations
      const violations = await getViolations(page);
      
      if (violations.length > 0) {
        hasViolations = true;
        console.log(`  ❌ Found ${violations.length} accessibility violations`);
        
        violations.forEach((violation, index) => {
          console.log(`\n  Violation ${index + 1}:`);
          console.log(`    Rule: ${violation.id}`);
          console.log(`    Impact: ${violation.impact}`);
          console.log(`    Help: ${violation.help}`);
          console.log(`    Elements affected: ${violation.nodes.length}`);
        });
      } else {
        console.log('  ✅ No accessibility violations found');
      }
      
      results.push({
        page: pageConfig.name,
        url: pageConfig.url,
        timestamp: new Date().toISOString(),
        violations: violations,
        violationCount: violations.length,
        passed: violations.length === 0,
      });
      
      // Take screenshot with violations highlighted
      if (violations.length > 0) {
        await page.screenshot({
          path: path.join(reportsDir, `${pageConfig.name.toLowerCase()}-violations.png`),
          fullPage: true,
        });
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${pageConfig.name}: ${error.message}`);
      results.push({
        page: pageConfig.name,
        url: pageConfig.url,
        timestamp: new Date().toISOString(),
        error: error.message,
        passed: false,
      });
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  
  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: results.length,
    passedPages: results.filter(r => r.passed).length,
    failedPages: results.filter(r => !r.passed).length,
    totalViolations: results.reduce((sum, r) => sum + (r.violationCount || 0), 0),
    results: results,
  };
  
  // Write JSON report
  fs.writeFileSync(
    path.join(reportsDir, 'a11y-report.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(summary);
  fs.writeFileSync(
    path.join(reportsDir, 'a11y-report.html'),
    htmlReport
  );
  
  // Print summary
  console.log('\n📊 Accessibility Test Summary:');
  console.log(`  Total pages tested: ${summary.totalPages}`);
  console.log(`  Pages passed: ${summary.passedPages}`);
  console.log(`  Pages failed: ${summary.failedPages}`);
  console.log(`  Total violations: ${summary.totalViolations}`);
  console.log(`\n📄 Reports saved to: reports/a11y/`);
  
  // Exit with error if violations found
  if (hasViolations) {
    process.exit(1);
  }
}

function generateHtmlReport(summary) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Test Report</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .violation { background: #fee; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ef4444; }
    .impact-critical { border-left-color: #dc2626; }
    .impact-serious { border-left-color: #f97316; }
    .impact-moderate { border-left-color: #eab308; }
    .impact-minor { border-left-color: #84cc16; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Accessibility Test Report</h1>
  <p>Generated: ${new Date(summary.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Base URL: ${summary.baseUrl}</p>
    <p>Pages tested: ${summary.totalPages}</p>
    <p class="passed">Passed: ${summary.passedPages}</p>
    <p class="failed">Failed: ${summary.failedPages}</p>
    <p>Total violations: ${summary.totalViolations}</p>
  </div>
  
  <h2>Results by Page</h2>
  <table>
    <thead>
      <tr>
        <th>Page</th>
        <th>URL</th>
        <th>Status</th>
        <th>Violations</th>
      </tr>
    </thead>
    <tbody>
      ${summary.results.map(result => `
        <tr>
          <td>${result.page}</td>
          <td>${result.url}</td>
          <td class="${result.passed ? 'passed' : 'failed'}">
            ${result.passed ? '✅ Passed' : '❌ Failed'}
          </td>
          <td>${result.violationCount || (result.error ? 'Error' : '0')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  ${summary.results.filter(r => r.violations && r.violations.length > 0).map(result => `
    <h2>${result.page} - Violations</h2>
    ${result.violations.map(v => `
      <div class="violation impact-${v.impact}">
        <h3>${v.id}</h3>
        <p><strong>Impact:</strong> ${v.impact}</p>
        <p><strong>Help:</strong> ${v.help}</p>
        <p><strong>Elements affected:</strong> ${v.nodes.length}</p>
        <p><strong>More info:</strong> <a href="${v.helpUrl}" target="_blank">${v.helpUrl}</a></p>
      </div>
    `).join('')}
  `).join('')}
</body>
</html>
  `;
}

// Run tests
runA11yTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});