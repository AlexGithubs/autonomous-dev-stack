#!/bin/bash
set -euo pipefail

# Load environment
source ../.env

# Configuration
MAX_DAILY_BUDGET=${HELICONE_MAX_BUDGET_USD:-5}
LOG_DIR="../costs"
LOG_FILE="$LOG_DIR/usage.log"
ERROR_FILE="$LOG_DIR/errors.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Parse arguments
SUMMARY_ONLY=false
if [[ "${1:-}" == "--summary" ]]; then
    SUMMARY_ONLY=true
fi

# Function to log with timestamp
log() {
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $1" | tee -a "$LOG_FILE"
}

# Function to send Slack alert
send_slack_alert() {
    local message=$1
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Cost Alert: $message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# Initialize totals
TOTAL_TOKENS=0
TOTAL_COST=0
HELICONE_COST=0
BROWSERBASE_MINUTES=0
PERCY_SNAPSHOTS=0

echo "💰 Cost Monitoring Report"
echo "========================"
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

# Check Helicone usage
if [[ -n "${HELICONE_API_KEY:-}" ]]; then
    echo -e "\n📊 Helicone Usage:"
    
    HELICONE_RESPONSE=$(curl -s -H "Authorization: Bearer $HELICONE_API_KEY" \
        "https://api.helicone.ai/v1/usage/daily" 2>/dev/null || echo "{}")
    
    if [[ -n "$HELICONE_RESPONSE" ]] && [[ "$HELICONE_RESPONSE" != "{}" ]]; then
        HELICONE_COST=$(echo "$HELICONE_RESPONSE" | jq -r '.cost // 0')
        HELICONE_TOKENS=$(echo "$HELICONE_RESPONSE" | jq -r '.total_tokens // 0')
        
        echo "  - Daily tokens: $HELICONE_TOKENS"
        echo "  - Daily cost: \$$HELICONE_COST"
        
        TOTAL_TOKENS=$((TOTAL_TOKENS + HELICONE_TOKENS))
        TOTAL_COST=$(echo "$TOTAL_COST + $HELICONE_COST" | bc)
        
        # Check budget
        if (( $(echo "$HELICONE_COST > $MAX_DAILY_BUDGET" | bc -l) )); then
            log "ERROR: Helicone daily budget exceeded! Cost: \$$HELICONE_COST, Budget: \$$MAX_DAILY_BUDGET"
            echo "BUDGET_EXCEEDED=true" >> ../.env
            send_slack_alert "Helicone daily budget exceeded! Cost: \$$HELICONE_COST"
            
            # Auto-halt if configured
            if [[ "${AUTO_HALT_ON_BUDGET:-true}" == "true" ]]; then
                log "Auto-halting pipeline due to budget exceeded"
                ../scripts/kill_pipeline.sh
            fi
        fi
    else
        echo "  - Unable to fetch Helicone data"
        echo "[$(date)] ERROR: Failed to fetch Helicone data" >> "$ERROR_FILE"
    fi
else
    echo -e "\n⚠️  Helicone API key not configured"
fi

# Check Browserbase usage
if [[ -n "${BROWSERBASE_API_KEY:-}" ]]; then
    echo -e "\n🌐 Browserbase Usage:"
    
    BROWSERBASE_RESPONSE=$(curl -s -H "Authorization: Bearer $BROWSERBASE_API_KEY" \
        "https://api.browserbase.com/v1/usage" 2>/dev/null || echo "{}")
    
    if [[ -n "$BROWSERBASE_RESPONSE" ]] && [[ "$BROWSERBASE_RESPONSE" != "{}" ]]; then
        BROWSERBASE_MINUTES=$(echo "$BROWSERBASE_RESPONSE" | jq -r '.minutes_used // 0')
        BROWSERBASE_COST=$(echo "$BROWSERBASE_MINUTES * 0.015" | bc) # $0.015 per minute
        
        echo "  - Minutes used: $BROWSERBASE_MINUTES"
        echo "  - Estimated cost: \$$BROWSERBASE_COST"
        
        TOTAL_COST=$(echo "$TOTAL_COST + $BROWSERBASE_COST" | bc)
    else
        echo "  - Unable to fetch Browserbase data"
    fi
else
    echo -e "\n⚠️  Browserbase API key not configured"
fi

# Check Percy usage
if [[ -n "${PERCY_TOKEN:-}" ]]; then
    echo -e "\n📸 Percy Usage:"
    
    # Percy doesn't have a direct API for usage, estimate from logs
    if [[ -f "../logs/percy.log" ]]; then
        PERCY_SNAPSHOTS=$(grep -c "snapshot taken" "../logs/percy.log" 2>/dev/null || echo "0")
        PERCY_COST=$(echo "$PERCY_SNAPSHOTS * 0.01" | bc) # Estimate $0.01 per snapshot
        
        echo "  - Snapshots today: $PERCY_SNAPSHOTS"
        echo "  - Estimated cost: \$$PERCY_COST"
        
        TOTAL_COST=$(echo "$TOTAL_COST + $PERCY_COST" | bc)
    else
        echo "  - No Percy logs found"
    fi
else
    echo -e "\n⚠️  Percy token not configured"
fi

# Local Ollama usage (no cost but track for metrics)
if command -v ollama &> /dev/null; then
    echo -e "\n🤖 Local Ollama Usage:"
    OLLAMA_LOGS=$(ollama list 2>/dev/null || echo "")
    if [[ -n "$OLLAMA_LOGS" ]]; then
        echo "  - Models loaded: $(echo "$OLLAMA_LOGS" | wc -l)"
        echo "  - Cost: \$0.00 (local)"
    fi
fi

# Summary
echo -e "\n📊 Total Daily Summary:"
echo "  - Total API tokens: $TOTAL_TOKENS"
echo "  - Total estimated cost: \$$TOTAL_COST"
echo "  - Budget remaining: \$$(echo "$MAX_DAILY_BUDGET - $TOTAL_COST" | bc)"

# Log summary
log "Daily summary - Tokens: $TOTAL_TOKENS, Cost: \$$TOTAL_COST, Budget: \$$MAX_DAILY_BUDGET"

# Write JSON report
if [[ "$SUMMARY_ONLY" != "true" ]]; then
    cat > "$LOG_DIR/daily_report_$(date +%Y%m%d).json" << EOF
{
  "date": "$(date -u +"%Y-%m-%d")",
  "timestamp": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
  "usage": {
    "helicone": {
      "tokens": $HELICONE_TOKENS,
      "cost": $HELICONE_COST
    },
    "browserbase": {
      "minutes": $BROWSERBASE_MINUTES,
      "cost": $BROWSERBASE_COST
    },
    "percy": {
      "snapshots": $PERCY_SNAPSHOTS,
      "cost": $PERCY_COST
    }
  },
  "totals": {
    "tokens": $TOTAL_TOKENS,
    "cost": $TOTAL_COST,
    "budget": $MAX_DAILY_BUDGET,
    "remaining": $(echo "$MAX_DAILY_BUDGET - $TOTAL_COST" | bc)
  }
}
EOF
fi

# Check if we're approaching budget
BUDGET_WARNING_THRESHOLD=$(echo "$MAX_DAILY_BUDGET * 0.8" | bc)
if (( $(echo "$TOTAL_COST > $BUDGET_WARNING_THRESHOLD" | bc -l) )); then
    echo -e "\n⚠️  WARNING: Approaching daily budget limit!"
    send_slack_alert "Approaching budget limit: \$$TOTAL_COST of \$$MAX_DAILY_BUDGET used"
fi

# Exit with error if budget exceeded
if [[ "${BUDGET_EXCEEDED:-false}" == "true" ]]; then
    exit 1
fi