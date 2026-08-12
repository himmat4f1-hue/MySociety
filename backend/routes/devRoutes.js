const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const runSeed = require('../utils/seed');

// Lets you (re)seed the deployed database from a button in the app instead of
// needing Shell/SSH access (which Render's free plan doesn't include).
//
// Protected by a shared secret so a random visitor can't wipe your data:
// set SEED_SECRET as an environment variable on the backend service, then
// send the same value in the "x-seed-secret" header (the frontend button
// asks you to type it in). If SEED_SECRET isn't set at all, this route
// refuses to run - so it's off by default until you deliberately turn it on.
//
// WARNING: this WIPES all existing data and replaces it with fresh demo data
// - same as running `npm run seed` locally. Don't leave SEED_SECRET set (or
// this route enabled) on a real production deployment with real data in it.
//
// @route POST /api/dev/seed
router.post(
  '/seed',
  asyncHandler(async (req, res) => {
    const expected = process.env.SEED_SECRET;
    if (!expected) {
      return res.status(403).json({ message: 'Seeding is disabled. Set SEED_SECRET as an environment variable on the backend to enable this.' });
    }
    const provided = req.headers['x-seed-secret'];
    if (provided !== expected) {
      return res.status(401).json({ message: 'Incorrect seed secret.' });
    }

    const result = await runSeed();
    res.json({ message: 'Database seeded successfully.', ...result });
  })
);

module.exports = router;
