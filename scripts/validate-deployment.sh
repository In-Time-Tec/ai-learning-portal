#!/bin/bash

# Deployment Validation Script
# This script validates that the deployment pipeline is properly configured

set -e

echo "🚀 Validating Deployment Pipeline..."

# Check if required files exist
echo "📁 Checking required files..."
required_files=(
  ".github/workflows/deploy.yml"
  ".github/workflows/ci.yml"
  ".github/workflows/security.yml"
  ".github/workflows/staging.yml"
  ".github/workflows/release.yml"
  ".github/dependabot.yml"
  "lighthouserc.json"
  "package.json"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file is missing"
    exit 1
  fi
done

# Validate package.json has required scripts
echo "📦 Checking package.json scripts..."
if npm run | grep -q "build"; then
  echo "✅ build script found"
else
  echo "❌ build script missing"
  exit 1
fi

if npm run | grep -q "test"; then
  echo "✅ test script found"
else
  echo "❌ test script missing"
  exit 1
fi

# Test build process
echo "🔨 Testing build process..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Check build output
echo "📊 Checking build output..."
if [ -d "build" ]; then
  echo "✅ Build directory created"
else
  echo "❌ Build directory not found"
  exit 1
fi

if [ -f "build/index.html" ]; then
  echo "✅ index.html generated"
else
  echo "❌ index.html not found"
  exit 1
fi

# Check bundle size
echo "📏 Checking bundle size..."
BUNDLE_SIZE=$(du -sk build/static/js/*.js | awk '{sum += $1} END {print sum}')
echo "Bundle size: ${BUNDLE_SIZE}KB"

if [ $BUNDLE_SIZE -lt 500 ]; then
  echo "✅ Bundle size within 500KB limit"
else
  echo "⚠️  Bundle size exceeds 500KB limit"
fi

# Validate Lighthouse config
echo "🔍 Validating Lighthouse configuration..."
if command -v jq > /dev/null; then
  if jq empty lighthouserc.json > /dev/null 2>&1; then
    echo "✅ lighthouserc.json is valid JSON"
  else
    echo "❌ lighthouserc.json is invalid JSON"
    exit 1
  fi
else
  echo "⚠️  jq not available, skipping JSON validation"
fi

# Check GitHub Actions syntax (if act is available)
if command -v act > /dev/null; then
  echo "🎭 Validating GitHub Actions workflows..."
  act --list > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ GitHub Actions workflows are valid"
  else
    echo "❌ GitHub Actions workflows have syntax errors"
    exit 1
  fi
else
  echo "⚠️  act not available, skipping workflow validation"
fi

echo ""
echo "🎉 Deployment pipeline validation complete!"
echo ""
echo "📋 Summary:"
echo "   - All required files present"
echo "   - Build process working"
echo "   - Bundle size: ${BUNDLE_SIZE}KB (limit: 500KB)"
echo "   - Ready for GitHub Pages deployment"
echo ""
echo "🚀 To deploy:"
echo "   1. Push to 'main' branch for production"
echo "   2. Push to 'develop' branch for staging"
echo "   3. Create git tag for releases"