# Deployment Guide - Ignite Attendance Management System

## Overview

This guide covers the deployment of the Ignite Attendance Management System to production environments. The system consists of a Node.js backend with PostgreSQL database and a React frontend.

## Prerequisites

### System Requirements
- **Server**: Linux (Ubuntu 20.04+ recommended) or Windows Server
- **Node.js**: Version 18.x or higher
- **PostgreSQL**: Version 14.x or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space
- **Network**: HTTPS-capable domain name

### Required Software
- Git
- Node.js and npm
- PostgreSQL
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## Backend Deployment

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Database Setup

#### Create Database User
```bash
sudo -u postgres psql
```

```sql
CREATE USER ignite_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ignite2026_db OWNER ignite_user;
GRANT ALL PRIVILEGES ON DATABASE ignite2026_db TO ignite_user;
\q
```

#### Configure PostgreSQL
Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = 'localhost'
max_connections = 100
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```
local   ignite2026_db   ignite_user                     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 3. Application Deployment

#### Clone Repository
```bash
cd /opt
sudo git clone <repository-url> ignite2026
sudo chown -R $USER:$USER /opt/ignite2026
cd /opt/ignite2026
```

#### Backend Setup
```bash
cd backend
npm install --production
```

#### Environment Configuration
Create `/opt/ignite2026/backend/.env`:
```env
# Database
DATABASE_URL="postgresql://ignite_user:your_secure_password@localhost:5432/ignite2026_db?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production"

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

#### Database Migration
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

#### PM2 Configuration
Create `/opt/ignite2026/backend/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'ignite2026-backend',
    script: 'src/server.js',
    cwd: '/opt/ignite2026/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/ignite2026/backend-error.log',
    out_file: '/var/log/ignite2026/backend-out.log',
    log_file: '/var/log/ignite2026/backend-combined.log',
    time: true
  }]
}
```

#### Create Log Directory
```bash
sudo mkdir -p /var/log/ignite2026
sudo chown $USER:$USER /var/log/ignite2026
```

#### Start Backend
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Frontend Deployment

### 1. Build Frontend

#### Install Dependencies
```bash
cd /opt/ignite2026/frontend
npm install
```

#### Environment Configuration
Create `/opt/ignite2026/frontend/.env.production`:
```env
VITE_API_URL=https://yourdomain.com/api
```

#### Build Application
```bash
npm run build
```

### 2. Nginx Configuration

#### Install Nginx
```bash
sudo apt install nginx -y
```

#### Create Site Configuration
Create `/etc/nginx/sites-available/ignite2026`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Frontend
    location / {
        root /opt/ignite2026/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 10M;
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/ignite2026 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate Setup

### Using Let's Encrypt

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Auto-renewal
```bash
sudo crontab -e
```

Add:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Security Configuration

### 1. Firewall Setup

#### Configure UFW
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Database Security

#### Secure PostgreSQL
```bash
sudo -u postgres psql
```

```sql
-- Remove default postgres user if not needed
-- ALTER USER postgres PASSWORD 'secure_password';

-- Restrict database access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO ignite_user;
```

### 3. Application Security

#### Secure File Permissions
```bash
sudo chown -R www-data:www-data /opt/ignite2026/frontend/dist
sudo chmod -R 755 /opt/ignite2026/frontend/dist
sudo chmod 600 /opt/ignite2026/backend/.env
```

## Monitoring and Logging

### 1. PM2 Monitoring

#### View Logs
```bash
pm2 logs ignite2026-backend
pm2 monit
```

#### Restart Application
```bash
pm2 restart ignite2026-backend
```

### 2. Nginx Logs

#### Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

#### Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### 3. Database Monitoring

#### PostgreSQL Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## Backup Strategy

### 1. Database Backup

#### Create Backup Script
Create `/opt/ignite2026/scripts/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/ignite2026"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ignite2026_db"
DB_USER="ignite_user"

mkdir -p $BACKUP_DIR

# Create database backup
PGPASSWORD="your_secure_password" pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

#### Make Executable and Schedule
```bash
chmod +x /opt/ignite2026/scripts/backup-db.sh
sudo crontab -e
```

Add:
```
0 2 * * * /opt/ignite2026/scripts/backup-db.sh
```

### 2. Application Backup

#### Create Application Backup Script
Create `/opt/ignite2026/scripts/backup-app.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/ignite2026"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/ignite2026"

mkdir -p $BACKUP_DIR

# Backup application files (excluding node_modules)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".git" \
    -C /opt ignite2026

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: $BACKUP_DIR/app_backup_$DATE.tar.gz"
```

## Updates and Maintenance

### 1. Application Updates

#### Update Process
```bash
cd /opt/ignite2026

# Backup current version
sudo ./scripts/backup-app.sh
sudo ./scripts/backup-db.sh

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install --production
npx prisma generate
npx prisma db push

# Update frontend
cd ../frontend
npm install
npm run build

# Restart services
pm2 restart ignite2026-backend
sudo systemctl reload nginx
```

### 2. System Maintenance

#### Regular Maintenance Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old logs
sudo journalctl --vacuum-time=30d

# Update Node.js packages
cd /opt/ignite2026/backend
npm audit fix

cd /opt/ignite2026/frontend
npm audit fix
```

## Troubleshooting

### 1. Common Issues

#### Backend Not Starting
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs ignite2026-backend

# Check database connection
cd /opt/ignite2026/backend
npx prisma db pull
```

#### Frontend Not Loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check build files
ls -la /opt/ignite2026/frontend/dist
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U ignite_user -d ignite2026_db
```

### 2. Performance Optimization

#### Database Optimization
```sql
-- Analyze database performance
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Nginx Optimization
Add to nginx configuration:
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Scaling Considerations

### 1. Horizontal Scaling

#### Load Balancer Configuration
For multiple backend instances:
```nginx
upstream backend {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

location /api/ {
    proxy_pass http://backend/api/;
    # ... other proxy settings
}
```

### 2. Database Scaling

#### Read Replicas
Consider PostgreSQL read replicas for read-heavy workloads.

#### Connection Pooling
Use PgBouncer for connection pooling:
```bash
sudo apt install pgbouncer -y
```

## Support and Maintenance

### 1. Monitoring Setup

#### Health Check Endpoint
The application provides a health check at `/api/health`.

#### Monitoring Script
Create `/opt/ignite2026/scripts/health-check.sh`:
```bash
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Health check passed"
else
    echo "$(date): Health check failed with status $RESPONSE"
    # Send alert (email, Slack, etc.)
fi
```

### 2. Log Rotation

#### Configure Logrotate
Create `/etc/logrotate.d/ignite2026`:
```
/var/log/ignite2026/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

This deployment guide provides a comprehensive setup for production deployment. Adjust configurations based on your specific requirements and infrastructure setup.