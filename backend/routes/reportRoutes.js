const express = require('express');
const router = express.Router();
const { getManagementPerformance, getFinancialStatements } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/management-performance', protect, getManagementPerformance);
router.get('/financial-statements', protect, getFinancialStatements);

module.exports = router;
