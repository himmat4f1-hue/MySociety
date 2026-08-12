const express = require('express');
const router = express.Router();
const { getOverview, getSecretaryOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, getOverview);
router.get('/secretary', protect, getSecretaryOverview);

module.exports = router;
