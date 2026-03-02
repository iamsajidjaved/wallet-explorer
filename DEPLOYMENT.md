# 🚀 Deployment Guide

## Deploy to Render.com (Free Hosting)

This guide provides step-by-step instructions for deploying the Wallet Explorer to Render.com with automatic HTTPS and zero configuration.

---

## Why Render.com?

✅ **100% Free** - Free tier with 750 hours/month  
✅ **Auto HTTPS** - Automatic SSL certificates  
✅ **Zero Config** - No server management needed  
✅ **Auto Deploy** - Git push triggers deployment  
✅ **Custom Domains** - Add your own domain for free  
✅ **Fast CDN** - Global content delivery network  

---

## Prerequisites

- **GitHub account** (free)
- **Render.com account** (free) - Sign up at [render.com](https://render.com)
- **Etherscan API key** - Get free key from [etherscan.io/myapikey](https://etherscan.io/myapikey)
- **TronGrid API key** (already included in project)

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Wallet Explorer"

# Create main branch
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/wallet-explorer.git

# Push to GitHub
git push -u origin main
```

**Note:** Replace `yourusername/wallet-explorer` with your actual GitHub repository.

---

## Step 2: Create Render Web Service

1. **Go to Render Dashboard:**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

2. **Connect GitHub Repository:**
   - Click **"Connect account"** if first time
   - Authorize Render to access your repositories
   - Find and select your `wallet-explorer` repository
   - Click **"Connect"**

3. **Configure Web Service:**

   Fill in the following settings:

   | Field | Value |
   |-------|-------|
   | **Name** | `wallet-explorer` (or your preferred name) |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Root Directory** | Leave empty |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install uv && uv sync` |
   | **Start Command** | `uv run uvicorn backend.main:app --host 0.0.0.0 --port 10000` |

4. **Select Instance Type:**
   - Choose **"Free"** plan
   - Free tier provides 750 hours/month (enough for 24/7 uptime)

---

## Step 3: Add Environment Variables

In the Render dashboard, scroll down to **"Environment Variables"** section:

Click **"Add Environment Variable"** and add the following:

### Required Variables:

| Key | Value |
|-----|-------|
| `ETHERSCAN_API_KEY` | Your new Etherscan API key |
| `TRONGRID_API_KEY` | `b2b6f96d-d95b-463c-aca5-fd2aee67da9d` |
| `HOST` | `0.0.0.0` |
| `PORT` | `10000` |

**Important:** 
- Get your Etherscan API key from [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
- The TronGrid API key is already provided (free tier)

---

## Step 4: Deploy

1. **Click "Create Web Service"** button at the bottom

2. **Wait for deployment** (usually 2-5 minutes)
   - Render will automatically:
     - Clone your repository
     - Install dependencies (`uv sync`)
     - Start the application
     - Provision SSL certificate
     - Assign a public URL

3. **Monitor deployment logs** in real-time
   - You'll see build progress
   - Any errors will appear here

4. **Access your application:**
   - Once deployed, you'll get a URL like: `https://wallet-explorer.onrender.com`
   - Click the URL to open your application

---

## Step 5: Verify Deployment

Test your deployed application:

1. **Visit your Render URL** (e.g., `https://wallet-explorer.onrender.com`)

2. **Test wallet validation:**
   - Enter an ERC wallet address: `0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae`
   - Click "Get Transactions"
   - Verify transactions load properly

3. **Test TRC wallet:**
   - Go back and enter TRC address: `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7`
   - Click "Get Transactions"
   - Verify transactions display

4. **Test API health:**
   - Visit: `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"healthy"}`

---

## Step 6: Custom Domain (Optional)

Add your own domain name to your Render app:

1. **In Render Dashboard:**
   - Go to your web service
   - Click **"Settings"** tab
   - Scroll to **"Custom Domains"**
   - Click **"Add Custom Domain"**

2. **Enter your domain:**
   - Example: `wallet.yourdomain.com`
   - Render will provide DNS instructions

3. **Update DNS records:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add CNAME record:
     ```
     Type: CNAME
     Name: wallet (or your subdomain)
     Value: wallet-explorer.onrender.com
     ```

4. **Wait for SSL:**
   - Render automatically provisions SSL certificate
   - Usually takes 5-10 minutes
   - Your custom domain will have HTTPS automatically

---

## Automatic Updates

Render automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Updated feature"
git push origin main

# Render detects the push and automatically redeploys
```

**Deployment happens automatically** - no manual steps needed!

---

## Monitoring and Logs

### View Application Logs

1. **In Render Dashboard:**
   - Click your web service
   - Go to **"Logs"** tab
   - View real-time application logs

2. **Filter logs:**
   - Use the search box to filter
   - Download logs if needed

### Monitor Performance

1. **Go to "Metrics" tab:**
   - View CPU usage
   - Memory consumption
   - Request rates
   - Response times

### Set Up Alerts

1. **Go to "Settings":**
   - Scroll to **"Deploy Notifications"**
   - Add your email
   - Get notified on deploy success/failure

---

## Troubleshooting

### Build Failed

**Check build logs:**
- Look for Python/dependency errors
- Ensure `pyproject.toml` is correct
- Verify uv installation command

**Common fixes:**
```bash
# If uv install fails, update build command to:
pip install --upgrade pip && pip install uv && uv sync
```

### Application Not Starting

**Check start command:**
- Ensure port is `10000` (Render's default)
- Verify command: `uv run uvicorn backend.main:app --host 0.0.0.0 --port 10000`

**Check environment variables:**
- Verify all required env vars are set
- Check for typos in variable names

### API Keys Not Working

**Etherscan API:**
- Ensure you're using a NEW API key (V2 compatible)
- Get new key from: [etherscan.io/myapikey](https://etherscan.io/myapikey)
- Old API keys won't work with V2 endpoint

**TronGrid API:**
- Should work with provided key
- If issues, get new free key from [trongrid.io](https://www.trongrid.io)

### Free Tier Limitations

**Render Free Tier includes:**
- 750 hours/month (enough for 24/7)
- Automatic sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up

**To keep app always active (paid tier):**
- Upgrade to Starter plan ($7/month)
- No sleep, faster performance

---

## Performance Optimization

### Keep Free Tier Active

Set up external monitoring to ping your app:

**UptimeRobot** (free):
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor for your Render URL
3. Set interval to 5 minutes
4. App stays awake during monitored hours

### Enable Gzip Compression

Already enabled in the FastAPI app for better performance.

### Cache Static Assets

Render automatically caches static files with CDN.

---

## Security Best Practices

✅ **HTTPS:** Automatically enabled by Render  
✅ **Environment Variables:** Never commit API keys to Git  
✅ **CORS:** Already configured in backend  
✅ **Input Validation:** Already implemented  
✅ **API Rate Limiting:** Monitor API usage  

---

## Cost Breakdown

### Free Tier (Current Setup)
- **Render:** $0/month (750 hours free)
- **Domain:** $0 (use Render subdomain)
- **SSL:** $0 (automatic)
- **APIs:** $0 (free tier)

**Total: $0/month** 🎉

### Paid Tier (For Production)
- **Render Starter:** $7/month
  - No sleep
  - 512MB RAM
  - Better performance
- **Custom Domain:** $10-15/year
- **SSL:** $0 (still automatic)

**Total: ~$7/month** for professional deployment

---

## Backup and Rollback

### Automatic Git Backups
Your code is always backed up on GitHub.

### Rollback to Previous Version

1. **In Render Dashboard:**
   - Go to **"Events"** tab
   - See all previous deployments
   - Click **"Rollback"** on any deployment
   - App reverts to that version instantly

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push -f origin main
```

---

## Scaling (Future)

When your app grows:

1. **Upgrade to Starter Plan** ($7/month)
   - No sleep
   - Always fast
   - Better performance

2. **Add Redis Caching:**
   - Use Render's Redis addon
   - Cache API responses
   - Reduce external API calls

3. **Horizontal Scaling:**
   - Render Pro plan
   - Multiple instances
   - Load balancing

---

## Alternative: Self-Hosting

If you prefer to self-host instead of Render:

### Quick Setup with Docker

```bash
# Pull and run
docker run -d \
  -p 8000:8000 \
  -e ETHERSCAN_API_KEY=your_key \
  -e TRONGRID_API_KEY=your_key \
  wallet-explorer
```

### VPS Deployment

Popular VPS providers:
- **DigitalOcean:** $6/month
- **Linode:** $5/month
- **Vultr:** $5/month

---

## Support Resources

### Official Documentation
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **FastAPI Docs:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **uv Docs:** [docs.astral.sh/uv](https://docs.astral.sh/uv/)

### API Documentation
- **Etherscan API:** [docs.etherscan.io](https://docs.etherscan.io)
- **TronGrid API:** [developers.tron.network](https://developers.tron.network)

### Community Support
- **Render Community:** [community.render.com](https://community.render.com)
- **GitHub Issues:** Report bugs in your repository

---

## Maintenance Checklist

### Weekly
- ✅ Check Render logs for errors
- ✅ Monitor API usage (Etherscan/TronGrid)
- ✅ Test application functionality

### Monthly
- ✅ Update dependencies: `uv sync --upgrade`
- ✅ Review Render metrics
- ✅ Check for security updates

### Quarterly
- ✅ Review API costs and limits
- ✅ Test backup/rollback procedures
- ✅ Update documentation if needed

---

## Next Steps After Deployment

1. **Share your app:**
   - Copy your Render URL
   - Share with users or clients
   - Add to your portfolio

2. **Add custom domain:**
   - Purchase domain name
   - Configure DNS
   - Professional branding

3. **Monitor usage:**
   - Track visitor stats
   - Monitor API calls
   - Optimize performance

4. **Collect feedback:**
   - Add user feedback form
   - Iterate on features
   - Improve user experience

---

## Conclusion

Your Wallet Explorer is now live on Render.com! 🎉

**What you get for FREE:**
- ✅ Production-ready hosting
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deployments from Git
- ✅ 24/7 uptime (with monitoring)

**Your app URL:**
- `https://wallet-explorer.onrender.com`

**Start exploring transactions across Ethereum and Tron networks!** 🚀

---

## Quick Reference

### Useful Commands

```bash
# Update code and deploy
git add .
git commit -m "Update"
git push origin main

# Check deployment status
# (Visit Render dashboard)

# View logs
# (Render dashboard → Logs tab)
```

### Important Links

- **Render Dashboard:** [dashboard.render.com](https://dashboard.render.com)
- **Get Etherscan API Key:** [etherscan.io/myapikey](https://etherscan.io/myapikey)
- **Get TronGrid API Key:** [trongrid.io](https://www.trongrid.io)

---

**Happy Deploying! 🚀**
