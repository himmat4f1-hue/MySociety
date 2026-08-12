# 🚀 MySociety: MongoDB → PostgreSQL Migration

## 📌 Project Overview

यह document आपके **MySociety** backend project को **MongoDB से PostgreSQL** में migrate करने के लिए complete guide है।

---

## 🎯 What's Been Done

### ✅ Phase 1 - Setup (Complete)

1. **Package.json Updated**
   - Mongoose हटाया गया
   - Sequelize + PostgreSQL drivers add किए गए
   - Migration scripts add किए गए

2. **Database Configuration Updated**
   - `config/db.js` - Sequelize setup के साथ

3. **Models Converted (Examples)**
   - `User.js` - पूरी तरह converted ✅
   - `Society.js` - पूरी तरह converted ✅
   - `models/index.js` - Relationships setup

4. **Environment Files**
   - `.env.example.postgresql` created

---

## 📚 Documentation Created

### 1. **MONGODB_TO_POSTGRESQL.md**
   - Complete step-by-step migration guide
   - Database setup instructions
   - Render deployment guide
   - Troubleshooting section

### 2. **CONTROLLER_UPDATES.md**
   - Query patterns comparison (Mongoose vs Sequelize)
   - Real-world examples
   - Controllers update guide
   - Pagination, relationships, transactions

### 3. **MIGRATION_GUIDE.md**
   - Overview of changes
   - Installation steps
   - Model conversion pattern
   - Data migration help

---

## 🔧 Tools Provided

### 1. **convert_models.py**
   ```bash
   python3 convert_models.py
   ```
   - Automatically converts all Mongoose models to Sequelize
   - Handles type mapping
   - Preserves field configurations

### 2. **Updated Files**
   ```
   backend/
   ├── config/db.js ✅
   ├── models/
   │   ├── User.js ✅
   │   ├── Society.js ✅
   │   └── index.js ✅ (relationships)
   ├── server.js ✅
   └── package.json ✅
   ```

---

## 🚀 Quick Start (4 Steps)

### Step 1: Install Dependencies
```bash
cd MySociety/backend
npm install
```

### Step 2: Setup PostgreSQL
```bash
# Create database
createdb mysociety_db

# Create .env file
cp .env.example.postgresql .env
# Edit .env with your database credentials
```

### Step 3: Convert All Models
```bash
cd /home/claude
python3 convert_models.py
```

### Step 4: Test Locally
```bash
cd MySociety/backend
npm run dev
```

---

## 📋 Implementation Checklist

### Database Setup
- [ ] PostgreSQL install किया
- [ ] Database create किया
- [ ] .env file configure किया

### Code Migration
- [ ] `npm install` complete
- [ ] Models converted (python script से)
- [ ] Controllers updated (CONTROLLER_UPDATES.md के अनुसार)
- [ ] Relationships verified
- [ ] Routes tested

### Deployment
- [ ] Local testing complete
- [ ] GitHub push किया
- [ ] Render account setup किया
- [ ] PostgreSQL database provisioned
- [ ] Environment variables set
- [ ] Web service deployed

---

## 🗂️ File Structure

```
MySociety/
├── backend/
│   ├── config/
│   │   └── db.js ✅ (Sequelize configuration)
│   ├── models/
│   │   ├── User.js ✅ (Converted example)
│   │   ├── Society.js ✅ (Converted example)
│   │   ├── index.js ✅ (All relationships)
│   │   └── [36 more models] ⏳ (To be converted)
│   ├── controllers/
│   │   └── [All files] (Need query updates)
│   ├── routes/
│   │   └── [No changes needed]
│   ├── package.json ✅
│   ├── server.js ✅
│   └── .env.example.postgresql ✅
│
├── frontend/
│   └── [No changes needed]
│
└── Documentation/
    ├── MONGODB_TO_POSTGRESQL.md
    ├── CONTROLLER_UPDATES.md
    ├── MIGRATION_GUIDE.md
    └── README_MIGRATION.md (this file)
```

---

## 📖 Documentation Guide

### For Database Setup
👉 Read: **MONGODB_TO_POSTGRESQL.md**
- PostgreSQL installation
- Database creation
- Render deployment

### For Model Migration
👉 Read: **MIGRATION_GUIDE.md**
- Model conversion pattern
- UUID vs ObjectId
- Relationships

### For Code Updates
👉 Read: **CONTROLLER_UPDATES.md**
- Query syntax changes
- Real-world examples
- Best practices

---

## 🔑 Key Concepts

### 1. Sequelize vs Mongoose

| Feature | Mongoose | Sequelize |
|---------|----------|-----------|
| Database | MongoDB | PostgreSQL |
| Type | ODM | ORM |
| Queries | `find()` | `findAll()` |
| Get by ID | `findById()` | `findByPk()` |
| Create | `create()` | `create()` |
| Update | `save()` | `update()` |
| Delete | `deleteOne()` | `destroy()` |

### 2. ID Strategy

**Pहले:** MongoDB ObjectId
```javascript
_id: ObjectId
```

**अब:** UUID (Recommended)
```javascript
id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true
}
```

### 3. Relationships

```javascript
// One-to-Many
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Many-to-Many
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });
```

---

## 🛠️ Common Tasks

### Add a New Field to Model

**पहले (Mongoose):**
```javascript
userSchema.add({ age: { type: Number } });
```

**अब (Sequelize):**
```javascript
age: {
  type: DataTypes.INTEGER,
  allowNull: true
}
```

### Add Validation

**पहले (Mongoose):**
```javascript
userSchema.path('email').validate(validator.isEmail, 'Invalid email');
```

**अब (Sequelize):**
```javascript
email: {
  type: DataTypes.STRING,
  validate: {
    isEmail: true
  }
}
```

### Add Custom Method

**पहले (Mongoose):**
```javascript
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};
```

**अब (Sequelize):**
```javascript
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};
```

---

## 🚨 Important Notes

### Before Running Python Script
1. ✅ `backend/config/db.js` updated है
2. ✅ `backend/package.json` updated है
3. ✅ `npm install` complete है

### After Running Python Script
1. ✅ सभी models verify करें
2. ✅ Controllers update करें
3. ✅ Routes test करें
4. ⚠️ Complex relationships manually check करें

### Before Deploying
1. ✅ Local में सब test किया
2. ✅ GitHub push किया
3. ✅ Render में सब setup किया

---

## 📞 Troubleshooting

### Error: "Cannot find module 'mongoose'"
```
✅ Solution: npm install चलाया?
```

### Error: "connect ECONNREFUSED"
```
✅ Solution: PostgreSQL service चल रही है?
```

### Error: "column does not exist"
```
✅ Solution: Models sync नहीं हुए? 
→ Server restart करें
```

---

## 🔗 Useful Resources

- **Sequelize Docs:** https://sequelize.org/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Render Docs:** https://render.com/docs
- **Migration Examples:** See CONTROLLER_UPDATES.md

---

## ✅ Next Steps (Priority Order)

### Immediate (Today)
- [ ] `python3 convert_models.py` चलाएं
- [ ] Generated models check करें
- [ ] `npm install` करें

### Short Term (This Week)
- [ ] Controllers update करें
- [ ] Local में test करें
- [ ] Relationships verify करें

### Medium Term (This Month)
- [ ] Data migration (अगर है तो)
- [ ] Staging में deploy करें
- [ ] Performance test करें

### Production
- [ ] GitHub push
- [ ] Render deployment
- [ ] Production testing
- [ ] Monitor logs

---

## 🎯 Success Criteria

✅ आपका project migrate होगा जब:

1. **Database**
   - PostgreSQL running
   - All tables created
   - Data accessible

2. **Code**
   - All models converted
   - Controllers updated
   - No Mongoose references

3. **Testing**
   - Local API working
   - All endpoints responding
   - No errors in logs

4. **Deployment**
   - Render deployment successful
   - Production database synced
   - Live API accessible

---

## 📊 Migration Timeline

```
Phase 1: Setup ✅ (Today)
├── Dependencies updated
├── Config files updated
└── Example models converted

Phase 2: Implementation ⏳ (1-2 days)
├── Run python conversion script
├── Update controllers
└── Verify relationships

Phase 3: Testing ⏳ (1 day)
├── Local testing
├── Unit tests
└── Integration tests

Phase 4: Deployment ⏳ (1-2 days)
├── GitHub push
├── Render setup
└── Production deployment

Total: ~1 week for complete migration
```

---

## 🎓 Learning Resources

यह migration के दौरान सीखने का अवसर है:

1. **PostgreSQL** - Relational databases
2. **Sequelize** - Node.js ORM
3. **Render** - Platform-as-a-Service
4. **DevOps** - Deployment strategies

---

## 💡 Pro Tips

1. **Backup पहले लें**
   ```bash
   # MongoDB से backup
   mongodump --out /backup
   ```

2. **Migration को stages में करें**
   - पहले एक model fully migrate करो
   - फिर उसे test करो
   - फिर बाकी सब करो

3. **Git में commit करो**
   ```bash
   git add .
   git commit -m "Migrate Model X to Sequelize"
   ```

4. **Performance metrics track करो**
   - Query time
   - Database size
   - Response time

---

## 🏁 Final Checklist

```
BEFORE STARTING
- [ ] All documentation read
- [ ] Backup taken
- [ ] PostgreSQL installed

DURING MIGRATION
- [ ] Dependencies updated
- [ ] Models converted
- [ ] Controllers updated
- [ ] Local testing done

AFTER MIGRATION
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Git pushed
- [ ] Deployed to Render

POST DEPLOYMENT
- [ ] Monitoring setup
- [ ] Error tracking enabled
- [ ] Database backups automated
- [ ] Team trained
```

---

## 🎉 You're All Set!

अब आप migration शुरू कर सकते हो। सभी documentation पढ़ें और step by step follow करें।

**Questions? Issues?**
- Check MONGODB_TO_POSTGRESQL.md
- Check CONTROLLER_UPDATES.md
- Check MIGRATION_GUIDE.md

---

**Happy Migrating! 🚀**

*Last Updated: 2026-08-12*
