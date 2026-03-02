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

```ini
[Unit]
Description=Wallet Explorer - Multi-Network Transaction Explorer
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/www/wwwroot/wallet-explorer
Environment="PATH=/root/.cargo/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/root/.cargo/bin/uv run uvicorn backend.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Note:** Adjust the `User`, `Group`, and `PATH` according to your system configuration.

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

**Enable and start the service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable wallet-explorer
sudo systemctl start wallet-explorer

# Check status
sudo systemctl status wallet-explorer
```

---

## Step 4: Configure Nginx in aaPanel

### Option A: Using aaPanel Web Interface

1. **Login to aaPanel** (usually at `http://your-server-ip:7800`)

2. **Go to Website → Add Site**
   - Domain: `your-domain.com` (or use IP address)
   - Root Directory: `/www/wwwroot/wallet-explorer/frontend`
   - PHP Version: Pure static (or disable PHP)

3. **Configure Reverse Proxy:**
   - Click on your site → **Reverse Proxy**
   - Target URL: `http://127.0.0.1:8000`
   - Enable: **YES**
   - Click **Save**

4. **Configure SSL (Recommended):**
   - Go to **SSL** tab
   - Select **Let's Encrypt**
   - Enter your email and apply for certificate
   - Enable **Force HTTPS**

### Option B: Manual Nginx Configuration

If you prefer manual configuration, create/edit the Nginx config file:

```bash
sudo nano /www/server/panel/vhost/nginx/wallet-explorer.conf
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL is setup)
    # return 301 https://$server_name$request_uri;

    # Root directory for static files
    root /www/wwwroot/wallet-explorer/frontend;
    index index.html;

    # Serve static files directly
    location /static/ {
        alias /www/wwwroot/wallet-explorer/frontend/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Serve index.html for root
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

**Test and reload Nginx:**

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 5: Setup SSL Certificate (HTTPS)

### Using aaPanel (Recommended):

1. Go to **Website → Your Site → SSL**
2. Select **Let's Encrypt**
3. Enter your email address
4. Click **Apply**
5. Enable **Force HTTPS**

### Using Certbot (Manual):

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## Step 6: Configure Firewall

Ensure the necessary ports are open:

```bash
# Using UFW (Ubuntu/Debian)
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 7800/tcp  # aaPanel (optional, for remote access)
sudo ufw enable

# Check status
sudo ufw status
```

**In aaPanel:**
- Go to **Security** → Open ports **80** and **443**

---

## Step 7: Verify Deployment

1. **Check service status:**
```bash
sudo systemctl status wallet-explorer
```

2. **Check application logs:**
```bash
sudo journalctl -u wallet-explorer -f
```

3. **Test the application:**
   - Visit: `http://your-domain.com` or `https://your-domain.com`
   - Test wallet validation
   - Test transaction fetching for both ERC and TRC addresses

4. **Test API endpoint:**
```bash
curl http://127.0.0.1:8000/api/health
# Expected: {"status":"healthy"}
```

---

## Step 8: Post-Deployment Configuration

### Set File Permissions

```bash
cd /www/wwwroot/wallet-explorer
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

### Setup Automatic Updates (Optional)

Create a deployment script:

```bash
nano /www/wwwroot/wallet-explorer/deploy.sh
```

Add:

```bash
#!/bin/bash
cd /www/wwwroot/wallet-explorer
git pull origin main
uv sync
sudo systemctl restart wallet-explorer
echo "Deployment complete!"
```

Make executable:

```bash
chmod +x /www/wwwroot/wallet-explorer/deploy.sh
```

---

## Monitoring and Maintenance

### Check Application Logs

```bash
# Real-time logs
sudo journalctl -u wallet-explorer -f

# Last 100 lines
sudo journalctl -u wallet-explorer -n 100

# Logs from today
sudo journalctl -u wallet-explorer --since today
```

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /www/wwwlogs/your-domain.com.log

# Error logs
sudo tail -f /www/wwwlogs/your-domain.com.error.log
```

### Restart Services

```bash
# Restart application
sudo systemctl restart wallet-explorer

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status wallet-explorer
sudo systemctl status nginx
```

### Update Application

```bash
cd /www/wwwroot/wallet-explorer
git pull
uv sync
sudo systemctl restart wallet-explorer
```

---

## Troubleshooting

### Application won't start

1. **Check service status:**
```bash
sudo systemctl status wallet-explorer
sudo journalctl -u wallet-explorer -n 50
```

2. **Verify Python/uv installation:**
```bash
which uv
uv --version
python3 --version
```

3. **Check file permissions:**
```bash
ls -la /www/wwwroot/wallet-explorer
```

### Nginx errors

1. **Test Nginx configuration:**
```bash
sudo nginx -t
```

2. **Check Nginx error logs:**
```bash
sudo tail -f /www/wwwlogs/your-domain.com.error.log
```

### API not responding

1. **Verify backend is running:**
```bash
curl http://127.0.0.1:8000/api/health
```

2. **Check if port 8000 is listening:**
```bash
sudo netstat -tulpn | grep 8000
```

3. **Verify environment variables:**
```bash
cat /www/wwwroot/wallet-explorer/.env
```

---

## Security Checklist

Before going live:

- ✅ **HTTPS enabled** with valid SSL certificate
- ✅ **Firewall configured** (only ports 80, 443, SSH open)
- ✅ **API keys secured** in `.env` file (not in code)
- ✅ **File permissions set** correctly (www-data user/group)
- ✅ **Regular backups** configured in aaPanel
- ✅ **Fail2ban enabled** (optional, prevents brute force)
- ✅ **SSH key authentication** (disable password login)
- ✅ **aaPanel admin password** is strong
- ✅ **Change aaPanel port** (default 7800 → custom port)

---

## Performance Optimization

### Enable caching in Nginx

Add to your Nginx config:

```nginx
# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Monitor Resource Usage

In aaPanel:
- Go to **Monitor** to track CPU, Memory, Disk usage
- Set up alerts for high resource usage

---

## Backup Strategy

### Using aaPanel

1. Go to **Database** → **Backups** (if using a database)
2. Go to **Files** → Create manual backups of `/www/wwwroot/wallet-explorer`
3. Set up **Scheduled Backups** (weekly recommended)

### Manual Backup

```bash
# Backup application files
sudo tar -czf wallet-explorer-backup-$(date +%Y%m%d).tar.gz /www/wwwroot/wallet-explorer

# Backup .env file separately (secure location)
sudo cp /www/wwwroot/wallet-explorer/.env ~/backups/wallet-explorer-env-$(date +%Y%m%d)
```

---

## Cost Estimate

- **Server:** $5-20/month (DigitalOcean, Vultr, Linode)
- **Domain:** $10-15/year
- **aaPanel:** Free
- **SSL Certificate:** Free (Let's Encrypt)
- **API Costs:** Free tier (monitor usage)

**Total:** ~$5-20/month + $10-15/year domain

---

## Conclusion

Your Wallet Explorer is now deployed on aaPanel with Nginx! 🎉

**Next Steps:**
- Monitor application logs for any errors
- Test thoroughly with real wallet addresses
- Set up monitoring and alerts
- Configure automated backups
- Consider adding analytics (optional)

For support or issues, check the logs first using the troubleshooting commands above.
