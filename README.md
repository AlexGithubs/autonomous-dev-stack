# 🚀 Autonomous Dev Stack

> Multi-agent auto-dev pipeline for freelancers - Convert job descriptions into production-ready applications with AI-powered development, automated testing, and cost controls.

[![CI Pipeline](https://github.com/your-org/autonomous-dev-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/autonomous-dev-stack/actions/workflows/ci.yml)
[![Nightly QA](https://github.com/your-org/autonomous-dev-stack/actions/workflows/qa_nightly.yml/badge.svg)](https://github.com/your-org/autonomous-dev-stack/actions/workflows/qa_nightly.yml)

## 🎯 Overview

Transform any job description into a fully-tested, deployed web application in minutes. This battle-tested stack combines AI agents, automated QA, and smart cost controls to deliver production-ready code without manual intervention.

### Key Features

- **🤖 Multi-Agent System**: AutoGen PM and Scribe agents convert requirements to specs
- **💻 AI Code Generation**: Claude/GPT-4 powered scaffolding with fallback to local Ollama
- **🧪 Automated Testing**: Playwright E2E, Percy visual regression, Browserbase flows
- **💰 Cost Controls**: Real-time monitoring, budget caps, and emergency kill switch
- **🚢 Auto-Deploy**: Push-button deployment to Vercel with preview URLs
- **🔒 Enterprise Ready**: Security scanning, accessibility testing, performance monitoring

## 🏃 Quick Start

### One-Command Setup

```bash
git clone https://github.com/your-org/autonomous-dev-stack.git
cd autonomous-dev-stack
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

The bootstrap script will:
- Install all dependencies (Node.js, Docker, Ollama)
- Pull the phi3:mini model for local LLM
- Setup your environment variables
- Initialize the project structure

### Generate Your First App

```bash
# From a job description
./devin/devin_run.sh --spec "Build a SaaS dashboard with user auth, billing, and analytics"

# From a GitHub issue
./devin/devin_run.sh --issue 123

# Using the default spec
./devin/devin_run.sh
```

## 🛠 Configuration

### Environment Setup

1. Copy the template:
   ```bash
   cp .env.template .env
   ```

2. Add your API keys:
   ```
   OPENAI_API_KEY=sk-...        # For Claude/GPT-4 (optional)
   PERCY_TOKEN=percy_...        # Visual regression testing
   BROWSERBASE_API_KEY=bb_...   # Browser automation
   VERCEL_TOKEN=...             # Deployment
   HELICONE_API_KEY=...         # LLM usage tracking
   ```

3. Configure limits:
   ```
   HELICONE_MAX_BUDGET_USD=5    # Daily spending cap
   AUTO_HALT_ON_BUDGET=true     # Auto-stop on overage
   ```

## 🤖 Multi-Agent Workflow

### 1. Specification Generation

```bash
# Using AutoGen agents
npm run spec:generate -- --input "Build a real-time chat app"
```

The PM Agent extracts requirements while the Scribe Agent adds technical details.

### 2. Code Scaffolding

```bash
# Generate from spec
./devin/devin_run.sh --spec ./spec.md --branch feature/chat-app
```

Creates a complete Next.js + TypeScript + Tailwind application.

### 3. Automated Testing

```bash
# Run all tests
npm test

# Individual test suites
npm run test:e2e      # Playwright tests
npm run test:visual   # Percy snapshots
npm run test:a11y     # Accessibility audit
```

## 📊 Cost Monitoring

### Real-Time Tracking

```bash
# Check current usage
./scripts/monitor_costs.sh

# Summary only
./scripts/monitor_costs.sh --summary
```

### Budget Alerts

- Daily budget: $5 (configurable)
- Auto-notification at 80% usage
- Automatic halt at 100% (optional)
- Slack webhooks for team alerts

### Cost Breakdown

| Service | Estimated Daily Cost | Usage |
|---------|---------------------|--------|
| Ollama (local) | $0.00 | Unlimited |
| Claude API | $0.10 per 1K tokens | Code generation |
| Browserbase | $0.015 per minute | E2E testing |
| Percy | $0.01 per snapshot | Visual regression |
| Vercel | Free tier | Deployment |

## 🛑 Emergency Kill Switch

### Immediate Shutdown

```bash
./scripts/kill_pipeline.sh
```

This will:
- Set `HALT_PIPELINE=true` in `.env`
- Stop all running processes
- Cancel GitHub Actions workflows
- Log the shutdown event
- Create recovery instructions

### Restart After Halt

```bash
# Check why it was stopped
cat logs/kill_switch.log

# Re-enable the pipeline
sed -i '' 's/HALT_PIPELINE=true/HALT_PIPELINE=false/' .env

# Restart services
npm run dev
```

## 🧪 Testing Infrastructure

### Playwright E2E Tests

Located in `playwright/e2e.spec.ts`:
- Homepage loading
- Navigation testing
- API endpoint validation
- Form submissions
- Accessibility checks
- Performance metrics

### Visual Regression

**Percy Integration:**
```bash
PERCY_TOKEN=your_token npm run test:visual
```

**Self-Hosted VRT:**
```bash
cd vrt && docker-compose up -d
npm run test:vrt
```

### Browserbase Flows

Stagehand configuration in `stagehand/flow.stagehand`:
- Happy path user journeys
- 12-minute timeout cap
- Automatic retries
- Sensitive data redaction

## 🚀 Deployment

### Automatic Deployment

On merge to main:
1. CI runs all tests
2. Builds production bundle
3. Deploys to Vercel
4. Posts preview URL to PR

### Manual Deployment

```bash
vercel --prod
```

## 📈 Monitoring & Alerts

### Performance Monitoring

- Lighthouse CI on every build
- Core Web Vitals tracking
- Bundle size analysis
- API response time metrics

### Error Tracking

Check logs in:
- `logs/kill_switch.log` - Pipeline halts
- `costs/errors.log` - API failures  
- `costs/usage.log` - Usage tracking
- `reports/` - Test results

### Slack Notifications

Set `SLACK_WEBHOOK` in `.env` for:
- Build status updates
- Cost alerts
- Test failures
- Deployment notifications

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Job Desc      │────▶│  AutoGen Agents │────▶│    Spec.md      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Repo    │◀────│  Claude/Ollama  │◀────│  Devin Script   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Playwright    │────▶│     Percy       │────▶│   Browserbase   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│     Vercel      │────▶│   Production    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with conventional commits
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/autonomous-dev-stack/issues)
- **Discord**: [Join our community](https://discord.gg/your-invite)
- **Email**: support@autonomous-dev.com

---

Built with ❤️ for developers who ship fast and sleep well.