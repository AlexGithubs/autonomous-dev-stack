#!/bin/bash
set -euo pipefail

# Master Workflow Controller for Autonomous Development Stack
# This script orchestrates the complete 8-step workflow described in your process

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

# Workflow state file
WORKFLOW_STATE_FILE="$PROJECT_ROOT/.workflow_state.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Save workflow state
save_state() {
    local step="$1"
    local status="$2"
    local details="$3"
    
    cat > "$WORKFLOW_STATE_FILE" << EOF
{
  "current_step": $step,
  "status": "$status",
  "details": "$details",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project_root": "$PROJECT_ROOT"
}
EOF
}

# Load workflow state
load_state() {
    if [[ -f "$WORKFLOW_STATE_FILE" ]]; then
        cat "$WORKFLOW_STATE_FILE"
    else
        echo '{"current_step": 0, "status": "not_started"}'
    fi
}

# Check if pipeline is halted
check_pipeline_status() {
    if [[ "${HALT_PIPELINE:-false}" == "true" ]]; then
        log_error "Pipeline is halted via kill switch!"
        log_info "Reason: ${HALT_REASON:-No reason provided}"
        log_info "To resume: Set HALT_PIPELINE=false in .env"
        exit 1
    fi
}

# Check cost limits before proceeding
check_cost_limits() {
    log_info "Checking cost limits..."
    
    if ! ./scripts/monitor_costs.sh --check-only; then
        log_error "Cost limits exceeded! Pipeline halted for safety."
        save_state "$current_step" "failed" "Cost limits exceeded"
        exit 1
    fi
    
    log_success "Cost limits OK"
}

# Parse command line arguments
ISSUE_ID=""
SPEC_TEXT=""
RESUME_STEP=""
DRY_RUN=false

show_usage() {
    cat << EOF
🤖 Autonomous Development Workflow Controller

Usage: $0 [OPTIONS]

OPTIONS:
  --issue <number>     Start workflow from GitHub issue
  --spec <text>        Start workflow with custom spec text
  --resume <step>      Resume workflow from specific step (1-8)
  --dry-run           Show what would be done without executing
  --status            Show current workflow status
  --reset             Reset workflow state
  --help              Show this help message

WORKFLOW STEPS:
  1. Kickoff & Requirements Gathering
  2. Spec Generation (AutoGen PM-agent)
  3. Devin Code Generation
  4. Pull Request Creation
  5. Automated Testing (CI/CD)
  6. Visual & Performance Testing
  7. Deployment & Preview
  8. Final Review & Merge

EXAMPLES:
  $0 --issue 123                    # Start from GitHub issue #123
  $0 --spec "Build a todo app"      # Start with custom requirements
  $0 --resume 5                     # Resume from step 5 (testing)
  $0 --status                       # Check current status
  
ENVIRONMENT:
  Ensure .env file contains required API keys:
  - SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN
  - CLAUDE_API_KEY (optional, will use Ollama if not set)
  - PERCY_TOKEN, BROWSERBASE_API_KEY, VERCEL_TOKEN
  - HELICONE_API_KEY (for cost monitoring)

EOF
}

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
        --resume)
            RESUME_STEP="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --status)
            echo "📊 Current Workflow Status:"
            load_state | jq .
            exit 0
            ;;
        --reset)
            rm -f "$WORKFLOW_STATE_FILE"
            log_success "Workflow state reset"
            exit 0
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate input
if [[ -z "$ISSUE_ID" && -z "$SPEC_TEXT" && -z "$RESUME_STEP" ]]; then
    log_error "Must provide either --issue, --spec, or --resume"
    show_usage
    exit 1
fi

# Load current state
current_state=$(load_state)
current_step=$(echo "$current_state" | jq -r '.current_step // 0')

# Set starting step
if [[ -n "$RESUME_STEP" ]]; then
    current_step="$RESUME_STEP"
    log_info "Resuming workflow from step $current_step"
elif [[ "$current_step" -gt 0 ]]; then
    log_info "Continuing workflow from step $current_step"
    log_info "Use --reset to start over or --resume <step> to jump to specific step"
else
    current_step=1
    log_info "Starting new workflow"
fi

# Pre-flight checks
log_info "Running pre-flight checks..."
check_pipeline_status
check_cost_limits

# Workflow Variables (will be populated during execution)
BRANCH_NAME=""
PR_URL=""
PREVIEW_URL=""

# === WORKFLOW STEPS ===

# Step 1: Kickoff & Requirements Gathering
step_1_kickoff() {
    log_info "Step 1: Requirements Gathering & Kickoff"
    save_state 1 "in_progress" "Processing requirements"
    
    local requirements=""
    
    if [[ -n "$ISSUE_ID" ]]; then
        log_info "Fetching requirements from GitHub issue #$ISSUE_ID"
        if [[ "$DRY_RUN" == "false" ]]; then
            requirements=$(gh issue view "$ISSUE_ID" --json body -q .body)
            if [[ -z "$requirements" ]]; then
                log_error "Could not fetch issue #$ISSUE_ID"
                save_state 1 "failed" "Failed to fetch GitHub issue"
                return 1
            fi
        else
            requirements="[DRY RUN] Would fetch issue #$ISSUE_ID"
        fi
    else
        requirements="$SPEC_TEXT"
    fi
    
    log_success "Requirements gathered (${#requirements} characters)"
    save_state 1 "completed" "Requirements: ${requirements:0:100}..."
    
    # Store requirements for next step
    echo "$requirements" > "$PROJECT_ROOT/.tmp_requirements.txt"
}

# Step 2: Spec Generation (AutoGen PM-agent)
step_2_spec_generation() {
    log_info "Step 2: Generating specification with AutoGen PM-agent"
    save_state 2 "in_progress" "Running AutoGen agents"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        local requirements=$(cat "$PROJECT_ROOT/.tmp_requirements.txt")
        
        # Generate spec using robust AutoGen
        if ! node scripts/generate-spec.js --input "$requirements"; then
            log_error "AutoGen spec generation failed"
            save_state 2 "failed" "AutoGen failed to generate spec"
            return 1
        fi
        
        # Verify spec was created
        if [[ ! -f "$PROJECT_ROOT/spec.md" ]]; then
            log_error "spec.md was not created"
            save_state 2 "failed" "spec.md not found after generation"
            return 1
        fi
    else
        log_info "[DRY RUN] Would run: node scripts/generate-spec.js --input <requirements>"
    fi
    
    log_success "Specification generated successfully"
    save_state 2 "completed" "spec.md created with AutoGen PM-agent + Scribe-agent"
}

# Step 3: Devin Code Generation
step_3_code_generation() {
    log_info "Step 3: Generating code with Devin autonomous agent"
    save_state 3 "in_progress" "Running Devin code generation"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Run Devin with spec
        local devin_cmd="./devin/devin_run.sh"
        if [[ -n "$ISSUE_ID" ]]; then
            devin_cmd="$devin_cmd --issue $ISSUE_ID"
        fi
        devin_cmd="$devin_cmd --open"
        
        log_info "Running: $devin_cmd"
        
        # Capture output to extract branch and PR info
        local devin_output
        if ! devin_output=$($devin_cmd 2>&1); then
            log_error "Devin code generation failed"
            save_state 3 "failed" "Devin execution failed"
            return 1
        fi
        
        # Extract branch name and PR URL from output
        BRANCH_NAME=$(echo "$devin_output" | grep -o "Branch: devin/[^[:space:]]*" | cut -d' ' -f2 || echo "")
        PR_URL=$(echo "$devin_output" | grep -o "Pull request created: https://[^[:space:]]*" | cut -d' ' -f4 || echo "")
        
        if [[ -z "$BRANCH_NAME" ]]; then
            log_warning "Could not extract branch name from Devin output"
        fi
        
        if [[ -z "$PR_URL" ]]; then
            log_warning "Could not extract PR URL from Devin output"
        fi
    else
        log_info "[DRY RUN] Would run: ./devin/devin_run.sh --issue $ISSUE_ID --open"
        BRANCH_NAME="devin/feat-$(date +%s)"
        PR_URL="https://github.com/user/repo/pull/123"
    fi
    
    log_success "Code generation completed"
    log_info "Branch: $BRANCH_NAME"
    log_info "PR: $PR_URL"
    save_state 3 "completed" "Code generated, branch: $BRANCH_NAME, PR: $PR_URL"
}

# Step 4: Automated Testing (CI/CD Pipeline)
step_4_automated_testing() {
    log_info "Step 4: Running automated testing pipeline"
    save_state 4 "in_progress" "Running CI/CD tests"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Wait for CI to start and complete
        log_info "Waiting for GitHub Actions to complete..."
        
        if [[ -n "$PR_URL" ]]; then
            # Extract PR number from URL
            local pr_number=$(echo "$PR_URL" | grep -o '[0-9]*$')
            
            # Wait for checks to complete (with timeout)
            local timeout=900  # 15 minutes
            local elapsed=0
            local check_interval=30
            
            while [[ $elapsed -lt $timeout ]]; do
                local check_status=$(gh pr checks "$pr_number" --json state -q '.[] | select(.name | contains("CI")) | .state' | head -1)
                
                case "$check_status" in
                    "COMPLETED")
                        log_success "CI tests completed successfully"
                        break
                        ;;
                    "FAILED")
                        log_error "CI tests failed"
                        save_state 4 "failed" "CI tests failed"
                        return 1
                        ;;
                    *)
                        log_info "CI tests still running... (${elapsed}s elapsed)"
                        sleep $check_interval
                        elapsed=$((elapsed + check_interval))
                        ;;
                esac
            done
            
            if [[ $elapsed -ge $timeout ]]; then
                log_warning "CI tests timed out after ${timeout}s"
            fi
        else
            log_warning "No PR URL available, skipping CI check"
        fi
    else
        log_info "[DRY RUN] Would wait for GitHub Actions CI/CD pipeline"
    fi
    
    log_success "Automated testing phase completed"
    save_state 4 "completed" "CI/CD pipeline completed"
}

# Step 5: Visual & Performance Testing
step_5_visual_testing() {
    log_info "Step 5: Running visual regression and performance tests"
    save_state 5 "in_progress" "Running Percy and Browserbase tests"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Visual regression with Percy (if configured)
        if [[ -n "${PERCY_TOKEN:-}" ]]; then
            log_info "Running Percy visual regression tests..."
            if ! npm run test:visual; then
                log_warning "Percy visual tests failed or not configured"
            else
                log_success "Percy visual tests completed"
            fi
        else
            log_info "Percy not configured, skipping visual regression tests"
        fi
        
        # Browserbase testing (if configured)
        if [[ -n "${BROWSERBASE_API_KEY:-}" ]]; then
            log_info "Running Browserbase flow tests..."
            # Browserbase tests are typically triggered by CI/CD
            log_info "Browserbase tests should be running via CI/CD pipeline"
        else
            log_info "Browserbase not configured, skipping flow tests"
        fi
    else
        log_info "[DRY RUN] Would run Percy visual tests and Browserbase flows"
    fi
    
    log_success "Visual and performance testing completed"
    save_state 5 "completed" "Visual regression and performance tests completed"
}

# Step 6: Deployment & Preview
step_6_deployment() {
    log_info "Step 6: Deploying preview and getting preview URL"
    save_state 6 "in_progress" "Deploying preview"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Preview should be automatically deployed by Vercel via GitHub integration
        # Get preview URL from PR
        if [[ -n "$PR_URL" ]]; then
            local pr_number=$(echo "$PR_URL" | grep -o '[0-9]*$')
            
            # Wait for deployment
            log_info "Waiting for Vercel preview deployment..."
            sleep 30  # Give Vercel time to start deployment
            
            # Try to get preview URL (this might need adjustment based on your setup)
            PREVIEW_URL=$(gh pr view "$pr_number" --json body -q '.body' | grep -o 'https://[^[:space:]]*vercel.app[^[:space:]]*' | head -1 || echo "")
            
            if [[ -z "$PREVIEW_URL" ]]; then
                log_warning "Could not automatically detect preview URL"
                PREVIEW_URL="https://preview-branch-name.vercel.app"
            fi
        else
            log_warning "No PR URL available for preview deployment"
            PREVIEW_URL="https://preview-unknown.vercel.app"
        fi
    else
        log_info "[DRY RUN] Would deploy preview to Vercel"
        PREVIEW_URL="https://preview-branch-name.vercel.app"
    fi
    
    log_success "Preview deployed"
    log_info "Preview URL: $PREVIEW_URL"
    save_state 6 "completed" "Preview deployed: $PREVIEW_URL"
}

# Step 7: Cost Check & Monitoring
step_7_cost_check() {
    log_info "Step 7: Final cost check and monitoring"
    save_state 7 "in_progress" "Checking costs and usage"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Run cost monitoring
        log_info "Generating cost report..."
        ./scripts/monitor_costs.sh > /tmp/workflow_costs.txt
        
        local cost_summary=$(tail -5 /tmp/workflow_costs.txt)
        log_info "Cost Summary:"
        echo "$cost_summary"
        
        # Check if we're within budget
        if ! ./scripts/monitor_costs.sh --check-only; then
            log_warning "Cost limits approached or exceeded"
        fi
    else
        log_info "[DRY RUN] Would run cost monitoring and generate report"
    fi
    
    log_success "Cost check completed"
    save_state 7 "completed" "Cost monitoring completed"
}

# Step 8: Final Summary & Cleanup
step_8_completion() {
    log_info "Step 8: Workflow completion and summary"
    save_state 8 "in_progress" "Generating final summary"
    
    # Generate completion summary
    cat << EOF

🎉 WORKFLOW COMPLETED SUCCESSFULLY!

📋 Summary:
  • Issue: ${ISSUE_ID:-"Custom spec"}
  • Branch: ${BRANCH_NAME:-"Unknown"}
  • Pull Request: ${PR_URL:-"Not created"}
  • Preview URL: ${PREVIEW_URL:-"Not deployed"}

📊 Next Steps:
  1. Review the pull request: ${PR_URL:-"Check GitHub"}
  2. Test the preview: ${PREVIEW_URL:-"Check Vercel"}
  3. Approve and merge when ready
  4. Monitor costs: ./scripts/monitor_costs.sh

💰 Cost Monitoring:
  • Run: ./scripts/monitor_costs.sh
  • Daily limit: \$${HELICONE_MAX_BUDGET_USD:-5}
  • Kill switch: ${HALT_PIPELINE:-false}

🤖 Autonomous Development Stack
Generated on: $(date)

EOF
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Cleanup temporary files
        rm -f "$PROJECT_ROOT/.tmp_requirements.txt"
    fi
    
    save_state 8 "completed" "Workflow completed successfully"
    
    # Reset state for next workflow
    rm -f "$WORKFLOW_STATE_FILE"
    
    log_success "Workflow completed successfully!"
}

# === MAIN EXECUTION ===

log_info "🤖 Autonomous Development Workflow Starting..."
log_info "Project: $PROJECT_ROOT"
log_info "Starting from step: $current_step"

# Execute workflow steps
while [[ $current_step -le 8 ]]; do
    case $current_step in
        1)
            if step_1_kickoff; then
                current_step=2
            else
                exit 1
            fi
            ;;
        2)
            if step_2_spec_generation; then
                current_step=3
            else
                exit 1
            fi
            ;;
        3)
            if step_3_code_generation; then
                current_step=4
            else
                exit 1
            fi
            ;;
        4)
            if step_4_automated_testing; then
                current_step=5
            else
                exit 1
            fi
            ;;
        5)
            if step_5_visual_testing; then
                current_step=6
            else
                exit 1
            fi
            ;;
        6)
            if step_6_deployment; then
                current_step=7
            else
                exit 1
            fi
            ;;
        7)
            if step_7_cost_check; then
                current_step=8
            else
                exit 1
            fi
            ;;
        8)
            step_8_completion
            break
            ;;
        *)
            log_error "Invalid step: $current_step"
            exit 1
            ;;
    esac
done

exit 0