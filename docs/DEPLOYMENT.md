# 🚀 Deployment Guide - SiSurat to Vercel

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] `npm run build` succeeds
- [ ] No console.error or console.log left in production code
- [ ] No secrets/passwords in code
- [ ] All dependencies have no vulnerabilities: `npm audit` shows 0
- [ ] Git history is clean: `git log --oneline -5`

### Security
- [ ] `.env` file exists with all required variables
- [ ] `.env` is in `.gitignore`
- [ ] JWT secrets are strong (min 32 characters)
- [ ] MongoDB credentials are correct
- [ ] Email credentials are valid (App Password for Gmail)
- [ ] `ALLOWED_ORIGINS` includes Vercel URL

### Configuration
- [ ] `NODE_ENV=production` configured
- [ ] `MONGODB_URI` points to production database
- [ ] All API endpoints validated locally
- [ ] Rate limiting tested
- [ ] CORS headers verified

---

## Deployment Steps

### Step 1: Prepare Repository

```bash
# Verify git status
git status

# Ensure all changes committed
git add .
git commit -m "Ready for production deployment"

# Verify no uncommitted changes
git status
```

### Step 2: Environment Variables on Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your SiSurat project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@...` |
| `JWT_SECRET` | Strong random 32+ char value | Generated value |
| `JWT_REFRESH_SECRET` | Strong random 32+ char value | Generated value |
| `EMAIL_USER` | Your Gmail address | `sisurat@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password (16 chars) | App-specific password |
| `NODE_ENV` | `production` | `production` |
| `ALLOWED_ORIGINS` | Vercel URL | `https://sisurat.vercel.app` |
| `LOG_LEVEL` | `info` | `info` |

**Important:** Each variable should be added to **Production**, **Preview**, and **Development** environments.

### Step 3: Deploy to Vercel

**Option A: Via Git Push (Recommended)**
```bash
# Push to main branch (auto-deploys to production)
git push origin main

# Vercel will automatically:
# 1. Build the project
# 2. Run tests (if configured)
# 3. Deploy to production
```

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Vercel will prompt for environment variables
# Select your project and confirm deployment
```

### Step 4: Verify Deployment

1. **Check Build Log:**
   - Go to Vercel Dashboard
   - Click on your project
   - View the deployment log
   - Ensure "✓ Built successfully" appears

2. **Test API Endpoints:**
   ```bash
   # Replace with your Vercel URL
   VERCEL_URL=https://sisurat.vercel.app

   # Test login
   curl -X POST $VERCEL_URL/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'

   # Test health check (should not error)
   curl $VERCEL_URL/api/users
   ```

3. **Check Logs:**
   - Vercel Dashboard → Logs
   - Look for "Server berjalan di..." message
   - Check for any errors

4. **Verify CORS:**
   ```bash
   # Should include CORS headers
   curl -I https://sisurat.vercel.app/api/users
   ```

---

## Post-Deployment

### Monitoring

1. **Set Up Alerts** (Optional):
   - Vercel Dashboard → Settings → Alerts
   - Configure email alerts for deployment failures

2. **Monitor Logs**:
   - Check `logs/error.log` regularly
   - Look for error spikes
   - Monitor rate limiting effectiveness

3. **Database Health**:
   - MongoDB Atlas Dashboard
   - Check connection count
   - Monitor resource usage
   - Review slow queries

### Maintenance

**Weekly:**
- [ ] Review error logs
- [ ] Check rate limit patterns
- [ ] Verify backups are working

**Monthly:**
- [ ] Update dependencies: `npm audit fix`
- [ ] Review security logs
- [ ] Check disk usage
- [ ] Update documentation if needed

**Quarterly:**
- [ ] Rotate JWT secrets
- [ ] Review user access patterns
- [ ] Audit admin actions
- [ ] Performance optimization review

---

## Rollback Procedure

If deployment fails or issues arise:

### Option 1: Revert to Previous Deployment
```bash
# Via Vercel Dashboard:
1. Go to Deployments tab
2. Find the previous successful deployment
3. Click "..." → "Promote to Production"
```

### Option 2: Rollback via Git
```bash
# Find the previous good commit
git log --oneline | head -10

# Revert to previous commit
git revert <commit-hash>

# Push (this will trigger new deployment)
git push origin main
```

### Option 3: Emergency Downtime
```bash
# If database is down or critical issue:
# Temporarily point traffic elsewhere or disable webhook

# Fix the issue locally
git fix...

# Re-deploy when ready
git push origin main
```

---

## Environment Variables Reference

### Required (Production)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `MONGODB_URI` | string | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | string | Access token secret (32+ chars) | Random hex string |
| `JWT_REFRESH_SECRET` | string | Refresh token secret (32+ chars) | Random hex string |
| `EMAIL_USER` | string | Gmail email address | `sisurat@gmail.com` |
| `EMAIL_PASSWORD` | string | Gmail app password (16 chars) | App-specific password |

### Optional (Recommended)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | string | `development` | `production` for Vercel |
| `LOG_LEVEL` | string | `info` | Log verbosity level |
| `ALLOWED_ORIGINS` | string | `http://localhost:5000` | CORS allowed origins |
| `PORT` | number | `5000` | Server port (Vercel sets this) |

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module..."**
```bash
# Run locally to verify
npm install
npm run build

# Check for missing dependencies in package.json
npm list
```

**Solution:**
1. Install missing dependency locally
2. Commit package.json changes
3. Push to trigger new build

### Deployment Succeeds but API Returns 500

**Check logs:**
```bash
# View Vercel logs
vercel logs sisurat --prod

# Look for:
# - MongoDB connection errors
# - Missing environment variables
# - Permission issues
```

**Common Causes:**
1. Missing environment variables
2. Invalid MongoDB connection string
3. Incorrect credentials
4. Network/firewall issues

### Rate Limiting Too Strict

**If users are being rate limited:**
```bash
# Review rate limit config in server/rateLimiters.js
# Adjust window or max as needed
# Re-deploy
```

### Database Connection Timeouts

**Check MongoDB Atlas:**
1. Verify IP whitelist includes Vercel IPs (0.0.0.0/0 for any)
2. Check connection string format
3. Verify credentials are correct
4. Test connection locally first

---

## Performance Tips

1. **Database Optimization:**
   - Add indexes to frequently queried fields
   - Monitor slow queries in MongoDB Atlas
   - Consider connection pooling adjustments

2. **API Response Time:**
   - Enable response caching where appropriate
   - Optimize query projections (select only needed fields)
   - Monitor endpoint performance in logs

3. **File Uploads:**
   - Keep file size limit at 1.5 MB
   - Monitor uploads/ directory size
   - Consider cloud storage (S3) for large scale

---

## Security After Deployment

1. **Monitor Access Logs:**
   - Watch for brute force attempts
   - Monitor rate limit hits
   - Review admin actions

2. **Keep Dependencies Updated:**
   ```bash
   # Monthly
   npm audit
   npm audit fix
   git commit -am "Security: Update dependencies"
   git push origin main
   ```

3. **Rotate Secrets Periodically:**
   - Update JWT secrets every 6 months
   - Update database credentials annually
   - Update email password after Gmail security updates

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Project Security Guide:** See `docs/SECURITY.md`

---

**Last Updated:** 2026-09-10  
**Version:** 1.0  
**Status:** Ready for Production
