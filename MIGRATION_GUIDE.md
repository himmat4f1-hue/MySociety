# MongoDB to PostgreSQL Migration Guide

## 📋 Overview
Yeh guide aapke MySociety project ko MongoDB se PostgreSQL mein migrate karne ke liye hai.

**Changes:**
- ✅ Mongoose → Sequelize ORM
- ✅ MongoDB → PostgreSQL
- ✅ Render ke liye ready

---

## 🚀 Step 1: Installation

```bash
cd backend
npm install
```

Yeh command automatically install karega:
- `pg` - PostgreSQL driver
- `sequelize` - ORM
- `pg-hstore` - JSON support

---

## 🗄️ Step 2: PostgreSQL Setup

### Local Development:
```bash
# PostgreSQL install karien (agar already nahi hai)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# PostgreSQL service start karien
# Windows: Start "PostgreSQL X.X"
# Mac: brew services start postgresql
# Linux: sudo service postgresql start

# Database create karien
psql -U postgres
CREATE DATABASE mysociety_db;
```

### Render Deployment:
1. Render.com par account banayein
2. New PostgreSQL database create karien
3. Connection string copy karien
4. Environment variables set karien (dekhen Step 3)

---

## 🔐 Step 3: Environment Variables

`.env` file create karien:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mysociety_db
DB_USER=postgres
DB_PASSWORD=your_password

# OR for Render (external database):
DATABASE_URL=postgresql://user:password@host:port/dbname

NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret_key
```

---

## 📝 Step 4: Model Conversion

### Conversion Pattern:

**MongoDB (Mongoose):**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }
});
module.exports = mongoose.model('User', userSchema);
```

**PostgreSQL (Sequelize):**
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, { timestamps: true });

module.exports = User;
```

---

## 🔄 Step 5: Controller Updates

### Query Changes:

| Operation | Mongoose | Sequelize |
|-----------|----------|-----------|
| Find One | `User.findOne({email})` | `User.findOne({where: {email}})` |
| Find All | `User.find()` | `User.findAll()` |
| Create | `User.create(data)` | `User.create(data)` |
| Update | `await user.save()` | `await user.update(data)` |
| Delete | `await user.deleteOne()` | `await user.destroy()` |

### Example:

**Pehle (Mongoose):**
```javascript
const user = await User.findById(id);
user.name = 'New Name';
await user.save();
```

**Ab (Sequelize):**
```javascript
const user = await User.findByPk(id);
await user.update({ name: 'New Name' });
```

---

## 🆔 ID Strategy

**Pehle:** MongoDB automatic ObjectId use karti thi
**Ab:** UUID use kar rahe hain (recommended for PostgreSQL)

Agar ObjectId ke saath references hain, toh update karien:

```javascript
// Pehle
plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }

// Ab
planId: {
  type: DataTypes.UUID,
  references: {
    model: 'Plans',
    key: 'id'
  }
}
```

---

## 🔀 Relationships

### One-to-Many:
```javascript
// User has many Residents
User.hasMany(Resident, { foreignKey: 'userId' });
Resident.belongsTo(User, { foreignKey: 'userId' });
```

### Many-to-Many:
```javascript
const UserRole = sequelize.define('UserRole', {}, { timestamps: false });
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });
```

---

## 🚀 Step 6: Server Update

**backend/server.js** update karien:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
// Routes import karien

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connect
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// ... other routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🌱 Step 7: Data Migration

Agar pehle se MongoDB mein data tha:

```bash
# Purana data export karien (MongoDB se)
mongoexport --db old_db --collection users --out users.json

# Naye database mein import karien
node utils/migrate-data.js
```

---

## 🧪 Step 8: Testing

```bash
# Dev mode mein chalayen
npm run dev

# Tests run karien
npm test
```

---

## 🚀 Step 9: Render Deployment

### 1. GitHub push karien:
```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

### 2. Render.com par:
1. New Web Service create karien
2. GitHub repository connect karien
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables add karien:
   - `DATABASE_URL` (Render database se)
   - `NODE_ENV=production`
   - `JWT_SECRET`

### 3. PostgreSQL Database:
1. New PostgreSQL database create karien
2. Connection string Render service ko de

---

## ⚠️ Common Issues & Solutions

### Issue 1: "connect ECONNREFUSED"
**Solution:** PostgreSQL service start ho gaya? Check karien.

### Issue 2: "column does not exist"
**Solution:** Models sync ho gaye? Pehle database tables clear karien:
```bash
npm run migrate:undo  # Agar migrations use kar rahe ho
```

### Issue 3: Foreign key error
**Solution:** Relationships properly define karien models mein:
```javascript
User.hasMany(Post, { foreignKey: 'userId' });
```

### Issue 4: UUID vs Integer ID
**Solution:** Agar Integer chahiye, change karien:
```javascript
id: {
  type: DataTypes.INTEGER,
  autoIncrement: true,
  primaryKey: true,
}
```

---

## 📝 Files Modified

✅ `backend/package.json` - Dependencies update
✅ `backend/config/db.js` - Sequelize configuration
✅ `backend/models/User.js` - Example converted model
✅ `backend/.env.example.postgresql` - Environment template

---

## 🔗 Useful Resources

- Sequelize Docs: https://sequelize.org/
- PostgreSQL: https://www.postgresql.org/docs/
- Render Docs: https://render.com/docs
- Data Types: https://sequelize.org/docs/v6/other-topics/data-types/

---

## ✅ Checklist

- [ ] PostgreSQL install aur running
- [ ] npm install complete
- [ ] .env file configured
- [ ] All models converted to Sequelize
- [ ] Controllers updated
- [ ] Routes test karien
- [ ] Database migration complete
- [ ] GitHub push karien
- [ ] Render deployment setup karien
- [ ] Live testing

---

## 📞 Help

Agar koi issue ho:
1. Error message pढ़ें carefully
2. Browser console check karien
3. Database tables exist kar rahe hain verify karien
4. Sequelize logs enable karien (DB_LOG=true)

---

**Happy coding! 🚀**
