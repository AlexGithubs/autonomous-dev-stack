#!/bin/bash
set -euo pipefail

echo "🛑 EMERGENCY PIPELINE KILL SWITCH"
echo "================================="

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    local file="../.env"
    
    if grep -q "^$key=" "$file"; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^$key=.*/$key=$value/" "$file"
        else
            sed -i "s/^$key=.*/$key=$value/" "$file"
        fi
    else
        # Add new key
        echo "$key=$value" >> "$file"
    fi
}

# Get current timestamp
KILL_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Set halt flag
echo "⚠️  Setting HALT_PIPELINE=true..."
update_env "HALT_PIPELINE" "true"
update_env "HALT_REASON" "\"Manual kill switch activated at $KILL_TIME\""

# Kill any running processes
echo "🔪 Killing running processes..."

# Kill Node processes
if pgrep -f "node|npm|npx" > /dev/null; then
    echo "  - Stopping Node.js processes..."
    pkill -f "node|npm|npx" || true
fi

# Kill Playwright processes
if pgrep -f "playwright" > /dev/null; then
    echo "  - Stopping Playwright..."
    pkill -f "playwright" || true
fi

# Kill Docker containers
if docker ps -q --filter "label=autonomous-dev" | grep -q .; then
    echo "  - Stopping Docker containers..."
    docker stop $(docker ps -q --filter "label=autonomous-dev") || true
fi

# Kill Ollama if running
if pgrep -f "ollama" > /dev/null; then
    echo "  - Stopping Ollama..."
    pkill -f "ollama serve" || true
fi

# Cancel GitHub Actions workflows if gh is available
if command -v gh &> /dev/null && [[ -d ../.git ]]; then
    echo "📋 Checking GitHub Actions..."
    if gh auth status &>/dev/null; then
        # Get running workflows
        RUNNING_WORKFLOWS=$(gh run list --status in_progress --json databaseId --jq '.[].databaseId' 2>/dev/null || echo "")
        
        if [[ -n "$RUNNING_WORKFLOWS" ]]; then
            echo "  - Cancelling running workflows..."
            for workflow_id in $RUNNING_WORKFLOWS; do
                gh run cancel "$workflow_id" || true
            done
        fi
    else
        echo "  - GitHub CLI not authenticated, skipping workflow cancellation"
    fi
fi

# Log the kill event
LOG_FILE="../logs/kill_switch.log"
mkdir -p ../logs
echo "[$KILL_TIME] Pipeline killed via manual switch" >> "$LOG_FILE"

# Check current costs if monitor script exists
if [[ -f "./monitor_costs.sh" ]]; then
    echo -e "\n💰 Current cost status:"
    ./monitor_costs.sh --summary || true
fi

# Create recovery instructions
cat > ../RECOVERY_INSTRUCTIONS.md << EOF
# Pipeline Recovery Instructions

The pipeline was halted at: $KILL_TIME

## To restart the pipeline:

1. Review why the pipeline was stopped:
   \`\`\`bash
   cat logs/kill_switch.log
   \`\`\`

2. Check current costs:
   \`\`\`bash
   ./scripts/monitor_costs.sh --summary
   \`\`\`

3. Re-enable the pipeline:
   \`\`\`bash
   sed -i '' 's/HALT_PIPELINE=true/HALT_PIPELINE=false/' .env
   \`\`\`

4. Restart services:
   \`\`\`bash
   npm run dev
   \`\`\`

## Emergency Contacts
- Team Lead: Check .env for EMERGENCY_CONTACT
- Monitoring: Check costs/errors.log for issues
EOF

echo -e "\n✅ Pipeline successfully halted!"
echo "📄 Recovery instructions written to RECOVERY_INSTRUCTIONS.md"
echo -e "\n🔄 To restart the pipeline:"
echo "   sed -i '' 's/HALT_PIPELINE=true/HALT_PIPELINE=false/' ../.env"
echo -e "\n⚠️  All automated processes have been stopped."