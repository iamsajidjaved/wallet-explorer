# 🚀 Deployment Guide

## Production Deployment Options

This guide covers multiple deployment strategies for the Wallet Explorer.

---

## Option 1: Deploy to Render.com (Recommended - Free)

### Prerequisites:
- GitHub account
- Render.com account (free tier available)

### Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Wallet Explorer"
   git branch -M main
   git remote add origin https://github.com/yourusername/wallet-explorer.git
   git push -u origin main
   ```

2. **Create Render Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: wallet-explorer
     Environment: Python 3
     Build Command: uv sync
     Start Command: uv run uvicorn backend.main:app --host 0.0.0.0 --port 10000
     ```

3. **Add Environment Variables:**
   In Render dashboard, add:
   ```
   ETHERSCAN_API_KEY=57S8N2GK4D8ZEW4T4MC3QFD6G9FQRFP1PF
   TRONGRID_API_KEY=b2b6f96d-d95b-463c-aca5-fd2aee67da9d
   HOST=0.0.0.0
   PORT=10000
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for automatic deployment
   - Access at: `https://wallet-explorer.onrender.com`

**✅ Free tier includes:**
- Automatic SSL certificate
- Custom domain support
- Auto-deploy on git push
- 750 hours/month free

---

## Option 2: Deploy to Railway.app

### Steps:

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Initialize Project:**
   ```bash
   cd wallet-explorer
   railway init
   ```

3. **Add Environment Variables:**
   ```bash
   railway variables set ETHERSCAN_API_KEY=57S8N2GK4D8ZEW4T4MC3QFD6G9FQRFP1PF
   railway variables set TRONGRID_API_KEY=b2b6f96d-d95b-463c-aca5-fd2aee67da9d
   ```

4. **Create Procfile:**
   ```bash
   echo "web: uv run uvicorn backend.main:app --host 0.0.0.0 --port $PORT" > Procfile
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

**✅ Includes:**
- $5/month free credits
- Automatic HTTPS
- Custom domains
- Database options

---

## Option 3: Deploy to Vercel (Serverless)

Vercel requires some modifications for serverless deployment.

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "builds": [
       {
         "src": "backend/main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "backend/main.py"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add ETHERSCAN_API_KEY
   vercel env add TRONGRID_API_KEY
   ```

**Note:** Vercel free tier has limitations on execution time (10s max).

---

## Option 4: Deploy to AWS (EC2)

For more control and scalability.

### Steps:

1. **Launch EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier eligible)
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **SSH into Instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies:**
   ```bash
   # Install uv
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Clone repository
   git clone https://github.com/yourusername/wallet-explorer.git
   cd wallet-explorer
   
   # Install dependencies
   uv sync
   ```

4. **Configure Environment:**
   ```bash
   nano .env
   # Add your API keys
   ```

5. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

6. **Configure Nginx:**
   Create `/etc/nginx/sites-available/wallet-explorer`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

7. **Create Systemd Service:**
   Create `/etc/systemd/system/wallet-explorer.service`:
   ```ini
   [Unit]
   Description=Wallet Explorer
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/wallet-explorer
   ExecStart=/home/ubuntu/.cargo/bin/uv run uvicorn backend.main:app --host 127.0.0.1 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

8. **Start Service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable wallet-explorer
   sudo systemctl start wallet-explorer
   ```

9. **Setup SSL (Optional but Recommended):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 5: Docker Deployment

### Create Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY . .

# Install dependencies
RUN uv sync

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Create docker-compose.yml:

```yaml
version: '3.8'

services:
  wallet-explorer:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}
      - TRONGRID_API_KEY=${TRONGRID_API_KEY}
      - HOST=0.0.0.0
      - PORT=8000
    restart: unless-stopped
```

### Deploy:
```bash
docker-compose up -d
```

---

## Environment Variables Checklist

For any deployment, ensure these are set:

```env
# Required
ETHERSCAN_API_KEY=your_etherscan_key
TRONGRID_API_KEY=your_trongrid_key

# Optional (with defaults)
HOST=0.0.0.0
PORT=8000
```

---

## Post-Deployment Checklist

After deployment, verify:

- ✅ Health endpoint responds: `https://your-domain.com/api/health`
- ✅ Main page loads: `https://your-domain.com/`
- ✅ Wallet validation works
- ✅ Transactions load from both networks
- ✅ All filters function correctly
- ✅ CSV export downloads
- ✅ External links work (Etherscan/TronScan)
- ✅ No console errors in browser (F12)
- ✅ SSL certificate is valid (if HTTPS)

---

## Performance Optimization

### For Production:

1. **Enable Gzip Compression:**
   Add to FastAPI app:
   ```python
   from fastapi.middleware.gzip import GZipMiddleware
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   ```

2. **Add Caching:**
   ```python
   from fastapi_cache import FastAPICache
   from fastapi_cache.backends.redis import RedisBackend
   ```

3. **Rate Limiting:**
   ```python
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   ```

4. **Database for Transaction History:**
   Consider adding PostgreSQL or MongoDB to cache results

---

## Monitoring

### Add Health Checks:

Most platforms support automatic health checks:

**Endpoint:** `/api/health`
**Expected Response:** `{"status": "healthy"}`
**Interval:** 30 seconds
**Timeout:** 10 seconds

### Logging:

Add structured logging:
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("wallet-explorer")
```

### Error Tracking:

Consider integrating:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay
- [DataDog](https://www.datadoghq.com/) for APM

---

## Scaling Considerations

### When traffic grows:

1. **Add Redis Caching:**
   - Cache API responses for 5-10 minutes
   - Reduce API calls to Etherscan/TronGrid

2. **Horizontal Scaling:**
   - Deploy multiple instances behind load balancer
   - Use managed services (AWS ECS, Google Cloud Run)

3. **Database:**
   - Store transaction history
   - Reduce API dependency

4. **CDN:**
   - Serve static files (CSS, JS) from CloudFlare or AWS CloudFront
   - Faster global load times

---

## Cost Estimates

### Free Tier Options:
- **Render.com:** Free (750 hours/month)
- **Railway:** $5 credit/month (usually enough for small apps)
- **Vercel:** Free (with limits)
- **AWS EC2:** Free tier (12 months, t2.micro)

### Paid Tier (for production):
- **Render:** $7/month (starter)
- **Railway:** $5-20/month (pay as you go)
- **AWS EC2:** $5-10/month (t2.small)
- **DigitalOcean:** $6/month (basic droplet)

### API Costs:
- **Etherscan:** Free tier (5 calls/sec) - Upgrade if needed
- **TronGrid:** Free tier included - Monitor usage

---

## Security Checklist

Before going live:

- ✅ **HTTPS enabled** (SSL certificate)
- ✅ **API keys in environment variables** (not in code)
- ✅ **CORS properly configured** (restrict origins if needed)
- ✅ **Rate limiting enabled** (prevent abuse)
- ✅ **Input validation** (already implemented)
- ✅ **Error messages don't leak sensitive info**
- ✅ **Regular dependency updates** (`uv sync --upgrade`)
- ✅ **Firewall rules configured** (if self-hosting)

---

## Backup Strategy

### For production:

1. **Code backups:** GitHub (already done)
2. **Database backups:** If using a database, enable automated backups
3. **Environment variables:** Store securely (1Password, AWS Secrets Manager)
4. **API keys:** Keep backups in secure vault

---

## Support & Maintenance

### Regular tasks:

- **Weekly:** Check logs for errors
- **Monthly:** Update dependencies (`uv sync --upgrade`)
- **Quarterly:** Review API usage and costs
- **Yearly:** Renew SSL certificates (if not auto-renewed)

---

## Troubleshooting Deployment Issues

### Common issues:

1. **Port binding error:**
   - Ensure `HOST=0.0.0.0` for cloud deployments
   - Check firewall rules

2. **API keys not working:**
   - Verify environment variables are set
   - Check for typos in variable names

3. **Static files not loading:**
   - Verify `frontend/` directory is deployed
   - Check file permissions

4. **CORS errors:**
   - Update allowed origins in `backend/main.py`

---

## Next Steps After Deployment

1. **Custom Domain:**
   - Purchase domain (GoDaddy, Namecheap)
   - Configure DNS records
   - Update SSL certificate

2. **Analytics:**
   - Add Google Analytics
   - Track usage patterns
   - Monitor performance

3. **SEO:**
   - Add meta tags
   - Create sitemap
   - Submit to Google Search Console

4. **User Feedback:**
   - Add feedback form
   - Monitor user behavior
   - Iterate on features

---

## Conclusion

Choose deployment option based on:

- **Budget:** Render/Railway for free/cheap hosting
- **Control:** AWS EC2 for full control
- **Simplicity:** Render for easiest deployment
- **Scale:** AWS/GCP for enterprise needs

The application is **production-ready** and can be deployed immediately to any of these platforms! 🚀
