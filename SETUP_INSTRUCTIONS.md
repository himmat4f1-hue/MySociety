# 🚀 Complete Setup Instructions

## पहले पढ़ें: 00_START_HERE.md
उसके बाद यह file पढ़ें।

---

## Step 1: Extract यह File 📂

```bash
unzip MySociety-PostgreSQL-Ready.zip
cd MySociety-PostgreSQL-Ready
```

---

## Step 2: PostgreSQL Install करें 💾

### Windows
```bash
# Download: https://www.postgresql.org/download/windows/
# Run installer
# Keep port: 5432
# Default user: postgres
```

### Mac
```bash
brew install postgresql
brew services start postgresql
```

### Linux
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Step 3: Database Create करें 🗂️

```bash
# PostgreSQL में login करें
psql -U postgres

# Command line में:
CREATE DATABASE mysociety_db;
CREATE USER mysociety_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mysociety_db TO mysociety_user;
\q
```

---

## Step 4: Environment Setup करें ⚙️

```bash
cd backend

# Option 1: Copy और edit करो
cp .env.example.postgresql .env

# Option 2: सीधे create करो
cat > .env << EOF
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mysociety_db
DB_USER=mysociety_user
DB_PASSWORD=your_secure_password

NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_min_32_chars
CLIENT_URL=http://localhost:3000
EOF
```

**पहले .env edit करें:**
```
DB_PASSWORD=आपका password डालो
JWT_SECRET=कोई भी secret key डालो (कम से कम 32 characters)
```

---

## Step 5: Dependencies Install करें 📦

```bash
cd backend
npm install
```

**Expected Output:**
```
added 150 packages
npm notice created a lockfile as package-lock.json
```

---

## Step 6: Models Convert करें (सभी 38) 🔄

```bash
# Project root में जाओ (backend के बाहर)
cd ..

# Python script चलाओ
python3 convert_models.py
```

**Expected Output:**
```
🚀 Starting conversion of 38 models...
Converting: User... ✅ Already converted
Converting: Resident... ✅ Converted
Converting: Society... ✅ Already converted
Converting: Building... ✅ Converted
...
✅ Conversion Complete!
   Converted: 36
   Failed/Skipped: 2
```

---

## Step 7: Controllers Update करें 🔧

यह manually करना पड़ेगा। Guide देखो:

```bash
# Guide खोलो
📖 CONTROLLER_UPDATES.md
```

**क्या बदलना है:**
```javascript
// Example: authController.js में

// ❌ पहले
const user = await User.findOne({ email }).select('+password');

// ✅ अब
const user = await User.findOne({ where: { email } });

// ज़्यादा examples CONTROLLER_UPDATES.md में हैं
```

**Update करने के files:**
- authController.js
- userController.js
- residentController.js
- unitController.js
- buildingController.js
- petController.js
- visitorController.js
- complaintController.js
- maintenanceController.js
- noticeController.js
- meetingController.js
- documentController.js
- invoiceController.js
- transactionController.js
- taskController.js
- amenityController.js
- gatePassController.js
- leaseController.js
- flatOwnerController.js
- familyMemberController.js
- vehicleController.js
- shiftController.js
- homeServiceController.js
- roleChecklistController.js
- cameraRequestController.js
- emergencyController.js
- societyStructureController.js
- dashboardController.js
- genericController.js
- flatPrivateController.js

---

## Step 8: Server चलाओ और Test करो ✅

```bash
cd backend
npm run dev
```

**Expected Output:**
```
PostgreSQL Connected Successfully
Database models synchronized
MySociety API server running on port 5000
```

**Browser में खोलो:**
```
http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "MySociety API running"
}
```

---

## 🎉 Success! अब क्या?

### Frontend भी चलाओ (अलग terminal में)

```bash
cd frontend
npm install
npm run dev
```

```
Frontend running on http://localhost:5173
```

---

## 🚀 Production के लिए (Render पर Deploy)

1. **सब files GitHub पर push करो:**
```bash
git add .
git commit -m "Migrate to PostgreSQL with Sequelize"
git push origin main
```

2. **Render पर जाओ:** https://render.com

3. **New PostgreSQL Service बनाओ**
   - Name: mysociety-db
   - PostgreSQL 15
   - Database: mysociety_db
   - User: mysociety_user
   - Region: Singapore (भारत के लिए)

4. **New Web Service बनाओ**
   - GitHub repo connect करो
   - Root directory: backend
   - Build Command: `npm install`
   - Start Command: `npm start`
   
5. **Environment Variables add करो:**
   ```
   DATABASE_URL=[Render से मिली URL]
   NODE_ENV=production
   JWT_SECRET=[कोई secure secret]
   CLIENT_URL=[frontend URL]
   ```

6. **Deploy करो!** ✅

---

## 📝 Important Files

```
MySociety-PostgreSQL-Ready/
├── 00_START_HERE.md ⭐ (पहले यह पढ़ो)
├── QUICKSTART.md (15 min setup)
├── README_MIGRATION.md (Complete overview)
├── CONTROLLER_UPDATES.md ⭐ (Controllers कैसे update करें)
├── MONGODB_TO_POSTGRESQL.md (Detailed guide)
├── MIGRATION_GUIDE.md (Model conversion)
├── FILES_REFERENCE.md (File guide)
├── SETUP_INSTRUCTIONS.md (यह file)
├── convert_models.py ⭐ (Models convert करने के लिए)
├── backend/
│   ├── config/db.js ✅ (Ready)
│   ├── models/
│   │   ├── User.js ✅
│   │   ├── Society.js ✅
│   │   ├── index.js ✅ (Relationships)
│   │   └── [34 more]
│   ├── server.js ✅ (Ready)
│   ├── package.json ✅ (Ready)
│   ├── .env.example.postgresql ✅
│   ├── controllers/ ⏳ (Update करना है)
│   └── routes/ ✅ (No change)
└── frontend/ ✅ (No change)
```

---

## ⚠️ Common Issues & Solutions

### Error: "Cannot find module 'pg'"
```
✅ Solution: npm install (backend में)
```

### Error: "connect ECONNREFUSED"
```
✅ Solution: PostgreSQL service start करो
psql -U postgres  # Test करो
```

### Error: "database does not exist"
```
✅ Solution: createdb mysociety_db
```

### Error: "column does not exist"
```
✅ Solution: Server restart करो
npm run dev
```

---

## 🧪 Verification Checklist

```
DATABASE
- [ ] PostgreSQL installed
- [ ] Database created
- [ ] Can connect: psql -U postgres -d mysociety_db

BACKEND
- [ ] npm install done
- [ ] .env file configured
- [ ] convert_models.py run
- [ ] Controllers updated (देखो CONTROLLER_UPDATES.md)
- [ ] npm run dev works
- [ ] Health API responding

FRONTEND
- [ ] npm install done
- [ ] npm run dev works
- [ ] Can access http://localhost:5173

PRODUCTION (Optional)
- [ ] GitHub pushed
- [ ] Render service created
- [ ] Database provisioned
- [ ] Environment variables set
- [ ] Deployment successful
```

---

## ⏱️ Timeline

```
Setup:              30 min
Model Conversion:   1 hour (automatic)
Controller Updates: 2-4 hours
Testing:            1 hour
Render Deployment:  30 min
─────────────────────────
Total:              5-8 hours
```

---

## 📖 Documentation Order

1. **00_START_HERE.md** ← Start here
2. **SETUP_INSTRUCTIONS.md** ← You're reading this
3. **QUICKSTART.md** ← Quick reference
4. **CONTROLLER_UPDATES.md** ← Code examples
5. **MONGODB_TO_POSTGRESQL.md** ← Detailed guide
6. **Others** ← As needed

---

## 🎯 Next Steps

1. ✅ Extract ZIP
2. ✅ Install PostgreSQL
3. ✅ Create database
4. ✅ Setup .env
5. ✅ npm install
6. ✅ Run convert_models.py
7. ⏳ Update controllers
8. ✅ Test locally
9. ✅ Deploy to Render

---

## 💡 Tips

- Controllers को एक एक करके update करो और test करो
- Database backup लो production से पहले
- Local में सब test करो Render पर जाने से पहले
- Render logs check करो deployment के बाद

---

## 🆘 Still Stuck?

1. **Setup issue?** → MONGODB_TO_POSTGRESQL.md
2. **Code issue?** → CONTROLLER_UPDATES.md
3. **Model issue?** → MIGRATION_GUIDE.md
4. **File issue?** → FILES_REFERENCE.md
5. **Quick help?** → QUICKSTART.md

---

**Good luck! You've got this! 🚀**
