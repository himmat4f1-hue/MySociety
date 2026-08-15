const express = require('express');
const Fund = require('../models/Fund');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { protect } = require('../middleware/auth');
const { rolesFor, requirePermission } = require('../config/permissions');
const fundController = require('../controllers/fundController');

const router = express.Router();

// IMPORTANT: these custom routes must be registered BEFORE the generic
// /:id CRUD routes below, otherwise Express would match "/celebrations" as
// if "celebrations" were a Fund id (see unitRoutes.js for the same pattern).

// @route GET /api/funds/celebrations
router.get('/celebrations', protect, fundController.listCelebrations);

// @route GET/POST /api/funds/:id/collections, DELETE /api/funds/:id/collections/:txnId
router.get('/:id/collections', protect, fundController.listCollections);
router.post('/:id/collections', protect, requirePermission('funds', 'create'), fundController.addCollection);
router.delete('/:id/collections/:txnId', protect, requirePermission('funds', 'delete'), fundController.deleteCollection);

// @route GET/POST /api/funds/:id/expenses, DELETE /api/funds/:id/expenses/:txnId
router.get('/:id/expenses', protect, fundController.listExpenses);
router.post('/:id/expenses', protect, requirePermission('funds', 'create'), fundController.addExpense);
router.delete('/:id/expenses/:txnId', protect, requirePermission('funds', 'delete'), fundController.deleteExpense);

// @route GET /api/funds/:id/summary
router.get('/:id/summary', protect, fundController.summary);

// Plain Fund CRUD (list/create/update/delete Funds & Celebrations) - panel 1.
router.use('/', makeCrudRouter(Fund, { searchFields: ['title', 'type'] }, rolesFor('funds')));

module.exports = router;
