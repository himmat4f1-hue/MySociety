const express = require('express');
const router = express.Router();
const {
  registerSociety,
  loginUser,
  switchAccount,
  guestLogin,
  getMe,
  getMySocieties,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register-society', registerSociety);
router.post('/login', loginUser); // send { email, password }; if multiple accounts, send { email, password, membershipId } next
router.post('/switch', protect, switchAccount); // { membershipId } - switch the current session without re-entering a password
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/my-societies', protect, getMySocieties);

module.exports = router;
