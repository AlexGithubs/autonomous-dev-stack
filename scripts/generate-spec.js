#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

if (!inputText) {
  console.error('Usage: npm run spec:generate -- --input "job description" OR --file requirements.txt');
  process.exit(1);
}

// Check if Ollama is running
const checkOllama = spawn('ollama', ['list']);

checkOllama.on('error', () => {
  console.error('❌ Ollama is not installed or not running');
  console.log('Please run: ollama serve');
  process.exit(1);
});

checkOllama.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Ollama is not running');
    console.log('Please run: ollama serve');
    process.exit(1);
  }
  
  generateSpec();
});

async function generateSpec() {
  console.log('🤖 Generating specification using AutoGen agents...');
  
  // Create temp file with job description
  const tempFile = path.join(__dirname, '../.tmp-job-desc.txt');
  fs.writeFileSync(tempFile, inputText);
  
  // Python script to run AutoGen
  const pythonScript = `
import os
import json
import requests
from datetime import datetime

# Read job description
with open('${tempFile}', 'r') as f:
    job_desc = f.read()

# AutoGen agent prompts
pm_prompt = """You are a senior product manager who converts job descriptions into structured specifications.
Extract key features, requirements, and acceptance criteria.
Output in markdown format with clear sections:
- Project Overview
- Core Features  
- Technical Requirements
- Acceptance Criteria
- Timeline Estimate"""

scribe_prompt = """You refine product specifications into engineering-ready documents.
Add technical implementation details, data models, and API contracts.
Ensure all acceptance criteria are testable.
Include edge cases and error handling requirements."""

# Call Ollama API
def call_ollama(prompt, context=""):
    response = requests.post('http://localhost:11434/api/generate', 
        json={
            'model': 'phi3:mini',
            'prompt': f"{context}\\n\\n{prompt}",
            'stream': False
        })
    return response.json()['response']

# PM Agent
print("📋 PM Agent processing...")
pm_response = call_ollama(f"{pm_prompt}\\n\\nJob Description:\\n{job_desc}")

# Scribe Agent  
print("✍️  Scribe Agent refining...")
scribe_response = call_ollama(f"{scribe_prompt}\\n\\nInitial Spec:\\n{pm_response}", pm_response)

# Write final spec
with open('../spec.md', 'w') as f:
    f.write(f"# Product Specification\\n")
    f.write(f"_Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_\\n\\n")
    f.write(scribe_response)

# Log usage
usage_log = {
    'timestamp': datetime.now().isoformat(),
    'agents': ['pm_agent', 'scribe_agent'],
    'tokens_estimate': len(job_desc.split()) + len(pm_response.split()) + len(scribe_response.split())
}

os.makedirs('../logs', exist_ok=True)
with open('../logs/autogen_usage.json', 'a') as f:
    json.dump(usage_log, f)
    f.write('\\n')

print("✅ Specification generated successfully!")
print(f"📄 Output: spec.md")
`;

  // Write Python script
  const pyFile = path.join(__dirname, '../.tmp-autogen.py');
  fs.writeFileSync(pyFile, pythonScript);
  
  // Execute Python script
  const python = spawn('python3', [pyFile]);
  
  python.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  python.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });
  
  python.on('close', (code) => {
    // Cleanup temp files
    try {
      fs.unlinkSync(tempFile);
      fs.unlinkSync(pyFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    if (code !== 0) {
      console.error('❌ Failed to generate specification');
      process.exit(1);
    }
  });
}