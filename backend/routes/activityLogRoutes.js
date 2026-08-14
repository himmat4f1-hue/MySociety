const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const makeCrudRouter = require('../utils/makeCrudRouter');

// Read-only (no create/update/delete routes exposed - entries are written
// internally via utils/auditLog.js only). Secretary/Chairman can view;
// nobody can write through this API.
const crud = makeCrudRouter(ActivityLog, { searchFields: ['resourceType', 'userName'] }, { read: ['secretary', 'chairman'], write: [] });

module.exports = crud;
