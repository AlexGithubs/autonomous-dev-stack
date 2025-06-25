#!/bin/bash
set -euo pipefail

echo "🚀 Autonomous Dev Stack Bootstrap"
echo "================================="

# Check if pipeline is halted
if [[ -f .env ]]; then
    source .env
    if [[ "${HALT_PIPELINE:-false}" == "true" ]]; then
        echo "❌ Pipeline is currently halted!"
        read -p "Do you want to re-enable it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sed -i '' 's/HALT_PIPELINE=true/HALT_PIPELINE=false/' .env
            echo "✅ Pipeline re-enabled"
        else
            echo "Exiting..."
            exit 1
        fi
    fi
fi

# OS detection
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
fi

echo "📍 Detected OS: $OS"

# Check and install dependencies
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 not found. Installing..."
        return 1
    else
        echo "✅ $1 is installed"
        return 0
    fi
}

# Node.js
if ! check_command node; then
    if [[ "$OS" == "macos" ]]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm install 20
        nvm use 20
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi

# Docker
if ! check_command docker; then
    if [[ "$OS" == "macos" ]]; then
        echo "Please install Docker Desktop from https://docker.com"
        exit 1
    else
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
    fi
fi

# Ollama
if ! check_command ollama; then
    if [[ "$OS" == "macos" ]]; then
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
fi

# GitHub CLI
if ! check_command gh; then
    if [[ "$OS" == "macos" ]]; then
        brew install gh
    else
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh
    fi
fi

# Pull Ollama model
echo "🤖 Pulling phi3:mini model..."
ollama pull phi3:mini

# Install npm dependencies
echo "📦 Installing npm packages..."
npm install

# Setup .env file
if [[ ! -f .env ]]; then
    echo "🔧 Creating .env file..."
    cp .env.template .env
    
    # Check for missing keys
    MISSING_KEYS=()
    
    check_env_var() {
        if grep -q "$1=__REPLACE_ME__" .env; then
            MISSING_KEYS+=("$1")
        fi
    }
    
    check_env_var "OPENAI_API_KEY"
    check_env_var "PERCY_TOKEN"
    check_env_var "BROWSERBASE_API_KEY"
    check_env_var "VERCEL_TOKEN"
    check_env_var "HELICONE_API_KEY"
    
    if [[ ${#MISSING_KEYS[@]} -gt 0 ]]; then
        echo "⚠️  Missing API keys detected:"
        for key in "${MISSING_KEYS[@]}"; do
            echo "  - $key"
            read -p "Enter value for $key (or press Enter to skip): " value
            if [[ -n "$value" ]]; then
                sed -i '' "s|$key=__REPLACE_ME__|$key=$value|" .env
            fi
        done
    fi
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs reports costs specs components

# Initialize git if needed
if [[ ! -d .git ]]; then
    echo "🌿 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Autonomous dev stack"
fi

# Test installations
echo -e "\n🧪 Testing installations..."
node --version
npm --version
docker --version
ollama --version

# Create default spec if missing
if [[ ! -f spec.md ]]; then
    cat > spec.md << 'EOF'
# Default Product Specification

## Project Overview
A modern web application with responsive design and API integration.

## Core Features
- Responsive landing page
- API endpoint for data retrieval
- Mobile-first design
- Accessibility compliance

## Technical Requirements
- Next.js with TypeScript
- Tailwind CSS for styling
- Playwright for testing
- Vercel deployment

## Acceptance Criteria
- [ ] Homepage loads in under 3 seconds
- [ ] All images have alt text
- [ ] API returns 200 status
- [ ] Mobile viewport works correctly
- [ ] No console errors
EOF
fi

echo -e "\n✅ Bootstrap complete!"
echo "📝 Next steps:"
echo "  1. Review and update .env file with your API keys"
echo "  2. Run 'npm run dev' to start development"
echo "  3. Run 'npm test' to execute tests"
echo "  4. Use './scripts/devin/devin_run.sh --spec \"your spec\"' to generate code"

# Final check
if [[ ${#MISSING_KEYS[@]} -gt 0 ]]; then
    echo -e "\n⚠️  Warning: Some API keys are still missing. The app will run in mock mode."
fi