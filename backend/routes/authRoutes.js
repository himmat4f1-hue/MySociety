const express = require('express');
const router = express.Router();
const {
  registerSociety,
  loginUser,
  switchAccount,
  requestOtp,
  verifyOtp,
  guestLogin,
  getMe,
  updateMyPhoto,
  getMySocieties,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register-society', registerSociety);
router.post('/login', loginUser); // legacy email/password login - kept for internal use, no longer used by the login screen
router.post('/request-otp', requestOtp); // { phone } -> sends (demo: returns) an OTP
router.post('/verify-otp', verifyOtp); // { phone, otp } -> logs in, or { phone, otp, membershipId } to complete after picking an account
router.post('/switch', protect, switchAccount); // { membershipId } - switch the current session without re-entering anything
router.post('/guest', guestLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me/photo', protect, updateMyPhoto);
router.get('/my-societies', protect, getMySocieties);

module.exports = router;
