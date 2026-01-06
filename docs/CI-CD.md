# CI/CD System - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Workflows](#workflows)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Security](#security)
7. [Deployment](#deployment)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Overview

This repository implements a production-grade CI/CD system for a static GitHub Pages site with the following capabilities:

### Key Features

- ✅ **Multi-Environment Support**: Production, Development, and Feature environments
- ✅ **Automated Testing**: HTML/CSS validation, accessibility testing, link checking
- ✅ **Security Scanning**: Trivy, CodeQL, npm audit, dependency vulnerability detection
- ✅ **Performance Monitoring**: Lighthouse CI, uptime checks, response time tracking
- ✅ **Automated Deployment**: Zero-downtime deployments with health checks
- ✅ **Release Management**: Automatic changelog generation, version tagging
- ✅ **Quality Assurance**: Linting, code quality checks, bundle size monitoring
- ✅ **Monitoring & Alerting**: Uptime monitoring, automatic issue creation

### Technology Stack

- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages
- **Package Manager**: npm
- **Testing**: html-validate, stylelint, eslint, pa11y, linkinator, Lighthouse CI
- **Security**: Trivy, CodeQL, npm audit
- **Build Tools**: Sass, Terser, imagemin

## Architecture

### Branch Strategy

The repository uses a Git Flow-inspired branching model:

```
main (production)
├── Protected branch
├── Requires PR reviews
├── Automatic deployment to production
└── Version tags (v1.0.0, v1.1.0, etc.)

dev (development)
├── Integration branch
├── Automatic deployment to dev environment
└── Feature branches merge here first

feature/* (feature branches)
├── feature/new-component
├── feature/redesign-header
└── Short-lived branches for new features

bugfix/* (bug fixes)
└── bugfix/fix-navigation

hotfix/* (urgent fixes)
└── hotfix/security-patch
```

### Environments

#### 1. Production Environment

- **URL**: https://piotrunius.github.io
- **Branch**: `main`
- **Deployment**: Automatic on merge to main
- **Data Updates**: Every 15 minutes via scheduled workflow
- **Protections**: 
  - Required PR reviews
  - Status checks must pass
  - Branch must be up to date

**Workflow Triggers**:
- Push to main
- Schedule (cron: every 15 minutes)
- Manual dispatch

**Checks**:
- Full security scanning
- Complete test suite
- Performance validation
- Health checks post-deployment

#### 2. Development Environment

- **URL**: https://dev.piotrunius.github.io (requires configuration)
- **Branch**: `dev`
- **Deployment**: Automatic on push to dev
- **Purpose**: Integration testing, staging previews

**Workflow Triggers**:
- Push to dev
- Pull requests to dev
- Manual dispatch

**Checks**:
- Quick linting
- Basic validation
- Security scanning
- Link checking

#### 3. Feature Environments

- **Branches**: `feature/*`, `bugfix/*`, `hotfix/*`
- **Deployment**: None (testing only)
- **Purpose**: Development and PR validation

**Workflow Triggers**:
- Push to feature branches
- Pull requests to main or dev

**Checks**:
- Code quality validation
- Security scanning
- Accessibility testing
- Bundle size analysis

### Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Push to Feature Branch                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Feature Branch CI (feature.yml)                 │
│  • Quick linting                                            │
│  • Security scan                                            │
│  • Code quality checks                                      │
│  • Accessibility tests                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Create Pull Request to dev                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Merge to dev                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Development Deploy (dev.yml)                    │
│  • Lint & validate                                          │
│  • Security checks                                          │
│  • Update dev data                                          │
│  • Deploy to dev environment                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Create Pull Request to main                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Merge to main                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Production Deploy (main.yml)                    │
│  • Security scanning                                        │
│  • Full test suite                                          │
│  • Update production data                                   │
│  • Deploy to GitHub Pages                                   │
│  • Health checks                                            │
│  • Version tagging                                          │
└─────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. Production Deploy (`main.yml`)

**Purpose**: Deploy to production with full quality and security checks.

**Triggers**:
```yaml
on:
  push:
    branches: ["main"]
    paths-ignore:
      - 'data/**'
      - '**.md'
      - 'docs/**'
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:
```

**Jobs**:

1. **security-scan**
   - Runs Trivy vulnerability scanner
   - Uploads results to GitHub Security tab
   - Fails on critical vulnerabilities

2. **build-and-test**
   - HTML validation with html-validate
   - CSS validation with stylelint
   - Link checking with linkinator
   - Lighthouse CI setup

3. **update-data**
   - Fetches GitHub statistics
   - Updates Steam status
   - Commits changes to data/ directory
   - Creates version tags

4. **deploy-production**
   - Configures GitHub Pages
   - Uploads site artifact
   - Deploys to production
   - Runs health checks
   - Sends notifications

**Environment Variables**:
- `GITHUB_TOKEN`: GitHub API access (automatic)
- `STEAM_API_KEY`: Steam API key (optional)
- `STEAM_ID64`: Steam user ID (optional)

**Permissions Required**:
```yaml
permissions:
  contents: write        # For committing data updates
  pages: write          # For deploying to Pages
  id-token: write       # For Pages deployment
  security-events: write # For security scan uploads
  actions: read         # For workflow status
```

### 2. Development Deploy (`dev.yml`)

**Purpose**: Deploy to development environment with quick validation.

**Triggers**:
```yaml
on:
  push:
    branches: ["dev"]
  pull_request:
    branches: ["dev"]
  workflow_dispatch:
```

**Jobs**:

1. **lint-and-validate**
   - CSS linting
   - JavaScript linting
   - HTML validation

2. **security-check**
   - Trivy vulnerability scan
   - Upload to Security tab

3. **build-and-test**
   - Run test suite
   - Check links

4. **update-dev-data**
   - Update development data
   - Commit changes

5. **deploy-dev**
   - Deploy to dev environment
   - Comment on commit

6. **lighthouse-check**
   - Run performance tests

### 3. Feature Branch CI (`feature.yml`)

**Purpose**: Validate code quality and security for feature branches.

**Triggers**:
```yaml
on:
  push:
    branches:
      - 'feature/**'
  pull_request:
    branches: ["main", "dev"]
    types: [opened, synchronize, reopened]
```

**Jobs**:

1. **quick-check**
   - Fast linting
   - Basic validation

2. **security-scan**
   - Trivy vulnerability scanner
   - Upload to Security tab

3. **code-quality**
   - HTML validation
   - CSS validation
   - Link checking
   - PR comment with results

4. **accessibility-test**
   - Run accessibility tests
   - WCAG 2.0 AA compliance

5. **preview-info**
   - Post preview information to PR
   - Deployment status
   - Next steps

6. **bundle-size**
   - Check file sizes
   - Report in job summary

### 4. Health Check & Monitoring (`health-check.yml`)

**Purpose**: Monitor site health and performance.

**Triggers**:
```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:
```

**Jobs**:

1. **uptime-check**
   - Check production site HTTP status
   - Measure response time
   - Create issue on failure

2. **performance-check**
   - Measure page load time
   - Check file sizes
   - Report metrics

3. **security-headers**
   - Verify security headers
   - Provide recommendations

4. **broken-links**
   - Check for broken links
   - Report findings

**Automatic Alerting**:
- Creates GitHub issue on site downtime
- Labels: `monitoring`, `site-down`, `priority-high`
- Includes troubleshooting steps

### 5. Release Management (`release.yml`)

**Purpose**: Automate release creation and changelog generation.

**Triggers**:
```yaml
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release'
        required: true
```

**Jobs**:

1. **create-release**
   - Get version from tag or input
   - Generate changelog from commits
   - Create GitHub Release
   - Update CHANGELOG.md
   - Post deployment summary

**Changelog Format**:
```markdown
# Release v1.0.0

**Release Date**: 2026-01-06

## 🚀 Changes

- feat: add new feature (abc123)
- fix: resolve bug (def456)

## 📊 Statistics

- Commits: 15
- Contributors: 3

## 🔗 Links

- Production Site
- Full Changelog
```

**Creating a Release**:
```bash
# Automatic (via tag)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Manual (via workflow dispatch)
gh workflow run release.yml -f version=1.0.0
```

### 6. Branch Cleanup (`cleanup.yml`)

**Purpose**: Automatically delete merged feature branches.

**Triggers**:
```yaml
on:
  pull_request:
    types: [closed]
  workflow_dispatch:
```

**Jobs**:

1. **delete-merged-branch**
   - Check if PR was merged
   - Skip protected branches (main, dev)
   - Delete feature/bugfix/hotfix branches
   - Comment on PR

2. **cleanup-stale-branches**
   - Find branches older than 60 days
   - Report stale branches
   - Require manual review for deletion

**Protected Branches**:
- `main`
- `dev`
- `master`

### 7. CodeQL Security (`codeql.yml`)

**Purpose**: Static code analysis for security vulnerabilities.

**Triggers**:
```yaml
on:
  push:
    branches: ["main", "dev"]
  pull_request:
    branches: ["main", "dev"]
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Mondays
  workflow_dispatch:
```

**Jobs**:

1. **analyze**
   - Initialize CodeQL
   - Analyze JavaScript code
   - Use security-extended queries
   - Upload results to Security tab

**Detected Issues**:
- SQL injection
- Cross-site scripting (XSS)
- Path traversal
- Command injection
- Hardcoded credentials
- And more...

### 8. Dependency Management (`dependencies.yml`)

**Purpose**: Monitor and manage dependencies.

**Triggers**:
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:
```

**Jobs**:

1. **vulnerability-scan**
   - Run npm audit
   - Run Trivy scanner
   - Report vulnerability counts
   - Create issue for critical vulnerabilities

2. **dependency-update-check**
   - Check for outdated dependencies
   - Report update opportunities

3. **license-check**
   - Verify license compliance
   - Report license summary

**Vulnerability Severity Levels**:
- 🔴 Critical: Immediate action required
- 🟠 High: Urgent, address soon
- 🟡 Moderate: Important, plan fix
- 🟢 Low: Minor, address as convenient

## Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "build": "npm run build:css && npm run build:js && npm run optimize:images",
    "build:css": "sass styles.scss styles.css --style=compressed",
    "build:js": "terser app.js -o app.min.js --compress --mangle",
    "optimize:images": "imagemin assets/*.{jpg,png,gif,svg} --out-dir=assets/optimized",
    
    "test": "npm run test:html && npm run test:css && npm run test:links && npm run test:a11y",
    "test:html": "html-validate '*.html'",
    "test:css": "stylelint '**/*.css'",
    "test:links": "linkinator . --recurse --skip node_modules",
    "test:a11y": "pa11y-ci",
    "test:lighthouse": "lhci autorun",
    
    "lint": "npm run lint:css && npm run lint:js",
    "lint:css": "stylelint '**/*.css' --fix",
    "lint:js": "eslint '**/*.js' --fix",
    
    "dev": "browser-sync start --server --files '*.html, *.css, *.js'",
    "validate": "npm run test",
    "clean": "rm -rf dist node_modules .cache"
  }
}
```

### ESLint Configuration (`.eslintrc.json`)

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "single", { "avoidEscape": true }]
  }
}
```

### Stylelint Configuration (`.stylelintrc.json`)

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-hex-length": "long",
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "alpha-value-notation": "number",
    "color-function-notation": "legacy"
  }
}
```

### HTML Validate Configuration (`.htmlvalidate.json`)

```json
{
  "extends": "html-validate:recommended",
  "rules": {
    "require-sri": "off",
    "no-inline-style": "off",
    "void-style": "off"
  }
}
```

### Pa11y Configuration (`.pa11yci.json`)

```json
{
  "defaults": {
    "timeout": 30000,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "standard": "WCAG2AA",
    "runners": ["axe"]
  },
  "urls": [
    "http://localhost:8080/index.html"
  ]
}
```

### Lighthouse Configuration (`lighthouserc.js`)

```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: '.',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    }
  }
};
```

## Testing

### Local Testing

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific tests
npm run test:html
npm run test:css
npm run test:links
npm run test:a11y
npm run test:lighthouse
```

### Test Coverage

| Test Type | Tool | Purpose | Threshold |
|-----------|------|---------|-----------|
| HTML Validation | html-validate | Validate HTML structure | 0 errors |
| CSS Validation | stylelint | CSS quality and standards | 0 errors |
| Link Checking | linkinator | Find broken links | 0 broken |
| Accessibility | pa11y | WCAG 2.0 AA compliance | 0 errors |
| Performance | Lighthouse | Performance metrics | Score ≥ 80 |
| SEO | Lighthouse | SEO best practices | Score ≥ 90 |

### Accessibility Testing

The project tests against WCAG 2.0 Level AA standards:

**Common Checks**:
- Color contrast ratios (4.5:1 for normal text)
- Keyboard navigation support
- Screen reader compatibility
- ARIA attributes correctness
- Form labels and error messages
- Alternative text for images
- Focus indicators
- Skip navigation links

**Tools Used**:
- pa11y with axe-core engine
- Lighthouse accessibility audit

### Performance Testing

**Metrics Tracked**:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

**Performance Budgets**:
- Performance Score: ≥ 80
- Accessibility Score: ≥ 90
- Best Practices Score: ≥ 90
- SEO Score: ≥ 90

## Security

### Security Scanning Tools

#### 1. Trivy

**What it scans**:
- Filesystem vulnerabilities
- npm dependencies
- Configuration issues
- Container images (if applicable)

**Severity Levels**:
- CRITICAL: Immediate patch required
- HIGH: High priority, patch soon
- MEDIUM: Medium priority
- LOW: Low priority

**Integration**:
```yaml
- name: Run Trivy Scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
```

#### 2. CodeQL

**What it detects**:
- SQL injection
- Cross-site scripting (XSS)
- Path traversal
- Command injection
- Insecure deserialization
- Weak cryptography
- Hardcoded credentials

**Scan Frequency**:
- On every push to main/dev
- On every pull request
- Weekly scheduled scan
- Manual dispatch

#### 3. npm audit

**What it checks**:
- Known vulnerabilities in dependencies
- Severity levels (critical to low)
- Recommended fixes

**Usage**:
```bash
# Check for vulnerabilities
npm audit

# Attempt automatic fix
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

### Security Best Practices

1. **Dependency Management**
   - Keep dependencies up to date
   - Review security advisories
   - Use `npm audit` regularly
   - Pin dependency versions

2. **Code Security**
   - Run CodeQL on all code changes
   - Review security scan results
   - Fix critical vulnerabilities immediately

3. **Secrets Management**
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly
   - Use environment-specific secrets

4. **Access Control**
   - Enable branch protection
   - Require PR reviews
   - Limit force push access
   - Use principle of least privilege

### Security Headers

Recommended security headers for GitHub Pages:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

Note: GitHub Pages has limited control over HTTP headers, so meta tags are used.

## Deployment

### Deployment Flow

```
Development → Testing → Staging → Production
    ↓           ↓         ↓          ↓
 feature/*    PR checks   dev      main
```

### Production Deployment

**Prerequisites**:
- All tests pass
- Security scans clear
- PR approved by reviewer
- Branch up to date with main

**Process**:
1. Create PR from dev to main
2. Automated checks run
3. Manual review
4. Merge PR
5. Automatic deployment triggers
6. Health checks verify deployment
7. Version tag created

**Deployment Steps**:
```bash
# 1. Ensure dev is up to date
git checkout dev
git pull origin dev

# 2. Create PR
gh pr create --base main --head dev \
  --title "Release: v1.0.0" \
  --body "Deploy features to production"

# 3. Wait for checks and approval

# 4. Merge (via GitHub UI or CLI)
gh pr merge --merge

# 5. Monitor deployment
gh run watch
```

### Rollback Procedures

#### Method 1: Revert Commit

```bash
# Find the bad commit
git log --oneline main

# Revert the commit
git revert <commit-hash>

# Push to trigger redeployment
git push origin main
```

#### Method 2: Tag Rollback

```bash
# List available versions
git tag -l

# Create rollback branch
git checkout v1.0.0
git checkout -b rollback-main

# Push and create PR
git push origin rollback-main
gh pr create --base main --head rollback-main \
  --title "Rollback to v1.0.0"
```

#### Method 3: Emergency Rollback

⚠️ **Use only in emergencies - requires force push permissions**

```bash
# Reset to previous good commit
git reset --hard <commit-hash>

# Force push (dangerous!)
git push --force origin main
```

### Deployment Verification

**Automatic Checks**:
```bash
# Health check runs automatically
STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://piotrunius.github.io/)
if [ $STATUS -eq 200 ]; then
  echo "✅ Deployment successful"
else
  echo "❌ Deployment failed"
fi
```

**Manual Verification**:
1. Open production URL
2. Test critical functionality
3. Check console for errors
4. Verify data loads correctly
5. Test on mobile devices

## Monitoring

### Uptime Monitoring

**Frequency**: Every hour  
**Method**: HTTP health check  
**Alert Trigger**: Non-200 status code  
**Response**: Automatic GitHub issue creation

**Monitored Metrics**:
- HTTP status code
- Response time
- Page availability
- SSL certificate validity

### Performance Monitoring

**Metrics Tracked**:
- Page load time
- First Contentful Paint
- Largest Contentful Paint
- Time to Interactive
- Total Blocking Time
- Cumulative Layout Shift

**Thresholds**:
- Page load time: < 3 seconds
- FCP: < 1.8 seconds
- LCP: < 2.5 seconds
- TBT: < 200ms
- CLS: < 0.1

### Error Tracking

**Monitored Issues**:
- JavaScript errors
- Network failures
- Resource loading failures
- API call failures

**Integration**: Umami Analytics (privacy-friendly)

### Alerting

**Alert Channels**:
- GitHub Issues (automatic creation)
- Workflow notifications
- Optional: Discord/Slack webhooks

**Alert Types**:
1. **Site Down**
   - Priority: Critical
   - Response Time: Immediate
   - Labels: `monitoring`, `site-down`, `priority-high`

2. **Security Vulnerability**
   - Priority: High
   - Response Time: Within 24 hours
   - Labels: `security`, `dependencies`, `priority-high`

3. **Performance Degradation**
   - Priority: Medium
   - Response Time: Within 1 week
   - Labels: `performance`, `monitoring`

### Monitoring Dashboard

View monitoring status:
- **Actions Tab**: Workflow run history
- **Security Tab**: Security alerts and scans
- **Insights Tab**: Repository metrics
- **Issues Tab**: Automated alerts

## Troubleshooting

### Common Issues

#### 1. Workflow Fails to Start

**Symptoms**: Workflow doesn't trigger on push

**Possible Causes**:
- Workflow file syntax error
- Incorrect trigger configuration
- File in ignored path

**Solutions**:
```bash
# Validate workflow syntax
gh workflow view main.yml

# Check workflow runs
gh run list --workflow=main.yml

# Manually trigger workflow
gh workflow run main.yml
```

#### 2. npm install Fails

**Symptoms**: `npm ci` or `npm install` fails in workflow

**Possible Causes**:
- package-lock.json out of sync
- Network issues
- Incompatible Node version

**Solutions**:
```bash
# Regenerate package-lock.json
rm package-lock.json
npm install

# Commit changes
git add package-lock.json
git commit -m "fix: regenerate package-lock.json"
git push
```

#### 3. Pages Deployment Fails

**Symptoms**: Pages deployment step fails

**Possible Causes**:
- GitHub Pages not enabled
- Wrong branch configured
- Permissions issue

**Solutions**:
1. Check Settings → Pages
2. Ensure source is set to GitHub Actions
3. Verify workflow permissions
4. Check Actions secrets

#### 4. Security Scan False Positives

**Symptoms**: Trivy reports vulnerabilities that aren't real

**Possible Causes**:
- Outdated vulnerability database
- Dependencies in devDependencies
- Test fixtures triggering alerts

**Solutions**:
```yaml
# Add exclusions to workflow
- name: Run Trivy Scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    skip-dirs: 'node_modules,test'
    severity: 'CRITICAL,HIGH'
```

#### 5. Lighthouse Tests Fail

**Symptoms**: Lighthouse CI fails with low scores

**Possible Causes**:
- Slow network in CI environment
- External resources blocking
- Heavy JavaScript execution

**Solutions**:
```javascript
// Adjust thresholds in lighthouserc.js
assertions: {
  'categories:performance': ['warn', { minScore: 0.7 }],
  // ...
}
```

#### 6. Link Checker Reports False Positives

**Symptoms**: Working links reported as broken

**Possible Causes**:
- Rate limiting
- Authentication required
- Server temporarily down

**Solutions**:
```bash
# Add skip patterns
npm run test:links -- \
  --skip "example.com" \
  --retry 3
```

### Debugging Workflows

#### View Workflow Logs

```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# View detailed logs
gh run view <run-id> --log

# Download logs
gh run download <run-id>
```

#### Enable Debug Logging

Add to workflow file:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

Or set repository secrets:
- `ACTIONS_STEP_DEBUG`: `true`
- `ACTIONS_RUNNER_DEBUG`: `true`

#### Re-run Failed Jobs

```bash
# Re-run all jobs
gh run rerun <run-id>

# Re-run only failed jobs
gh run rerun <run-id> --failed
```

### Getting Help

1. **Check Documentation**
   - Review workflow files
   - Check tool documentation
   - Search existing issues

2. **Inspect Logs**
   - View detailed workflow logs
   - Check error messages
   - Look for common patterns

3. **Create Issue**
   - Include workflow run URL
   - Attach error messages
   - Describe steps to reproduce
   - Include environment details

4. **Community Resources**
   - GitHub Actions Community
   - Stack Overflow
   - GitHub Discussions

## Best Practices

### Development Workflow

1. **Always work in feature branches**
   ```bash
   git checkout -b feature/my-feature dev
   ```

2. **Keep branches up to date**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout feature/my-feature
   git rebase dev
   ```

3. **Write meaningful commit messages**
   ```bash
   git commit -m "feat: add new component"
   git commit -m "fix: resolve navigation bug"
   git commit -m "docs: update README"
   ```

4. **Test locally before pushing**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

5. **Create small, focused PRs**
   - One feature per PR
   - Clear description
   - Link related issues
   - Add screenshots for UI changes

### Code Quality

1. **Follow linting rules**
   - Run `npm run lint` before commit
   - Fix all linting errors
   - Address warnings when possible

2. **Write accessible HTML**
   - Use semantic HTML
   - Add ARIA labels
   - Ensure keyboard navigation
   - Test with screen readers

3. **Optimize performance**
   - Minimize JavaScript
   - Compress images
   - Use lazy loading
   - Implement caching

4. **Maintain security**
   - Keep dependencies updated
   - Fix vulnerabilities promptly
   - Never commit secrets
   - Use environment variables

### CI/CD Best Practices

1. **Keep workflows fast**
   - Use caching
   - Run jobs in parallel
   - Skip unnecessary steps
   - Use conditional execution

2. **Handle failures gracefully**
   - Use `continue-on-error` when appropriate
   - Provide clear error messages
   - Add retry logic for flaky tests

3. **Monitor and improve**
   - Review workflow durations
   - Optimize slow steps
   - Remove unused workflows
   - Update dependencies regularly

4. **Document everything**
   - Comment workflow files
   - Update documentation
   - Add inline comments
   - Maintain changelog

### Security Practices

1. **Regular Security Audits**
   - Weekly CodeQL scans
   - Daily dependency checks
   - Monthly manual reviews
   - Quarterly security assessment

2. **Vulnerability Response**
   - Critical: Fix immediately
   - High: Fix within 24 hours
   - Medium: Fix within 1 week
   - Low: Fix in next maintenance cycle

3. **Access Control**
   - Limit repository access
   - Use principle of least privilege
   - Enable 2FA for all contributors
   - Review access permissions regularly

4. **Secrets Management**
   - Rotate secrets regularly
   - Use environment-specific secrets
   - Never log secret values
   - Audit secret usage

### Deployment Practices

1. **Deploy During Low Traffic**
   - Schedule major deployments
   - Avoid peak hours
   - Communicate with users
   - Have rollback plan ready

2. **Gradual Rollouts**
   - Test in dev first
   - Deploy to staging
   - Monitor production closely
   - Be ready to rollback

3. **Post-Deployment**
   - Verify deployment success
   - Monitor error rates
   - Check performance metrics
   - Document any issues

4. **Maintenance Windows**
   - Schedule regular maintenance
   - Communicate downtime
   - Prepare maintenance checklist
   - Test after maintenance

## Appendix

### Useful Commands

```bash
# Workflow Management
gh workflow list
gh workflow view <workflow>
gh workflow run <workflow>
gh workflow enable <workflow>
gh workflow disable <workflow>

# Run Management
gh run list
gh run view <run-id>
gh run watch <run-id>
gh run rerun <run-id>
gh run cancel <run-id>

# Repository Management
gh repo view
gh repo sync
gh secret list
gh secret set <name>

# Issue Management
gh issue list
gh issue create
gh issue close <number>

# Pull Request Management
gh pr list
gh pr create
gh pr view <number>
gh pr merge <number>
```

### Related Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history.

### License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-06  
**Maintained By**: Piotrunius  
**Status**: Active
