const express = require('express');
const router = express.Router();
const {
  registerSociety,
  checkSocietyAvailability,
  registerSendOtp,
  registerVerifyOtp,
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

// Society Registration wizard (public, no auth):
//   1. check-society-availability -> { available }
//   2. register/send-otp, register/verify-otp -> mobile verification
//   3. (frontend fetches GET /api/plans and "pays" - no real payment yet)
//   4. register-society -> creates Society + Secretary account + Membership
router.post('/check-society-availability', checkSocietyAvailability);
router.post('/register/send-otp', registerSendOtp);
router.post('/register/verify-otp', registerVerifyOtp);
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
