module.exports = {
    ci: {
      collect: {
        url: [
          'http://localhost:3000/',
          'http://localhost:3000/api/hello',
        ],
        numberOfRuns: 3,
        startServerCommand: 'npm run build && npm run start',
        startServerReadyPattern: 'ready on',
        startServerReadyTimeout: 60000,
        settings: {
          preset: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
          },
          screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false,
          },
        },
      },
      assert: {
        preset: 'lighthouse:recommended',
        assertions: {
          'categories:performance': ['error', { minScore: 0.9 }],
          'categories:accessibility': ['error', { minScore: 0.9 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.9 }],
          'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
          'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
          'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
          'total-blocking-time': ['error', { maxNumericValue: 300 }],
          'max-potential-fid': ['error', { maxNumericValue: 200 }],
          'errors-in-console': ['error', { minScore: 0 }],
          'no-unload-listeners': 'error',
          'server-response-time': ['error', { maxNumericValue: 500 }],
          'interactive': ['error', { maxNumericValue: 5000 }],
          'uses-optimized-images': 'warn',
          'uses-rel-preconnect': 'warn',
          'uses-http2': 'warn',
        },
      },
      upload: {
        target: 'temporary-public-storage',
        githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
        githubStatusContextSuffix: '/lighthouse-ci',
      },
      server: {
        port: 9001,
        storage: {
          storageMethod: 'sql',
          sqlDatabasePath: './lighthouse-ci.db',
        },
      },
    },
  };