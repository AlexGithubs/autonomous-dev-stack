# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Development
- `npm run dev` - Start development server (Next.js on port 3000)
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking (use this for validation)
- `npm run lint` - Run ESLint linter

### Testing
- `npm test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests only
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run test:visual` - Run Percy visual regression tests
- `npm run test:vrt` - Run self-hosted visual regression tests
- `npm run test:a11y` - Run accessibility tests

### Autonomous Development Pipeline
- `./scripts/bootstrap.sh` - Complete environment setup (run once)
- `./workflow.sh --issue 123` - **MAIN COMMAND**: Complete 8-step workflow from GitHub issue
- `./workflow.sh --spec "description"` - Complete 8-step workflow from custom requirements
- `./workflow.sh --resume 5` - Resume workflow from specific step (1-8)
- `./workflow.sh --status` - Check current workflow progress
- `./devin/devin_run.sh --issue 123 --open` - Generate code + create PR (step 3 only)
- `npm run spec:generate` - Generate specifications using AutoGen agents (step 2 only)

### Slack Bot Integration  
- `./scripts/start-slack-bot.sh` - Start Slack bot for team collaboration
- `npm run slack-bridge:python` - Alternative Python-based Slack bridge (set RUN_SLACK_BRIDGE=true)
- In #build-bot channel: `@PM-agent <requirements>` - Trigger AutoGen spec generation
- `/devin-run --issue 123` - Slack command to run Devin pipeline (Node.js bot only)
- `/cost-check` - Slack command to check usage and costs (Node.js bot only)

### Cost Monitoring and Pipeline Control
- `./scripts/monitor_costs.sh` - Check current usage and costs
- `./scripts/kill_pipeline.sh` - Emergency shutdown of entire pipeline
- `npm run monitor` - Start cost monitoring daemon
- Check `HALT_PIPELINE` env var to see if pipeline is disabled

## Architecture Overview

### Multi-Agent Autonomous Development System
This is a complete autonomous development stack that converts job descriptions into production-ready applications using an 8-step workflow:

1. **Requirements Gathering** (`workflow.sh`): Process GitHub issues or custom requirements
2. **AutoGen Agents** (`autogen/agents.yaml`): PM and Scribe agents convert requirements to technical specifications
3. **AI Code Generation** (`devin/devin_run.sh`): Claude/Ollama generates Next.js + TypeScript + Tailwind scaffolds
4. **Automatic PR Creation**: GitHub CLI creates draft PRs with detailed descriptions and test plans
5. **Automated Testing**: Comprehensive test suite with unit, e2e, visual regression, and accessibility testing
6. **Visual & Performance Testing**: Percy visual regression + Browserbase flow automation
7. **Preview Deployment**: Automatic Vercel preview deployments with live URLs
8. **Cost Monitoring & Reporting**: Real-time usage tracking with budget caps and emergency kill switches

### Slack Integration
- **Interactive Bot** (`slack-bot/server.js`): Team collaboration via #build-bot channel
- **Slash Commands**: `/devin-run`, `/cost-check` for workflow control
- **Real-time Notifications**: Status updates, cost alerts, and progress tracking
- **AutoGen Triggering**: `@PM-agent` mentions automatically generate specifications

### Key Components

#### Frontend Architecture
- **Framework**: Next.js 14+ with TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4+ with responsive design system
- **Components**: React components in `/components` with TypeScript interfaces
- **Pages**: Next.js pages in `/pages` including API routes in `/pages/api`
- **Utilities**: Shared utilities in `/utils` with comprehensive helper functions

#### Testing Infrastructure
- **Unit Tests**: Jest with React Testing Library (60% coverage threshold)
- **E2E Tests**: Playwright with multi-browser support (Chrome, Firefox, Safari, Mobile)
- **Visual Regression**: Percy integration + self-hosted VRT in `/vrt`
- **Accessibility**: axe-playwright for WCAG compliance
- **Performance**: Lighthouse CI for Core Web Vitals

#### Development Pipeline
- **Code Generation**: LLM-powered scaffolding with automatic fallback (Ollama ↔ Claude)
- **Git Integration**: Automatic branch creation and commit messages
- **Environment Management**: `.env` file with API key validation
- **Cost Tracking**: Helicone integration for LLM usage monitoring
- **Robust Fallbacks**: Ollama → Claude → Manual file creation

### Important Files and Directories

#### Configuration Files
- `package.json` - Dependencies and scripts
- `jest.config.js` - Jest testing configuration with coverage thresholds
- `playwright.config.ts` - Playwright e2e test configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js build configuration

#### Pipeline Scripts
- `scripts/bootstrap.sh` - Complete environment setup with dependency installation
- `workflow.sh` - **MAIN SCRIPT**: Complete 8-step autonomous development workflow
- `devin/devin_run.sh` - Code generation script with automatic PR creation
- `scripts/start-slack-bot.sh` - Start Slack bot for team collaboration
- `scripts/monitor_costs.sh` - Cost tracking and budget monitoring
- `scripts/kill_pipeline.sh` - Emergency pipeline shutdown

#### Slack Bot Integration
- `slack-bot/server.js` - Main Slack bot server with slash commands
- `slack-bot/package.json` - Slack bot dependencies (@slack/bolt)
- Supports `@PM-agent` mentions and `/devin-run`, `/cost-check` commands

#### Specifications
- `spec.md` - Default product specification template
- `specs/` - Directory for custom specifications
- `autogen/agents.yaml` - AutoGen agent configurations

#### Testing and Reports
- `playwright/` - E2E test files
- `components/__tests__/` - Component unit tests
- `utils/__tests__/` - Utility function tests
- `reports/` - Test results and coverage reports
- `vrt/` - Visual regression testing setup

### Code Standards and Patterns

#### Component Structure
Components follow consistent patterns:
- TypeScript interfaces for props
- Tailwind classes for styling
- Accessibility attributes (aria-*, alt text)
- Loading states and error handling
- Responsive design with mobile-first approach

#### API Routes
API routes in `/pages/api` follow REST conventions:
- Proper HTTP status codes
- Error handling with structured responses
- TypeScript interfaces for request/response
- Environment variable validation

#### Utility Functions
Utilities in `/utils/index.ts` include:
- Cost calculation and budget checking
- Pipeline control functions (`isPipelineHalted`)
- Input sanitization and validation
- Retry logic and debouncing
- Environment variable helpers

### Environment Variables

Critical environment variables:
- `HALT_PIPELINE` - Emergency kill switch (true/false)
- `USE_CLAUDE` - Use Claude API vs local Ollama (true/false)
- `CLAUDE_API_KEY` - For Claude API access (optional, uses Ollama if not set)
- `PERCY_TOKEN` - Visual regression testing
- `BROWSERBASE_API_KEY` - Browser automation
- `VERCEL_TOKEN` - Deployment
- `HELICONE_API_KEY` - LLM usage tracking
- `HELICONE_MAX_BUDGET_USD` - Daily spending cap
- `SLACK_BOT_TOKEN` - Slack bot authentication (for Slack integration)
- `SLACK_SIGNING_SECRET` - Slack app verification (for Slack integration)
- `SLACK_APP_TOKEN` - Slack app-level token (for Slack integration)

### Complete 8-Step Autonomous Development Workflow

#### Quick Start (Recommended)
```bash
# 1. One-time setup
./scripts/bootstrap.sh

# 2. Run complete workflow
./workflow.sh --issue 123                    # From GitHub issue
./workflow.sh --spec "Build a todo app"      # From custom requirements
```

#### Traditional Development Workflow (Manual)
1. **Setup**: Run `./scripts/bootstrap.sh` for complete environment setup
2. **Specification**: Create or update specifications in `spec.md` or `specs/`
3. **Generation**: Use `./devin/devin_run.sh --issue 123 --open` to generate code and create PR
4. **Development**: Use `npm run dev` for local development with hot reload
5. **Testing**: Run `npm test` for comprehensive test suite
6. **Validation**: Use `npm run type-check` and `npm run lint` for code quality
7. **Deployment**: Automatic deployment to Vercel on merge to main

#### Slack-Driven Workflow (Team Collaboration)
1. **Start Bot**: `./scripts/start-slack-bot.sh`
2. **Generate Spec**: In #build-bot channel, mention `@PM-agent` with requirements
3. **Trigger Development**: Use `/devin-run --issue 123` slash command
4. **Monitor Progress**: Bot provides real-time updates and cost tracking

### Cost Management

The system includes comprehensive cost controls:
- Real-time tracking via Helicone
- Daily budget caps (default $5)
- Automatic alerts at 80% usage
- Emergency kill switch via `HALT_PIPELINE`
- Service-specific cost breakdown (Claude API, Browserbase, Percy)

### LLM Fallback Behavior

The code generation system has automatic fallback logic:

#### If USE_CLAUDE=false (default):
1. **Primary**: Try Ollama (phi3:mini) locally - free, no API costs
2. **Fallback**: If Ollama fails, automatically try Claude API
3. **Final Fallback**: If both fail, create manual template files

#### If USE_CLAUDE=true:
1. **Primary**: Try Claude API first
2. **Fallback**: If Claude fails, try Ollama locally  
3. **Final Fallback**: Manual template creation

#### Ollama Failure Conditions:
- Service not running (`curl http://localhost:11434/api/version` fails)
- Model not found (`phi3:mini` not in `ollama list`)
- Request timeout (60 second limit)
- Invalid response format

#### Claude Failure Conditions:
- Missing or invalid `CLAUDE_API_KEY`
- API rate limits exceeded
- Non-200 HTTP response
- Invalid JSON response format

### Emergency Procedures

If costs exceed budget or system needs shutdown:
1. Run `./scripts/kill_pipeline.sh` immediately
2. Check `logs/kill_switch.log` for shutdown reason
3. Review `costs/usage.log` for cost analysis
4. Update budget limits in `.env` if needed
5. Re-enable with `HALT_PIPELINE=false` in `.env`

### Single Test Execution

To run a single test file:
- Unit tests: `npm run test:unit -- --testPathPattern="filename"`
- E2E tests: `npx playwright test --grep "test-name"`
- Visual tests: `npm run test:visual -- --spec "component-name"`