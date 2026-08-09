# SOCIETY MANAGEMENT SYSTEM - QUICK START GUIDE

**Version:** 1.0.0  
**Setup Time:** 15-30 minutes  
**Status:** Production-Ready

---

## 🚀 QUICK START (5 MINUTES)

### Option 1: Using Docker (Recommended - Easiest)

```bash
# 1. Download project (assuming already downloaded)
cd society-management-system

# 2. Copy environment file
cp config/.env.example .env

# 3. Edit .env with your configuration
nano .env

# 4. Start all services
docker-compose up -d

# 5. Access applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
# Database Admin: http://localhost:5050 (PgAdmin)
# Monitoring: http://localhost:3001 (Grafana)
```

### Option 2: Manual Setup (For Development)

```bash
# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend Setup
cd ../frontend
npm install

# Database Setup (separate terminal)
createdb society_management
psql society_management < ../database/schema.sql

# Start Backend (Terminal 1)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Start Frontend (Terminal 2)
cd frontend
npm run dev

# Start Redis (Terminal 3)
redis-server

# Start Celery Worker (Terminal 4)
cd backend
celery -A tasks worker --loglevel=info
```

---

## 📥 DOWNLOAD & DIRECTORY STRUCTURE

### Complete Project Contents

```
society-management-system/
├── backend/                      # FastAPI Backend (Python)
│   ├── main.py                  # Application entry point
│   ├── requirements.txt          # Python dependencies
│   ├── routes/                   # API endpoints
│   ├── services/                 # Business logic
│   ├── database/                 # Models & connections
│   ├── schemas/                  # Pydantic models
│   └── logs/                     # Application logs
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API calls
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   ├── schema.sql               # Complete database schema
│   ├── seed_data.sql            # Initial test data
│   └── migrations/              # Database migrations
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── config/
│   ├── .env.example             # Environment template
│   ├── nginx.conf               # Reverse proxy config
│   └── prometheus.yml           # Monitoring config
│
├── docs/
│   ├── API_DOCUMENTATION.md     # Complete API reference
│   ├── SETUP_GUIDE.md          # Detailed setup
│   ├── DATABASE_SCHEMA.md      # DB documentation
│   └── DEPLOYMENT.md           # Deployment guide
│
├── README.md                    # Main documentation
├── FEATURES_CHECKLIST.md        # 140+ features list
├── QUICK_START.md              # This file
└── LICENSE
```

---

## ⚙️ CONFIGURATION

### 1. Environment Variables (.env)

```bash
# Copy template
cp config/.env.example .env

# Edit with your settings
nano .env
```

**Essential Configuration:**

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/society_management

# JWT Security
SECRET_KEY=change-this-to-a-strong-random-string
JWT_SECRET_KEY=change-this-to-another-strong-random-string

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_key_from_razorpay
RAZORPAY_KEY_SECRET=your_secret_from_razorpay

# Twilio (SMS Provider)
TWILIO_ACCOUNT_SID=your_sid_from_twilio
TWILIO_AUTH_TOKEN=your_token_from_twilio

# Email
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. PostgreSQL Setup

```bash
# Create database
createdb society_management

# Optional: Create user
createuser admin
psql -U postgres -d postgres -c "ALTER USER admin WITH PASSWORD 'password123';"

# Load schema
psql -U admin -d society_management < database/schema.sql

# Load test data (optional)
psql -U admin -d society_management < database/seed_data.sql
```

### 3. Redis Setup

```bash
# Start Redis server
redis-server

# Verify connection
redis-cli ping
# Should output: PONG
```

---

## 📊 DEFAULT CREDENTIALS

After initial setup, use these credentials to log in:

```
Admin User:
Email: admin@societymanagement.com
Password: Admin@123456

Treasurer:
Email: treasurer@societymanagement.com
Password: Treasurer@123456

Member:
Email: member1@societymanagement.com
Password: Member@123456

Security:
Email: security@societymanagement.com
Password: Security@123456
```

⚠️ **Change these credentials immediately in production!**

---

## 🔍 VERIFY INSTALLATION

### Check Backend

```bash
# In browser or curl
curl http://localhost:8000/api/health

# Expected response:
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

### Check Frontend

```bash
# Access in browser
http://localhost:3000
# or http://localhost:5173 (if using Vite)
```

### Check API Documentation

```
http://localhost:8000/api/docs
# Swagger UI with all endpoints
```

### Check Database

```bash
# Connect to database
psql -U admin -d society_management

# List tables
\dt

# Check specific table
SELECT * FROM societies LIMIT 1;
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Connection refused to PostgreSQL"

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Verify connection
psql -U postgres
```

### Issue 2: "Redis connection error"

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Start Redis if needed
redis-server

# In Docker:
docker-compose up -d redis
```

### Issue 3: "Port 8000 already in use"

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

### Issue 4: "Docker container won't start"

**Solution:**
```bash
# Check logs
docker-compose logs backend

# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose restart
```

### Issue 5: "Module not found errors"

**Solution:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## 📱 ACCESSING THE APPLICATION

### Local Development

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | See default credentials |
| Backend API | http://localhost:8000 | Use JWT token |
| API Docs | http://localhost:8000/api/docs | Public |
| Database GUI | http://localhost:5050 | admin/admin |
| Monitoring | http://localhost:3001 | admin/admin |

### First Login

1. Open http://localhost:3000
2. Click "Login"
3. Use admin credentials
4. Complete onboarding wizard
5. Create your society profile

---

## 🔄 COMMON WORKFLOWS

### Create a New Society

```bash
# 1. Admin login
# 2. Navigate to Settings → Societies
# 3. Click "Create New Society"
# 4. Fill details:
#    - Society Name
#    - Registration Number
#    - Address
#    - Contact Information
# 5. Click "Create"
```

### Add Members

```bash
# 1. Login as Admin
# 2. Go to Members → Add Member
# 3. Enter member details
# 4. Upload documents
# 5. Set unit assignment
# 6. Click "Invite Member"
```

### Generate Maintenance Bill

```bash
# 1. Login as Treasurer
# 2. Go to Financial → Bills
# 3. Click "Generate Bills"
# 4. Select month and year
# 5. Review charges
# 6. Click "Generate"
```

### Process Payment

```bash
# 1. Member logs in
# 2. Go to Payments
# 3. View outstanding bills
# 4. Click "Pay Now"
# 5. Complete payment via Razorpay
```

---

## 🚀 DEPLOYMENT TO PRODUCTION

### Prepare for Production

```bash
# 1. Update .env with production values
ENVIRONMENT=production
DEBUG_MODE=False
SECRET_KEY=strong-random-key

# 2. Enable HTTPS
# Get SSL certificate from Let's Encrypt
certbot certonly --standalone -d yourdomain.com

# 3. Update nginx.conf
# Point to your domain

# 4. Run database migrations
cd backend
alembic upgrade head

# 5. Collect static files
python manage.py collectstatic

# 6. Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy to Render

```bash
# 1. Connect GitHub to Render
# 2. Create new Web Service
# 3. Select repository
# 4. Configure environment:
#    - Build Command: ./scripts/build.sh
#    - Start Command: gunicorn main:app
# 5. Add PostgreSQL database
# 6. Connect and deploy
```

### Deploy to AWS

```bash
# Create EC2 instance
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type t3.medium

# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install and run
./scripts/setup.sh
docker-compose up -d
```

---

## 📚 DOCUMENTATION

Detailed documentation in `/docs`:

- **API_DOCUMENTATION.md** - Complete API reference
- **SETUP_GUIDE.md** - Detailed installation instructions  
- **DATABASE_SCHEMA.md** - Database structure explanation
- **DEPLOYMENT.md** - Production deployment guide
- **USER_GUIDE.md** - End-user manual
- **ARCHITECTURE.md** - System architecture

---

## 🆘 GET HELP

### Resources

1. **Documentation** - See `/docs` folder
2. **API Docs** - Visit `/api/docs` (Swagger UI)
3. **GitHub Issues** - Report bugs
4. **Community** - Forum discussions

### Common Commands

```bash
# View logs
docker-compose logs -f backend

# Database backup
pg_dump society_management > backup.sql

# Database restore
psql society_management < backup.sql

# Update dependencies
pip install -r backend/requirements.txt --upgrade
npm update --all

# Run tests
pytest backend/tests/ -v
npm test

# Clean up Docker
docker-compose down -v
```

---

## ✅ NEXT STEPS

1. **Read the Documentation**
   - Start with `README.md`
   - Review `FEATURES_CHECKLIST.md`

2. **Explore the API**
   - Visit `http://localhost:8000/api/docs`
   - Test endpoints

3. **Configure Your Setup**
   - Update `.env` with your credentials
   - Setup your society profile

4. **Customize Features**
   - Enable/disable features as needed
   - Configure charges and rules
   - Setup payment gateway

5. **Deploy to Production**
   - Follow deployment guide in `/docs`
   - Setup SSL certificate
   - Configure domain
   - Enable monitoring

---

## 📞 SUPPORT

- **Email:** support@societymanagement.com
- **Docs:** https://docs.societymanagement.com
- **Issues:** GitHub Issues
- **Chat:** Community Discord

---

## 🎉 YOU'RE READY!

The complete Society Management System is now ready to use. 

**Next: Read the full README.md for complete documentation.**

```bash
# View full documentation
cat README.md
```

---

**Happy managing! 🚀**
