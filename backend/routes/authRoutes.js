const express = require('express');
const router = express.Router();
const {
  registerSociety,
  loginUser,
  guestLogin,
  getMe,
  getMySocieties,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register-society', registerSociety);
router.post('/login', loginUser); // progressive: send { email, password, societyId?, role?, flatId? }
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/my-societies', protect, getMySocieties);

module.exports = router;
