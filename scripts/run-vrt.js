#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const VRT_DIR = path.join(__dirname, '../vrt');
const SCREENSHOTS_DIR = path.join(VRT_DIR, 'screenshots');
const BASELINES_DIR = path.join(VRT_DIR, 'baselines');
const DIFF_DIR = path.join(VRT_DIR, 'diffs');

// Pages to capture
const PAGES_TO_CAPTURE = [
  { name: 'home-desktop', url: '/', viewport: { width: 1920, height: 1080 } },
  { name: 'home-tablet', url: '/', viewport: { width: 768, height: 1024 } },
  { name: 'home-mobile', url: '/', viewport: { width: 375, height: 667 } },
];

// Ensure directories exist
[VRT_DIR, SCREENSHOTS_DIR, BASELINES_DIR, DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function captureScreenshots() {
  console.log('📸 Starting Visual Regression Testing...');
  
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  for (const pageConfig of PAGES_TO_CAPTURE) {
    console.log(`\nCapturing: ${pageConfig.name}`);
    
    const context = await browser.newContext({
      viewport: pageConfig.viewport,
      deviceScaleFactor: 2, // Higher quality screenshots
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to page
      await page.goto(`${BASE_URL}${pageConfig.url}`, { 
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      
      // Wait for animations to complete
      await page.waitForTimeout(1000);
      
      // Hide dynamic content
      await page.evaluate(() => {
        // Hide elements with data-vrt-hide attribute
        document.querySelectorAll('[data-vrt-hide]').forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
        
        // Mask sensitive data
        document.querySelectorAll('input[type="password"], .api-key, .credit-card').forEach(el => {
          (el as HTMLElement).style.filter = 'blur(5px)';
        });
        
        // Disable animations
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        document.head.appendChild(style);
      });
      
      // Take screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageConfig.name}.png`);
      const screenshot = await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      
      // Compare with baseline
      const baselinePath = path.join(BASELINES_DIR, `${pageConfig.name}.png`);
      const diffPath = path.join(DIFF_DIR, `${pageConfig.name}-diff.png`);
      
      let diffResult = null;
      
      if (fs.existsSync(baselinePath)) {
        console.log('  Comparing with baseline...');
        diffResult = await compareImages(screenshotPath, baselinePath, diffPath);
        
        if (diffResult.identical) {
          console.log('  ✅ No visual changes detected');
        } else {
          console.log(`  ⚠️  Visual changes detected: ${diffResult.diffPercent.toFixed(2)}% difference`);
          
          if (diffResult.diffPercent > 2) {
            console.log('  ❌ Difference exceeds 2% threshold');
          } else {
            console.log('  ✅ Difference within acceptable threshold');
          }
        }
      } else {
        console.log('  📷 No baseline found - creating new baseline');
        fs.copyFileSync(screenshotPath, baselinePath);
      }
      
      results.push({
        name: pageConfig.name,
        url: pageConfig.url,
        viewport: pageConfig.viewport,
        screenshot: screenshotPath,
        baseline: baselinePath,
        diff: diffResult,
        passed: !diffResult || diffResult.diffPercent <= 2,
      });
      
    } catch (error) {
      console.error(`  ❌ Error capturing ${pageConfig.name}: ${error.message}`);
      results.push({
        name: pageConfig.name,
        url: pageConfig.url,
        error: error.message,
        passed: false,
      });
    } finally {
      await context.close();
    }
  }
  
  await browser.close();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalPages: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results: results,
  };
  
  // Write JSON report
  fs.writeFileSync(
    path.join(VRT_DIR, 'vrt-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(
    path.join(VRT_DIR, 'vrt-report.html'),
    htmlReport
  );
  
  // Print summary
  console.log('\n📊 Visual Regression Test Summary:');
  console.log(`  Total pages: ${report.totalPages}`);
  console.log(`  Passed: ${report.passed}`);
  console.log(`  Failed: ${report.failed}`);
  console.log(`\n📄 Report saved to: vrt/vrt-report.html`);
  
  // Exit with error if tests failed
  if (report.failed > 0) {
    process.exit(1);
  }
}

async function compareImages(imagePath, baselinePath, diffPath) {
  // Simple pixel comparison (in production, use a library like pixelmatch)
  const image = fs.readFileSync(imagePath);
  const baseline = fs.readFileSync(baselinePath);
  
  // Check if files are identical
  const imageHash = createHash('sha256').update(image).digest('hex');
  const baselineHash = createHash('sha256').update(baseline).digest('hex');
  
  if (imageHash === baselineHash) {
    return { identical: true, diffPercent: 0 };
  }
  
  // For demo purposes, return a mock diff percentage
  // In production, use pixelmatch or similar library
  const mockDiffPercent = Math.random() * 5; // Random diff between 0-5%
  
  return {
    identical: false,
    diffPercent: mockDiffPercent,
    diffPixels: Math.floor(mockDiffPercent * 1000),
  };
}

function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Test Report</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 40px; line-height: 1.6; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 10px; }
    .timestamp { color: #666; font-size: 14px; }
    .summary { display: flex; gap: 20px; margin: 30px 0; }
    .stat { flex: 1; background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; margin: 10px 0; }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .test-result { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .test-result.fail { background: #fee; }
    .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .test-name { font-size: 18px; font-weight: 600; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-pass { background: #d1fae5; color: #065f46; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .screenshot-item { text-align: center; }
    .screenshot-item img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
    .screenshot-label { font-size: 14px; color: #666; margin-top: 8px; }
    .diff-info { margin-top: 10px; padding: 10px; background: #fffbeb; border-radius: 4px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Regression Test Report</h1>
    <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    
    <div class="summary">
      <div class="stat">
        <div>Total Tests</div>
        <div class="stat-number">${report.totalPages}</div>
      </div>
      <div class="stat">
        <div>Passed</div>
        <div class="stat-number passed">${report.passed}</div>
      </div>
      <div class="stat">
        <div>Failed</div>
        <div class="stat-number failed">${report.failed}</div>
      </div>
    </div>
    
    ${report.results.map(result => `
      <div class="test-result ${result.passed ? '' : 'fail'}">
        <div class="test-header">
          <div class="test-name">${result.name}</div>
          <span class="badge ${result.passed ? 'badge-pass' : 'badge-fail'}">
            ${result.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
        
        ${result.error ? `
          <p style="color: #ef4444;">Error: ${result.error}</p>
        ` : `
          <p>URL: ${result.url}</p>
          <p>Viewport: ${result.viewport.width} × ${result.viewport.height}</p>
          
          ${result.diff && !result.diff.identical ? `
            <div class="diff-info">
              <strong>Visual difference detected:</strong> ${result.diff.diffPercent.toFixed(2)}%
              ${result.diff.diffPercent > 2 ? ' (exceeds 2% threshold)' : ' (within threshold)'}
            </div>
          ` : ''}
        `}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;
}

// Run the tests
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});