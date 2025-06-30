#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Get project root
const PROJECT_ROOT = path.dirname(__dirname);

// Load environment variables
let env = {};
try {
  if (fs.existsSync(path.join(PROJECT_ROOT, '.env.local'))) {
    const envContent = fs.readFileSync(path.join(PROJECT_ROOT, '.env.local'), 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key] = valueParts.join('=');
      }
    });
  } else if (fs.existsSync(path.join(PROJECT_ROOT, '.env'))) {
    const envContent = fs.readFileSync(path.join(PROJECT_ROOT, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key] = valueParts.join('=');
      }
    });
  }
} catch (error) {
  console.log('⚠️  Could not load environment file, using defaults');
}

// Configuration from environment
const USE_CLAUDE = env.USE_CLAUDE === 'true';
const CLAUDE_API_KEY = env.CLAUDE_API_KEY;
const OLLAMA_HOST = env.OLLAMA_HOST || 'http://localhost:11434';
const HELICONE_API_KEY = env.HELICONE_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
let inputText = '';
let inputFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) {
    inputText = args[i + 1];
    i++;
  } else if (args[i] === '--file' && args[i + 1]) {
    inputFile = args[i + 1];
    i++;
  }
}

// Read input from file if provided
if (inputFile) {
  try {
    inputText = fs.readFileSync(inputFile, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

if (!inputText) {
  console.error('Usage: node generate-spec-v2.js --input "requirements" OR --file requirements.txt');
  process.exit(1);
}

// Utility function for HTTP requests with timeout
function makeRequest(url, options, postData, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Function to try Ollama API
async function tryOllama(prompt) {
  console.log('🦙 Trying Ollama (phi3:mini)...');
  
  try {
    // Check if Ollama is running
    const versionCheck = await makeRequest(`${OLLAMA_HOST}/api/version`, { method: 'GET' }, null, 5000);
    if (versionCheck.statusCode !== 200) {
      throw new Error('Ollama service not responding');
    }

    // Check if phi3:mini model exists
    const modelsCheck = await makeRequest(`${OLLAMA_HOST}/api/tags`, { method: 'GET' }, null, 5000);
    const models = JSON.parse(modelsCheck.body);
    const hasModel = models.models?.some(model => model.name.includes('phi3:mini'));
    
    if (!hasModel) {
      throw new Error('phi3:mini model not found');
    }

    // Make the generation request
    const requestData = JSON.stringify({
      model: 'phi3:mini',
      prompt: prompt,
      stream: false
    });

    const response = await makeRequest(
      `${OLLAMA_HOST}/api/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        }
      },
      requestData,
      60000
    );

    if (response.statusCode === 200) {
      const result = JSON.parse(response.body);
      if (result.response && result.response.trim()) {
        console.log('✅ Ollama successful');
        return result.response;
      }
    }
    
    throw new Error(`Ollama API returned status ${response.statusCode}`);
    
  } catch (error) {
    console.log(`❌ Ollama failed: ${error.message}`);
    return null;
  }
}

// Function to try Claude API
async function tryClaude(prompt) {
  console.log('🔮 Trying Claude API...');
  
  if (!CLAUDE_API_KEY) {
    console.log('❌ No CLAUDE_API_KEY found for Claude');
    return null;
  }

  try {
    const requestData = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const headers = {
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    };

    // Add Helicone headers if configured
    if (HELICONE_API_KEY) {
      headers['Helicone-Auth'] = `Bearer ${HELICONE_API_KEY}`;
      headers['Helicone-Cache-Enabled'] = 'true';
    }

    const response = await makeRequest(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: headers
      },
      requestData,
      60000
    );

    if (response.statusCode === 200) {
      const result = JSON.parse(response.body);
      if (result.content?.[0]?.text) {
        console.log('✅ Claude API successful');
        return result.content[0].text;
      }
    }

    throw new Error(`Claude API returned status ${response.statusCode}`);

  } catch (error) {
    console.log(`❌ Claude API failed: ${error.message}`);
    return null;
  }
}

// Function to create manual template
function createManualTemplate(requirements) {
  console.log('📝 Creating manual template fallback...');
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `# Product Specification
_Generated on: ${timestamp}_

## Project Overview
${requirements}

## Core Features
- Responsive web application
- Modern user interface
- Mobile-friendly design
- Accessibility compliance

## Technical Requirements
- **Framework**: Next.js 14+ with TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+ with responsive design system
- **Components**: React components with TypeScript interfaces
- **API**: RESTful API endpoints with proper error handling
- **Testing**: Comprehensive test coverage (unit + e2e)
- **Deployment**: Vercel or similar platform

## Acceptance Criteria
- [ ] Application loads without errors
- [ ] Responsive design works on mobile and desktop
- [ ] All interactive elements are accessible
- [ ] Core functionality works as specified
- [ ] No console errors in browser
- [ ] Passes TypeScript compilation
- [ ] Passes all tests (unit and e2e)
- [ ] Meets performance benchmarks

## Implementation Notes
- Use existing project structure and conventions
- Follow established code patterns
- Ensure proper error handling
- Include loading states for async operations
- Add proper TypeScript types
- Include comprehensive test coverage

## Timeline Estimate
- Development: 2-4 hours
- Testing: 1-2 hours  
- Deployment: 30 minutes
- **Total**: 3.5-6.5 hours
`;
}

// Main generation function
async function generateSpec() {
  console.log('🤖 Generating specification using robust AutoGen...');
  
  // Create the prompt for spec generation
  const prompt = `You are a senior product manager and technical architect. Convert this job description into a detailed technical specification.

Job Description:
${inputText}

Please create a comprehensive product specification in markdown format with these sections:

# Product Specification

## Project Overview
Brief description of what we're building and why.

## Core Features  
List of main features and functionality (3-6 bullet points).

## Technical Requirements
Specific technical implementation details:
- Framework: Next.js 14+ with TypeScript 5.3+
- Styling: Tailwind CSS 3.4+ with responsive design
- Components: React components with TypeScript interfaces
- API: RESTful endpoints with proper error handling
- Testing: Jest unit tests + Playwright e2e tests

## Acceptance Criteria
Specific, testable criteria for completion (checkboxes format).

## Implementation Notes
Technical considerations, edge cases, and implementation details.

## Timeline Estimate
Realistic time estimate for development, testing, and deployment.

Focus on being specific, actionable, and technically detailed. Include modern web development best practices.`;

  let specContent = null;
  let llmUsed = 'none';

  // Try LLMs based on USE_CLAUDE preference
  if (USE_CLAUDE) {
    // Prefer Claude, fallback to Ollama
    specContent = await tryClaude(prompt);
    if (specContent) {
      llmUsed = 'claude';
    } else {
      specContent = await tryOllama(prompt);
      if (specContent) {
        llmUsed = 'ollama';
        console.log('ℹ️  Fell back to Ollama after Claude failure');
      }
    }
  } else {
    // Prefer Ollama, fallback to Claude
    specContent = await tryOllama(prompt);
    if (specContent) {
      llmUsed = 'ollama';
    } else {
      specContent = await tryClaude(prompt);
      if (specContent) {
        llmUsed = 'claude';
        console.log('ℹ️  Fell back to Claude after Ollama failure');
      }
    }
  }

  // Final fallback to manual template
  if (!specContent) {
    console.log('ℹ️  Both LLMs failed, using manual template');
    specContent = createManualTemplate(inputText);
    llmUsed = 'manual';
  }

  // Write the specification file
  const specPath = path.join(PROJECT_ROOT, 'spec.md');
  try {
    fs.writeFileSync(specPath, specContent);
    console.log('✅ Specification generated successfully!');
    console.log(`📄 Output: spec.md (using ${llmUsed})`);
  } catch (error) {
    console.error(`❌ Failed to write spec.md: ${error.message}`);
    process.exit(1);
  }

  // Log usage for cost tracking
  try {
    const logsDir = path.join(PROJECT_ROOT, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const usageLog = {
      timestamp: new Date().toISOString(),
      llm_used: llmUsed,
      input_length: inputText.length,
      output_length: specContent.length,
      estimated_tokens: Math.ceil((inputText.length + specContent.length) / 4),
      success: true
    };

    const logPath = path.join(logsDir, 'autogen_usage.json');
    fs.appendFileSync(logPath, JSON.stringify(usageLog) + '\n');
  } catch (error) {
    console.log('⚠️  Could not write usage log:', error.message);
  }

  console.log(`
📊 Generation Summary:
  • Method: ${llmUsed}
  • Input: ${inputText.length} characters
  • Output: ${specContent.length} characters
  • Estimated tokens: ${Math.ceil((inputText.length + specContent.length) / 4)}
`);
}

// Run the spec generation
generateSpec().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});