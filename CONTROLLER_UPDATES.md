# 🔄 Controllers Update Guide: Mongoose → Sequelize

## 📌 Overview

Controllers में database queries को Mongoose से Sequelize में convert करना है।

---

## 🔍 Query Patterns Comparison

### 1. FIND OPERATIONS

#### Single Document

```javascript
// ❌ MONGOOSE
const user = await User.findById(userId);
const user = await User.findOne({ email: 'user@test.com' });

// ✅ SEQUELIZE
const user = await User.findByPk(userId);
const user = await User.findOne({ where: { email: 'user@test.com' } });
```

#### Multiple Documents

```javascript
// ❌ MONGOOSE
const users = await User.find({ role: 'admin' });
const users = await User.find().limit(10).skip(5);
const users = await User.find({}).sort({ createdAt: -1 });

// ✅ SEQUELIZE
const users = await User.findAll({ where: { role: 'admin' } });
const users = await User.findAll({ limit: 10, offset: 5 });
const users = await User.findAll({ order: [['createdAt', 'DESC']] });
```

#### With Relationships (Populate)

```javascript
// ❌ MONGOOSE
const resident = await Resident.findById(id).populate('userId');
const residents = await Resident.find().populate('societyId').populate('userId');

// ✅ SEQUELIZE
const resident = await Resident.findByPk(id, { include: 'user' });
const residents = await Resident.findAll({ 
  include: ['society', 'user'] 
});
```

#### Count Documents

```javascript
// ❌ MONGOOSE
const count = await User.countDocuments({ role: 'admin' });

// ✅ SEQUELIZE
const count = await User.count({ where: { role: 'admin' } });
```

---

### 2. CREATE OPERATIONS

```javascript
// ❌ MONGOOSE
const newUser = await User.create({
  name: 'John',
  email: 'john@test.com',
  password: 'hashed_password'
});

// ✅ SEQUELIZE (same syntax!)
const newUser = await User.create({
  name: 'John',
  email: 'john@test.com',
  password: 'hashed_password'
});
```

#### Bulk Create

```javascript
// ❌ MONGOOSE
const users = await User.insertMany([
  { name: 'John', email: 'john@test.com' },
  { name: 'Jane', email: 'jane@test.com' }
]);

// ✅ SEQUELIZE
const users = await User.bulkCreate([
  { name: 'John', email: 'john@test.com' },
  { name: 'Jane', email: 'jane@test.com' }
]);
```

---

### 3. UPDATE OPERATIONS

#### Update One

```javascript
// ❌ MONGOOSE
const user = await User.findByIdAndUpdate(id, { name: 'Jane' }, { new: true });
// OR
const user = await User.findById(id);
user.name = 'Jane';
await user.save();

// ✅ SEQUELIZE
const user = await User.findByPk(id);
await user.update({ name: 'Jane' });
// OR
await User.update({ name: 'Jane' }, { where: { id } });
```

#### Update Many

```javascript
// ❌ MONGOOSE
await User.updateMany({ role: 'admin' }, { status: 'active' });

// ✅ SEQUELIZE
await User.update(
  { status: 'active' },
  { where: { role: 'admin' } }
);
```

---

### 4. DELETE OPERATIONS

#### Delete One

```javascript
// ❌ MONGOOSE
await User.findByIdAndDelete(id);
await user.deleteOne();

// ✅ SEQUELIZE
await User.destroy({ where: { id } });
// OR
await user.destroy();
```

#### Delete Many

```javascript
// ❌ MONGOOSE
await User.deleteMany({ role: 'temp' });

// ✅ SEQUELIZE
await User.destroy({ where: { role: 'temp' } });
```

---

## 📊 Complex Queries

### Query with Conditions

```javascript
// ❌ MONGOOSE
const users = await User.find({
  $and: [
    { role: 'admin' },
    { status: 'active' },
    { createdAt: { $gte: startDate } }
  ]
});

// ✅ SEQUELIZE
const { Op } = require('sequelize');
const users = await User.findAll({
  where: {
    [Op.and]: [
      { role: 'admin' },
      { status: 'active' },
      { createdAt: { [Op.gte]: startDate } }
    ]
  }
});
```

### OR Conditions

```javascript
// ❌ MONGOOSE
const users = await User.find({
  $or: [
    { role: 'admin' },
    { role: 'secretary' }
  ]
});

// ✅ SEQUELIZE
const { Op } = require('sequelize');
const users = await User.findAll({
  where: {
    [Op.or]: [
      { role: 'admin' },
      { role: 'secretary' }
    ]
  }
});
```

### IN Operator

```javascript
// ❌ MONGOOSE
const users = await User.find({ id: { $in: userIds } });

// ✅ SEQUELIZE
const { Op } = require('sequelize');
const users = await User.findAll({
  where: { id: { [Op.in]: userIds } }
});
```

---

## 📋 Real-World Examples

### Example 1: User Login Controller

**❌ पुरानी (Mongoose):**
```javascript
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**✅ नया (Sequelize):**
```javascript
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Example 2: Get All Residents

**❌ पुरानी (Mongoose):**
```javascript
exports.getAllResidents = async (req, res) => {
  try {
    const { societyId } = req.query;
    const residents = await Resident.find({ societyId })
      .populate('userId', 'name email phone')
      .populate('societyId', 'name slug')
      .sort({ createdAt: -1 });
    
    res.json({ residents, count: residents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**✅ नया (Sequelize):**
```javascript
exports.getAllResidents = async (req, res) => {
  try {
    const { societyId } = req.query;
    const residents = await Resident.findAll({
      where: { societyId },
      include: [
        { association: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { association: 'society', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ residents, count: residents.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Example 3: Update Resident Status

**❌ पुरानी (Mongoose):**
```javascript
exports.updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const resident = await Resident.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    res.json({ resident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**✅ नया (Sequelize):**
```javascript
exports.updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const resident = await Resident.findByPk(id);
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    await resident.update({ status });
    
    res.json({ resident });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Example 4: Pagination

**❌ पुरानी (Mongoose):**
```javascript
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ role })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments({ role });
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**✅ नया (Sequelize):**
```javascript
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;
    
    const { rows, count } = await User.findAndCountAll({
      where: { role },
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users: rows,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## ⚙️ Operators Reference

```javascript
const { Op } = require('sequelize');

// Comparison Operators
{
  [Op.eq]: value          // =
  [Op.ne]: value          // !=
  [Op.gte]: value         // >=
  [Op.gt]: value          // >
  [Op.lte]: value         // <=
  [Op.lt]: value          // <
  [Op.like]: '%value%'    // LIKE
  [Op.in]: [values]       // IN
  [Op.notIn]: [values]    // NOT IN
  [Op.between]: [a, b]    // BETWEEN
}

// Logical Operators
{
  [Op.and]: [...]         // AND
  [Op.or]: [...]          // OR
  [Op.not]: value         // NOT
}
```

---

## 🔄 Migration Checklist

**Backend Controllers:**
- [ ] authController.js
- [ ] userController.js
- [ ] residentController.js
- [ ] unitController.js
- [ ] societyStructureController.js
- [ ] dashboardController.js
- [ ] genericController.js
- [ ] flatPrivateController.js

**Check for:**
- [ ] `findById()` → `findByPk()`
- [ ] `findOne({})` → `findOne({ where: {} })`
- [ ] `find()` → `findAll()`
- [ ] `.populate()` → `include`
- [ ] `.save()` → `.update()`
- [ ] `.deleteOne()` → `.destroy()`
- [ ] `.countDocuments()` → `.count()`

---

## 🚀 Tips & Tricks

### 1. Import Sequelize Operators
```javascript
// हर file के top में
const { Op } = require('sequelize');
```

### 2. Pagination Helper
```javascript
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};
```

### 3. Error Handling
```javascript
try {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  // operations...
} catch (error) {
  res.status(500).json({ error: error.message });
}
```

### 4. Transaction Support
```javascript
const t = await sequelize.transaction();
try {
  await User.update({ status: 'active' }, { 
    where: { id },
    transaction: t 
  });
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}
```

---

## 📝 Files to Update

Ye सभी files को update करना है:

```
backend/controllers/
├── authController.js
├── userController.js
├── residentController.js
├── unitController.js
├── buildingController.js
├── petController.js
├── visitorController.js
├── complaintController.js
├── maintenanceController.js
├── noticeController.js
├── meetingController.js
├── documentController.js
├── invoiceController.js
├── transactionController.js
├── taskController.js
├── amenityController.js
├── gatePassController.js
├── leaseController.js
├── flatOwnerController.js
├── familyMemberController.js
├── vehicleController.js
├── shiftController.js
├── homeServiceController.js
├── roleChecklistController.js
├── cameraRequestController.js
├── emergencyController.js
├── societyStructureController.js
├── dashboardController.js
├── genericController.js
└── flatPrivateController.js
```

---

## ✅ Testing

```javascript
// Controller test example
const request = require('supertest');
const app = require('../server');

describe('User Controller', () => {
  test('GET /api/users should return all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
```

---

**Happy Coding! 🚀**
