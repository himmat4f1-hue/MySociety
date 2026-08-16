const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const runSeed = require('../utils/seed');
const { runPendingFixes } = require('../utils/migrations');

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

// Applies any pending, non-destructive schema fixes (see utils/migrations/)
// - the safe alternative to /seed for when sequelize.sync({alter:true})
// alone can't finish a schema change (e.g. dropping an old constraint a
// later model change replaced). NEVER touches data, only schema. Safe to
// call repeatedly: already-applied fixes are tracked and skipped.
//
// @route POST /api/dev/migrate
router.post(
  '/migrate',
  asyncHandler(async (req, res) => {
    const expected = process.env.SEED_SECRET;
    if (!expected) {
      return res.status(403).json({ message: 'This is disabled. Set SEED_SECRET as an environment variable on the backend to enable this.' });
    }
    const provided = req.headers['x-seed-secret'];
    if (provided !== expected) {
      return res.status(401).json({ message: 'Incorrect secret.' });
    }

    const result = await runPendingFixes();
    res.json({
      message: result.applied.length ? `Applied ${result.applied.length} fix(es): ${result.applied.join(', ')}` : 'Already up to date - nothing to apply.',
      ...result,
    });
  })
);

module.exports = router;
