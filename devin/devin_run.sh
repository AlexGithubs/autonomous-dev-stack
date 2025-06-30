#!/bin/bash
set -euo pipefail

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
else
    echo "⚠️  No .env file found, using defaults"
    HALT_PIPELINE=${HALT_PIPELINE:-false}
    USE_CLAUDE=${USE_CLAUDE:-false}
fi

# Check kill switch
if [[ "${HALT_PIPELINE}" == "true" ]]; then
    echo "❌ Pipeline halted via kill switch. Exiting."
    exit 1
fi

# Parse arguments
ISSUE_ID=""
SPEC_TEXT=""
BRANCH_NAME=""
OPEN_BROWSER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --issue)
            ISSUE_ID="$2"
            shift 2
            ;;
        --spec)
            SPEC_TEXT="$2"
            shift 2
            ;;
        --branch)
            BRANCH_NAME="$2"
            shift 2
            ;;
        --open)
            OPEN_BROWSER=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Determine spec source
if [[ -n "$ISSUE_ID" ]]; then
    echo "📋 Fetching issue #$ISSUE_ID from GitHub..."
    SPEC_TEXT=$(gh issue view "$ISSUE_ID" --json body -q .body)
elif [[ -z "$SPEC_TEXT" ]]; then
    if [[ -f "$PROJECT_ROOT/spec.md" ]]; then
        echo "📄 Using spec.md file..."
        SPEC_TEXT=$(cat "$PROJECT_ROOT/spec.md")
    elif [[ -f "$PROJECT_ROOT/specs/default.md" ]]; then
        echo "📄 Using default spec..."
        SPEC_TEXT=$(cat "$PROJECT_ROOT/specs/default.md")
    fi
fi

if [[ -z "$SPEC_TEXT" ]]; then
    echo "❌ No spec provided. Use --issue ID or --spec 'text'"
    exit 1
fi

# Set branch name
if [[ -z "$BRANCH_NAME" ]]; then
    BRANCH_NAME="devin/feat-$(date +%s)"
fi

# Prepare LLM prompt
PROMPT=$(cat <<EOF
You are a code generator. Generate a Next.js + TypeScript + Tailwind application based on this spec:

$SPEC_TEXT

CRITICAL: You must respond with ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "pages/index.tsx",
      "content": "import React from 'react';\n\nexport default function Home() {\n  return (\n    <div className=\"min-h-screen bg-gray-100\">\n      <h1 className=\"text-4xl font-bold text-center pt-20\">Task Manager</h1>\n    </div>\n  );\n}"
    },
    {
      "path": "pages/api/tasks.ts",
      "content": "import type { NextApiRequest, NextApiResponse } from 'next';\n\nexport default function handler(req: NextApiRequest, res: NextApiResponse) {\n  res.status(200).json({ message: 'Tasks API' });\n}"
    }
  ]
}

Requirements:
- Create pages/index.tsx with responsive design using Tailwind
- Create pages/api/tasks.ts with RESTful endpoints
- Use proper TypeScript types
- Ensure all code compiles
- No explanations, only JSON
EOF
)

# Call LLM with fallback logic
echo "🤖 Generating code scaffold..."
RESPONSE=""
LLM_SUCCESS=false

# Function to try Claude API
try_claude() {
    echo "🔮 Trying Claude API..."
    if [[ -z "${CLAUDE_API_KEY:-}" ]]; then
        echo "❌ No CLAUDE_API_KEY found for Claude"
        return 1
    fi
    
    local claude_response
    claude_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        https://api.anthropic.com/v1/messages \
        -H "x-api-key: $CLAUDE_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        -d "{
            \"model\": \"claude-3-5-sonnet-20241022\",
            \"max_tokens\": 8192,
            \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}]
        }")
    
    local http_code=$(echo "$claude_response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    local response_body=$(echo "$claude_response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [[ "$http_code" -eq 200 ]]; then
        RESPONSE=$(echo "$response_body" | jq -r '.content[0].text' 2>/dev/null)
        if [[ -n "$RESPONSE" && "$RESPONSE" != "null" ]]; then
            echo "✅ Claude API successful"
            return 0
        fi
    fi
    
    echo "❌ Claude API failed (HTTP: $http_code)"
    return 1
}

# Function to try Ollama
try_ollama() {
    echo "🦙 Trying Ollama (phi3:mini)..."
    
    # Check if Ollama service is running
    if ! curl -s http://localhost:11434/api/version >/dev/null 2>&1; then
        echo "❌ Ollama service not running"
        return 1
    fi
    
    # Check if phi3:mini model exists
    if ! ollama list | grep -q "phi3:mini"; then
        echo "❌ phi3:mini model not found"
        return 1
    fi
    
    local ollama_response
    ollama_response=$(curl -s -m 60 http://localhost:11434/api/generate \
        -d "{
            \"model\": \"phi3:mini\",
            \"prompt\": \"$PROMPT\",
            \"stream\": false
        }")
    
    if [[ $? -eq 0 ]] && [[ -n "$ollama_response" ]]; then
        RESPONSE=$(echo "$ollama_response" | jq -r '.response' 2>/dev/null)
        if [[ -n "$RESPONSE" && "$RESPONSE" != "null" ]]; then
            echo "✅ Ollama successful"
            return 0
        fi
    fi
    
    echo "❌ Ollama failed or timed out"
    return 1
}

# Function to create pull request
create_pull_request() {
    echo "🔄 Creating pull request..."
    
    # Check if gh CLI is available
    if ! command -v gh &> /dev/null; then
        echo "❌ GitHub CLI (gh) not found. Install it first: https://cli.github.com/"
        return 1
    fi
    
    # Prepare PR title and body
    local pr_title
    local pr_body
    
    if [[ -n "$ISSUE_ID" ]]; then
        # Get issue details for PR
        local issue_title=$(gh issue view "$ISSUE_ID" --json title -q .title 2>/dev/null || echo "Issue #$ISSUE_ID")
        pr_title="feat: $issue_title"
        
        pr_body=$(cat <<EOF
## Summary
- Implements initial scaffold for issue #$ISSUE_ID
- Generated Next.js + TypeScript + Tailwind application
- Includes basic functionality as specified

## Generated Files
- \`pages/index.tsx\` - Main application interface with responsive design
- \`pages/api/tasks.ts\` - RESTful API endpoints with proper TypeScript types

## Test Plan
- [ ] Run \`npm run dev\` and verify application loads at http://localhost:3000
- [ ] Test functionality matches specification requirements
- [ ] Run \`npm run test\` to ensure all tests pass
- [ ] Run \`npm run type-check\` to verify TypeScript compilation
- [ ] Run \`npm run lint\` to ensure code quality standards

## Technical Details
- **Framework**: Next.js 14+ with TypeScript 5.3+
- **Styling**: Tailwind CSS with responsive design
- **Generated by**: Devin autonomous agent
- **Branch**: $BRANCH_NAME
- **Spec source**: Issue #$ISSUE_ID

Closes #$ISSUE_ID

🤖 Generated with Devin autonomous development stack
EOF
)
    else
        pr_title="feat: initial scaffold from spec"
        pr_body=$(cat <<EOF
## Summary
- Generated Next.js + TypeScript + Tailwind application from specification
- Includes basic functionality and responsive design
- Ready for development and testing

## Generated Files
- \`pages/index.tsx\` - Main application interface
- \`pages/api/tasks.ts\` - API endpoints with TypeScript

## Test Plan
- [ ] Run \`npm run dev\` and verify application loads
- [ ] Test core functionality
- [ ] Run full test suite (\`npm test\`)
- [ ] Verify TypeScript compilation (\`npm run type-check\`)
- [ ] Check code quality (\`npm run lint\`)

## Technical Details
- **Framework**: Next.js 14+ with TypeScript 5.3+
- **Styling**: Tailwind CSS
- **Generated by**: Devin autonomous agent
- **Branch**: $BRANCH_NAME

🤖 Generated with Devin autonomous development stack
EOF
)
    fi
    
    # Create the pull request
    local pr_url
    pr_url=$(gh pr create \
        --title "$pr_title" \
        --body "$pr_body" \
        --draft \
        --head "$BRANCH_NAME" \
        --base "main" 2>/dev/null || gh pr create \
        --title "$pr_title" \
        --body "$pr_body" \
        --draft \
        --head "$BRANCH_NAME")
    
    if [[ $? -eq 0 && -n "$pr_url" ]]; then
        echo "✅ Pull request created: $pr_url"
        
        # Add labels if issue exists
        if [[ -n "$ISSUE_ID" ]]; then
            gh pr edit "$pr_url" --add-label "generated" --add-label "feature" 2>/dev/null || true
        fi
        
        # Update issue with PR link if issue exists
        if [[ -n "$ISSUE_ID" ]]; then
            gh issue comment "$ISSUE_ID" --body "🤖 **Devin Update**: Pull request created - $pr_url

**Next Steps:**
1. Review the generated code in the PR
2. Test locally: \`git checkout $BRANCH_NAME && npm run dev\`
3. Run tests: \`npm test\`
4. Approve and merge when ready

Generated with Devin autonomous development stack" 2>/dev/null || echo "⚠️  Could not comment on issue"
        fi
        
        echo "📋 PR Summary:"
        echo "  • Title: $pr_title"
        echo "  • Branch: $BRANCH_NAME"
        echo "  • Status: Draft (ready for review)"
        echo "  • URL: $pr_url"
        
        # Open browser if requested
        if [[ "$OPEN_BROWSER" == "true" ]]; then
            echo "🌐 Opening pull request in browser..."
            if command -v open &> /dev/null; then
                open "$pr_url"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "$pr_url"
            else
                echo "⚠️  Could not open browser automatically. Visit: $pr_url"
            fi
        fi
        
        return 0
    else
        echo "❌ Failed to create pull request"
        return 1
    fi
}

# Try LLMs based on preference with fallback
if [[ "${USE_CLAUDE:-false}" == "true" ]]; then
    # Prefer Claude, fallback to Ollama
    if try_claude; then
        LLM_SUCCESS=true
    elif try_ollama; then
        LLM_SUCCESS=true
        echo "ℹ️  Fell back to Ollama after Claude failure"
    fi
else
    # Prefer Ollama, fallback to Claude
    if try_ollama; then
        LLM_SUCCESS=true
    elif try_claude; then
        LLM_SUCCESS=true
        echo "ℹ️  Fell back to Claude after Ollama failure"
    fi
fi

# If both LLMs failed, RESPONSE will be empty and validation will trigger manual fallback
if [[ "$LLM_SUCCESS" == "false" ]]; then
    echo "❌ Both Claude and Ollama failed"
    RESPONSE=""
fi

# Validate JSON response
echo "🔍 Validating JSON response..."
if ! echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    echo "❌ LLM response is not valid JSON. Trying to extract JSON..."
    # Try to extract JSON from response using regex
    JSON_EXTRACT=$(echo "$RESPONSE" | grep -o '{.*}' | head -1)
    if [[ -n "$JSON_EXTRACT" ]] && echo "$JSON_EXTRACT" | jq . >/dev/null 2>&1; then
        RESPONSE="$JSON_EXTRACT"
        echo "✅ Extracted valid JSON"
    else
        echo "❌ Could not extract valid JSON. Using fallback..."
        # Fallback: create basic files manually
        mkdir -p pages/api
        cat > pages/index.tsx << 'EOL'
import React, { useState } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Task Manager</h1>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mr-3"
                />
                <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-800'}>
                  {task.title}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No tasks yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}
EOL

        cat > pages/api/tasks.ts << 'EOL'
import type { NextApiRequest, NextApiResponse } from 'next';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// In-memory storage (replace with database in production)
let tasks: Task[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      res.status(200).json({ tasks });
      break;
      
    case 'POST':
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const newTask: Task = {
        id: Date.now(),
        title,
        completed: false
      };
      
      tasks.push(newTask);
      res.status(201).json({ task: newTask });
      break;
      
    case 'PUT':
      const { id, completed } = req.body;
      const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
      
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      tasks[taskIndex].completed = completed;
      res.status(200).json({ task: tasks[taskIndex] });
      break;
      
    case 'DELETE':
      const deleteId = parseInt(req.query.id as string);
      tasks = tasks.filter(t => t.id !== deleteId);
      res.status(200).json({ message: 'Task deleted' });
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
EOL
        echo "✅ Created fallback files manually"
        return 0
    fi
fi

# Parse and write files from JSON
echo "📝 Writing scaffold files..."
cd "$PROJECT_ROOT"  # Go to project root

# Create directories
mkdir -p pages/api

# Extract and write files
echo "$RESPONSE" | jq -r '.files[] | @base64 "\(.path):\(.content)"' | while IFS=':' read -r path_b64 content_b64; do
    file_path=$(echo "$path_b64" | base64 -d)
    file_content=$(echo "$content_b64" | base64 -d)
    
    echo "Writing $file_path..."
    mkdir -p "$(dirname "$file_path")"
    echo "$file_content" > "$file_path"
done

# Git operations
echo "🌿 Creating branch $BRANCH_NAME..."
git checkout -b "$BRANCH_NAME"
git add pages/
git commit -m "feat: scaffold application from spec

Generated by Devin autonomous agent
Spec source: ${ISSUE_ID:-inline}
Branch: $BRANCH_NAME
"

# Push if remote exists
if git remote get-url origin &>/dev/null; then
    git push -u origin "$BRANCH_NAME"
    echo "✅ Pushed to $BRANCH_NAME"
    
    # Create Pull Request automatically
    create_pull_request
else
    echo "⚠️  No remote configured, skipping push and PR creation"
fi

echo "🎉 Scaffold complete! Branch: $BRANCH_NAME"
echo "📂 Files created:"
echo "  - pages/index.tsx (main app)"
echo "  - pages/api/tasks.ts (API endpoints)"
echo ""
echo "🚀 To test:"
echo "  npm run dev"
echo "  Open http://localhost:3000"