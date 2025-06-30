# Autonomous Development Workflow

This document describes the complete 8-step autonomous development workflow that converts requirements into production-ready applications.

## Quick Start

### Option 1: Master Workflow Controller (Recommended)
```bash
# Start from GitHub issue
./workflow.sh --issue 123

# Start from custom requirements
./workflow.sh --spec "Build a task management app with React and API"

# Resume from specific step
./workflow.sh --resume 5

# Check status
./workflow.sh --status
```

### Option 2: Slack Bot Integration
1. Set up Slack bot credentials in `.env`
2. Start the bot: `./scripts/start-slack-bot.sh`
3. In #build-bot channel: mention `@PM-agent` with your requirements
4. Use slash commands like `/devin-run --issue 123`

### Option 3: Individual Components
```bash
# Generate spec from requirements
npm run spec:generate -- --input "Your requirements here"

# Generate code from spec
./devin/devin_run.sh --spec "requirements" --open

# Run full test suite
npm test

# Monitor costs
npm run monitor
```

## The 8-Step Workflow

### Step 1: Requirements Gathering (Job Kickoff)
- **Input**: GitHub issue ID or raw requirements text
- **Process**: Extract and validate requirements
- **Output**: Structured requirements document
- **Time**: ~2 minutes

### Step 2: Specification Generation (AutoGen)
- **Input**: Raw requirements from Step 1
- **Process**: AutoGen PM-agent → Scribe-agent → `spec.md`
- **Output**: Technical specification with acceptance criteria
- **Time**: ~3 minutes

### Step 3: Code Generation (Devin)
- **Input**: Technical specification
- **Process**: Devin autonomous agent generates Next.js + TypeScript + Tailwind
- **Output**: Working application scaffold with API endpoints
- **Time**: ~10 minutes

### Step 4: Automated Testing (CI/CD)
- **Input**: Generated code in PR
- **Process**: GitHub Actions runs unit, e2e, lint, and type checks
- **Output**: Test results and quality gates
- **Time**: ~5 minutes

### Step 5: Visual & Performance Testing
- **Input**: Deployed preview
- **Process**: Percy visual regression + Browserbase flow testing
- **Output**: Visual diffs and performance metrics
- **Time**: ~3 minutes

### Step 6: Preview Deployment
- **Input**: Passing tests
- **Process**: Automatic Vercel preview deployment
- **Output**: Live preview URL for client review
- **Time**: ~2 minutes

### Step 7: Cost Monitoring & Reporting
- **Input**: Workflow completion
- **Process**: Helicone usage analysis + budget checking
- **Output**: Cost breakdown and usage summary
- **Time**: ~1 minute

### Step 8: Final Review & Delivery
- **Input**: Client approval
- **Process**: Merge to main, tag release, deploy production
- **Output**: Live application and project closeout
- **Time**: ~2 minutes

## Workflow Commands

### Master Controller
```bash
# Basic usage
./workflow.sh --issue <number>          # Start from GitHub issue
./workflow.sh --spec "<requirements>"   # Start from custom requirements

# Advanced usage
./workflow.sh --resume <step>           # Resume from specific step (1-8)
./workflow.sh --dry-run                 # Preview what would be done
./workflow.sh --status                  # Check current workflow status
./workflow.sh --reset                   # Reset workflow state

# Examples
./workflow.sh --issue 42                # Process GitHub issue #42
./workflow.sh --spec "Build a blog with Next.js and CMS"
./workflow.sh --resume 5                # Resume from visual testing
```

### Slack Bot Commands
```bash
# In #build-bot channel
@PM-agent Here are the requirements: [paste full requirements]

# Slash commands
/devin-run --issue 123                  # Generate from GitHub issue
/devin-run --spec                       # Generate from current spec.md
/cost-check                             # Check current usage and costs
```

### Component Scripts
```bash
# Environment setup
./scripts/bootstrap.sh                  # Complete setup
./scripts/start-slack-bot.sh           # Start Slack integration

# Specification generation
npm run spec:generate -- --input "requirements"
npm run spec:generate -- --file requirements.txt

# Code generation
./devin/devin_run.sh --issue 123 --open
./devin/devin_run.sh --spec "custom requirements"

# Testing
npm test                               # Full test suite
npm run test:unit                      # Jest unit tests
npm run test:e2e                       # Playwright e2e tests
npm run test:visual                    # Percy visual regression
npm run test:vrt                       # Self-hosted visual tests

# Monitoring and control
npm run monitor                        # Cost monitoring
npm run kill                          # Emergency pipeline shutdown
./scripts/monitor_costs.sh            # Detailed cost analysis
```

## Environment Setup

### Required Environment Variables
```bash
# Core functionality
HALT_PIPELINE=false
USE_CLAUDE=false                      # Use Ollama by default
HELICONE_MAX_BUDGET_USD=5            # Daily spending limit

# API Keys (get from respective services)
CLAUDE_API_KEY=sk-ant-...            # Optional: Claude API
PERCY_TOKEN=percy_...                # Visual testing
BROWSERBASE_API_KEY=bb_...           # Browser automation
VERCEL_TOKEN=vercel_...              # Deployment
HELICONE_API_KEY=sk-helicone-...     # Usage tracking

# Slack Bot (for Slack integration)
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=slack_secret...
SLACK_APP_TOKEN=xapp-...

# GitHub (usually auto-configured)
GITHUB_TOKEN=ghp_...                 # For private repos
```

### Setup Steps
1. **Clone and Bootstrap**:
   ```bash
   git clone <your-repo>
   cd autonomous-dev-stack
   ./scripts/bootstrap.sh
   ```

2. **Configure Environment**:
   ```bash
   cp .env.template .env
   # Edit .env with your API keys
   ```

3. **Test Installation**:
   ```bash
   npm run workflow:status
   ./workflow.sh --dry-run --spec "test"
   ```

## Workflow State Management

The workflow controller automatically saves progress and can resume from any step:

```bash
# Check current state
./workflow.sh --status

# Resume from where it left off
./workflow.sh --resume

# Jump to specific step
./workflow.sh --resume 6

# Reset state (start over)
./workflow.sh --reset
```

State is stored in `.workflow_state.json` with timestamps and details.

## Cost Controls and Safety

### Automatic Safeguards
- **Budget Limits**: Daily spending caps with automatic pipeline halt
- **Kill Switch**: Emergency stop via `HALT_PIPELINE=true`
- **Usage Tracking**: Real-time monitoring via Helicone
- **Retry Logic**: Automatic fallback (Claude → Ollama → Manual)

### Cost Monitoring
```bash
# Quick cost check
npm run monitor

# Detailed analysis
./scripts/monitor_costs.sh

# Emergency shutdown
npm run kill
```

### Typical Costs (per workflow)
- **Ollama (Local)**: $0.00 (free)
- **Claude API**: ~$0.50-2.00 per workflow
- **Percy Visual**: ~$0.10 per workflow
- **Browserbase**: ~$0.05 per workflow
- **Vercel**: $0.00 (free tier)

**Total**: ~$0.65-2.15 per complete workflow

## Integration with Existing Tools

### GitHub Integration
- Automatic issue processing
- PR creation with templates
- Status updates via comments
- CI/CD trigger integration

### Slack Integration
- Real-time notifications
- Interactive commands
- Team collaboration
- Cost alerts

### Development Tools
- **IDE Support**: Works with any editor
- **Git Workflow**: Automatic branch/commit management
- **Testing**: Comprehensive test automation
- **Deployment**: Vercel/Netlify integration

## Troubleshooting

### Common Issues

**Pipeline Halted**:
```bash
# Check status
echo $HALT_PIPELINE

# Re-enable
sed -i 's/HALT_PIPELINE=true/HALT_PIPELINE=false/' .env
```

**Cost Limits Exceeded**:
```bash
# Check usage
./scripts/monitor_costs.sh

# Increase budget
sed -i 's/HELICONE_MAX_BUDGET_USD=5/HELICONE_MAX_BUDGET_USD=10/' .env
```

**Ollama Connection Issues**:
```bash
# Check service
curl http://localhost:11434/api/version

# Start service
ollama serve

# Install model
ollama pull phi3:mini
```

**GitHub CLI Issues**:
```bash
# Check authentication
gh auth status

# Login
gh auth login
```

### Getting Help

1. **Check Status**: `./workflow.sh --status`
2. **Review Logs**: Check `logs/` directory
3. **Cost Analysis**: `./scripts/monitor_costs.sh`
4. **Dry Run**: `./workflow.sh --dry-run --spec "test"`

## Advanced Usage

### Custom Specifications
Create detailed specs in `specs/` directory:
```bash
./workflow.sh --spec "$(cat specs/custom-project.md)"
```

### Multi-Project Workflows
Use different branches for different projects:
```bash
git checkout -b project-a
./workflow.sh --issue 123

git checkout -b project-b  
./workflow.sh --issue 456
```

### Production Deployment
After successful preview review:
```bash
# Manual merge and deploy
gh pr merge <pr-number> --merge
git tag v1.0.0
git push origin v1.0.0
```

## Architecture

The autonomous development stack consists of:

- **AutoGen Agents**: PM-agent + Scribe-agent for specification generation
- **Devin Agent**: Code generation with LLM fallback system
- **Testing Pipeline**: Jest + Playwright + Percy + Browserbase
- **Cost Monitoring**: Helicone integration with budget controls
- **Slack Integration**: Interactive bot for team collaboration
- **Workflow Controller**: Master orchestration script

All components work together to provide a complete autonomous development experience from requirements to production deployment.