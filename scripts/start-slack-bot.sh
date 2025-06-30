#!/bin/bash
set -euo pipefail

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🤖 Starting Autonomous Development Slack Bot..."

# Check environment variables
if [[ -z "${SLACK_BOT_TOKEN:-}" ]]; then
    echo "❌ SLACK_BOT_TOKEN environment variable is required"
    echo "   Get it from: https://api.slack.com/apps -> Your App -> OAuth & Permissions"
    exit 1
fi

if [[ -z "${SLACK_SIGNING_SECRET:-}" ]]; then
    echo "❌ SLACK_SIGNING_SECRET environment variable is required"
    echo "   Get it from: https://api.slack.com/apps -> Your App -> Basic Information"
    exit 1
fi

if [[ -z "${SLACK_APP_TOKEN:-}" ]]; then
    echo "❌ SLACK_APP_TOKEN environment variable is required"
    echo "   Get it from: https://api.slack.com/apps -> Your App -> Basic Information -> App-Level Tokens"
    exit 1
fi

# Check if dependencies are installed
if [[ ! -d "$PROJECT_ROOT/slack-bot/node_modules" ]]; then
    echo "📦 Installing Slack bot dependencies..."
    cd "$PROJECT_ROOT/slack-bot"
    npm install
fi

# Check if Ollama is running (required for AutoGen)
if ! curl -s http://localhost:11434/api/version >/dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Starting it now..."
    echo "   If this fails, run: ollama serve"
    ollama serve &
    sleep 3
fi

# Check if phi3:mini model exists
if ! ollama list | grep -q "phi3:mini"; then
    echo "📥 Downloading phi3:mini model for AutoGen..."
    ollama pull phi3:mini
fi

# Start the bot
# Check which Slack bridge to use
if [[ "${RUN_SLACK_BRIDGE:-false}" == "true" ]]; then
    echo "🐍 Starting Python Slack bridge..."
    echo "🔔 Bridge will listen for @PM-agent mentions in #build-bot channels"
    echo "💻 AutoGen PM-agent integration only"
    echo ""
    echo "🔗 To stop: Ctrl+C"
    echo ""
    
    cd "$PROJECT_ROOT"
    python3 scripts/pm_slack_bridge.py
else
    echo "⚡️ Starting Node.js Slack bot..."
    echo "🔔 Bot will listen for @PM-agent mentions in #build-bot channels"
    echo "💻 Available slash commands:"
    echo "   • /devin-run --issue <number>"
    echo "   • /devin-run --spec"
    echo "   • /cost-check"
    echo ""
    echo "🔗 To stop: Ctrl+C"
    echo ""
    
    cd "$PROJECT_ROOT/slack-bot"
    npm start
fi