# ⚡ Quick Start Guide (15 minutes)

## 🎯 Goal
MongoDB से PostgreSQL में migrate करना है

---

## 📦 What You Have

```
MySociety-PostgreSQL-Migration/
├── backend_updated/          👈 Updated backend files
│   ├── config/db.js         ✅ Ready
│   ├── models/User.js       ✅ Ready
│   ├── models/Society.js    ✅ Ready
│   ├── models/index.js      ✅ Ready
│   ├── server.js            ✅ Ready
│   ├── package.json         ✅ Ready
│   └── .env.example.postgresql ✅ Ready
├── convert_models.py        👈 Automatic model converter
├── README_MIGRATION.md       👈 Complete documentation
├── MONGODB_TO_POSTGRESQL.md  👈 Detailed guide
├── CONTROLLER_UPDATES.md     👈 Code update examples
└── MIGRATION_GUIDE.md        👈 Step by step
```

---

## 🚀 Do This Now (In Order)

### Step 1: Copy Project (2 min)
```bash
# Replace your MySociety backend with backend_updated
cp -r backend_updated/* your-project/backend/
```

### Step 2: Install Dependencies (3 min)
```bash
cd your-project/backend
npm install
```

### Step 3: Setup PostgreSQL (5 min)

**Windows/Mac/Linux:**
```bash
# Create database
createdb mysociety_db

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mysociety_db
DB_USER=postgres
DB_PASSWORD=your_password

NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret_key
EOF
```

### Step 4: Convert All Models (3 min)
```bash
# Run the Python converter
python3 convert_models.py

# Check output
✅ Converted: 38
```

### Step 5: Update Controllers (2-4 hours - Detailed guide मिलेगी)
👉 See **CONTROLLER_UPDATES.md**

### Step 6: Test Locally
```bash
npm run dev
# Server should start without errors
```

---

## ✅ Verification

Open browser and go to:
```
http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MySociety API running"
}
```

---

## 📚 Next: Read Documentation

1️⃣ **First time?**
   👉 Read: `README_MIGRATION.md` (10 min overview)

2️⃣ **Database setup issues?**
   👉 Read: `MONGODB_TO_POSTGRESQL.md` (detailed guide)

3️⃣ **Need to update controllers?**
   👉 Read: `CONTROLLER_UPDATES.md` (query examples)

4️⃣ **Full step by step?**
   👉 Read: `MIGRATION_GUIDE.md` (complete walkthrough)

---

## 🚨 Common Issues & Quick Fixes

### ❌ "Cannot find module pg"
```
✅ Fix: npm install (किया?)
```

### ❌ "connect ECONNREFUSED"
```
✅ Fix: PostgreSQL running है?
psql -U postgres -c "SELECT version();"
```

### ❌ "Database mysociety_db does not exist"
```
✅ Fix: createdb mysociety_db
```

### ❌ "column does not exist"
```
✅ Fix: Server restart करो, models sync होंगे
```

---

## 📝 Critical Changes

**Main queries बदल गए हैं:**

```javascript
// ❌ पहले (Mongoose)
const user = await User.findById(id);

// ✅ अब (Sequelize)  
const user = await User.findByPk(id);
```

More examples in `CONTROLLER_UPDATES.md`

---

## 🎯 30-Min Checklist

- [ ] `npm install` complete
- [ ] PostgreSQL database created
- [ ] `.env` file configured
- [ ] `convert_models.py` run successfully
- [ ] Local server starts without errors
- [ ] Health check API working

---

## 🔗 Next Steps

**When ready for Render deployment:**
1. Finish controller updates
2. Read `MONGODB_TO_POSTGRESQL.md` (Render section)
3. Deploy to Render.com

---

## 💬 Questions?

Sab answers हैं documentation में:
- `README_MIGRATION.md` - Overall guide
- `MONGODB_TO_POSTGRESQL.md` - Detailed setup
- `CONTROLLER_UPDATES.md` - Code examples
- `MIGRATION_GUIDE.md` - Step by step

---

**You got this! 🚀**
