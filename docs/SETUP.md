# GitHub Repository Setup Guide

This guide helps you configure your GitHub repository to work with the advanced CI/CD system.

## 1. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save changes

## 2. Create GitHub Environments

1. Go to **Settings** → **Environments**
2. Create the following environments:

### Production Environment
- Name: `github-pages`
- Protection rules:
  - ✅ Required reviewers: 1
  - ✅ Wait timer: 0 minutes
  - ⬜ Deployment branches: All branches (or specify `main`)

### Development Environment
- Name: `development`
- Protection rules:
  - ⬜ Required reviewers: None
  - ⬜ Wait timer: 0 minutes
  - ✅ Deployment branches: Only `dev` branch

### Production Data Environment
- Name: `production`
- Protection rules:
  - ⬜ Required reviewers: None
  - ⬜ Wait timer: 0 minutes
  - ✅ Deployment branches: Only `main` branch

## 3. Configure Repository Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

### Required Secrets
- `GITHUB_TOKEN` - Automatically provided by GitHub (no action needed)

### Optional Secrets
- `STEAM_API_KEY` - Your Steam API key (for Steam integration)
  - Get from: https://steamcommunity.com/dev/apikey
- `STEAM_ID64` - Your Steam ID (64-bit)
  - Find at: https://steamid.io/
- `DISCORD_WEBHOOK` - Discord webhook URL (for notifications)
  - Create in Discord: Server Settings → Integrations → Webhooks
- `SLACK_WEBHOOK` - Slack webhook URL (for notifications)
  - Create in Slack: Apps → Incoming Webhooks

## 4. Set Branch Protection Rules

### For `main` Branch

1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `main`
3. Configure:
   - ✅ Require a pull request before merging
     - Required approvals: 1
     - ✅ Dismiss stale reviews
     - ✅ Require review from Code Owners
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date
     - Required status checks:
       - `security-scan`
       - `build-and-test`
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators
   - ✅ Restrict who can push to matching branches (optional)
   - ⬜ Allow force pushes: Nobody
   - ⬜ Allow deletions: No

### For `dev` Branch

1. Go to **Settings** → **Branches** → **Add branch protection rule**
2. Branch name pattern: `dev`
3. Configure:
   - ✅ Require a pull request before merging
     - Required approvals: 0 (or 1 for stricter control)
   - ✅ Require status checks to pass before merging
     - Required status checks:
       - `lint-and-validate`
       - `security-check`
   - ⬜ Include administrators (optional)
   - ⬜ Allow force pushes: Nobody
   - ⬜ Allow deletions: No

## 5. Configure Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**:
   - Select: ✅ **Read and write permissions**
   - ✅ Check **Allow GitHub Actions to create and approve pull requests**
3. Save changes

## 6. Enable Security Features

### Dependabot Alerts
1. Go to **Settings** → **Security** → **Code security and analysis**
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Dependabot version updates (optional)

### CodeQL Analysis
1. Go to **Security** → **Code scanning**
2. Should be automatically configured via `.github/workflows/codeql.yml`
3. Verify it's running in **Actions** tab

### Secret Scanning
1. Go to **Settings** → **Security** → **Code security and analysis**
2. Enable:
   - ✅ Secret scanning (if available for your account)

## 7. Configure Notifications (Optional)

### Discord Notifications

1. Create a webhook in Discord:
   - Server Settings → Integrations → Webhooks → New Webhook
   - Copy the webhook URL
2. Add to repository secrets as `DISCORD_WEBHOOK`
3. Uncomment Discord notification steps in workflows

### Slack Notifications

1. Create a webhook in Slack:
   - Apps → Incoming Webhooks → Add to Slack
   - Copy the webhook URL
2. Add to repository secrets as `SLACK_WEBHOOK`
3. Uncomment Slack notification steps in workflows

## 8. Create Initial Branches

If you don't have a `dev` branch yet:

```bash
# Create dev branch from main
git checkout main
git pull origin main
git checkout -b dev
git push origin dev

# Protect the dev branch (see step 4)
```

## 9. Test the Setup

### Test Production Workflow

```bash
# Make a small change to main
echo "# Test" >> test.md
git add test.md
git commit -m "test: verify workflow"
git push origin main

# Check Actions tab for workflow run
```

### Test Development Workflow

```bash
# Make a change to dev
git checkout dev
echo "# Dev Test" >> test-dev.md
git add test-dev.md
git commit -m "test: verify dev workflow"
git push origin dev

# Check Actions tab for workflow run
```

### Test Feature Workflow

```bash
# Create feature branch
git checkout -b feature/test dev
echo "# Feature Test" >> test-feature.md
git add test-feature.md
git commit -m "test: verify feature workflow"
git push origin feature/test

# Create PR to dev
gh pr create --base dev --head feature/test

# Check Actions tab and PR for checks
```

## 10. Verify Security Scanning

1. Go to **Security** tab
2. Check:
   - **Dependabot alerts** - Should show any dependency vulnerabilities
   - **Code scanning alerts** - Should show CodeQL findings
   - **Secret scanning alerts** - Should show any exposed secrets

## 11. Monitor Health Checks

1. Wait for the hourly health check to run
2. Check **Actions** tab for `Health Check & Monitoring` workflow
3. Verify it completes successfully
4. Check that no issues were created (means site is up)

## 12. Troubleshooting

### Workflows Not Running

**Check**:
- Workflow files are in `.github/workflows/`
- YAML syntax is valid
- Triggers are configured correctly
- Actions are enabled in repository settings

**Solution**:
```bash
# Validate workflow syntax
gh workflow list

# Manually trigger workflow
gh workflow run main.yml
```

### Permissions Errors

**Check**:
- Workflow permissions are set to "Read and write"
- Tokens have necessary scopes
- Environment protection rules aren't blocking

**Solution**:
1. Go to Settings → Actions → General
2. Set workflow permissions to "Read and write"
3. Check "Allow GitHub Actions to create and approve pull requests"

### Pages Deployment Fails

**Check**:
- GitHub Pages is enabled
- Source is set to "GitHub Actions"
- No conflicting branch configuration

**Solution**:
1. Go to Settings → Pages
2. Under Source, select "GitHub Actions"
3. Save and re-run workflow

### Security Scans Fail

**Check**:
- Dependencies are up to date
- No critical vulnerabilities
- CodeQL supports your code

**Solution**:
```bash
# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix

# Commit changes
git add package*.json
git commit -m "fix: update dependencies"
git push
```

## 13. Maintenance Checklist

### Daily
- [ ] Check workflow status in Actions tab
- [ ] Review security alerts

### Weekly
- [ ] Review and merge Dependabot PRs
- [ ] Check CodeQL scan results
- [ ] Review stale branches

### Monthly
- [ ] Update documentation
- [ ] Review and optimize workflows
- [ ] Clean up old workflow runs
- [ ] Update dependencies

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] Update branch protection rules
- [ ] Review and update secrets

## 14. Additional Configuration

### Custom Domain

If using a custom domain:

1. Go to **Settings** → **Pages**
2. Add your custom domain
3. Configure DNS records:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   piotrunius.github.io
   ```
4. Wait for DNS propagation
5. Enable HTTPS

### Subdomain for Dev Environment

To use dev.yourdomain.com for development:

1. Add CNAME record:
   ```
   CNAME dev   piotrunius.github.io
   ```
2. Configure in GitHub Pages (if available)
3. Or use Cloudflare Pages for dev branch

## 15. Support

If you encounter issues:

1. Check the [Troubleshooting](./CI-CD.md#troubleshooting) section
2. Review workflow logs in Actions tab
3. Search existing issues in the repository
4. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Workflow run URL
   - Error messages

## Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Managing Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

---

**Last Updated**: 2026-01-06  
**Document Version**: 1.0.0
