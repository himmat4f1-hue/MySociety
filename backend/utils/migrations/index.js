const fs = require('fs');
const path = require('path');
const { sequelize } = require('../../config/db');

// A lightweight alternative to `npm run seed` for schema-only corrections.
//
// sequelize.sync({ alter: true }) (see config/db.js) happily ADDS new
// columns/indexes when a model changes, but it will NOT drop or replace an
// old conflicting constraint/index - that has to be done by hand. Rather
// than sending a one-off SQL snippet through chat every time that happens,
// each such fix gets dropped in this folder as its own small file, and can
// be applied from the /seed-database page's "Run Pending Fixes" button (or
// POST /api/dev/migrate) - same auth as seeding, but 100% non-destructive:
// it only ever alters schema, never touches a row of your data, and
// already-applied fixes are automatically skipped, so it's always safe to
// click again "just in case" after pulling in new backend code.
//
// Each file in this folder (other than this one) exports { run(sequelize) }.

const ensureTrackingTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "SchemaFixes" (
      name TEXT PRIMARY KEY,
      "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

const runPendingFixes = async () => {
  await ensureTrackingTable();

  const [appliedRows] = await sequelize.query('SELECT name FROM "SchemaFixes"');
  const alreadyApplied = new Set(appliedRows.map((r) => r.name));

  const files = fs
    .readdirSync(__dirname)
    .filter((f) => f.endsWith('.js') && f !== 'index.js')
    .sort(); // filenames are numbered (001-, 002-, ...) so this is also run order

  const applied = [];
  const skipped = [];
  const failed = [];

  for (const file of files) {
    if (alreadyApplied.has(file)) {
      skipped.push(file);
      continue;
    }
    const migration = require(path.join(__dirname, file));
    try {
      await migration.run(sequelize);
      await sequelize.query('INSERT INTO "SchemaFixes" (name) VALUES (:name)', { replacements: { name: file } });
      applied.push(file);
    } catch (err) {
      // Never let one bad/premature migration (e.g. one that targets a
      // table that doesn't exist yet on a brand-new database) crash the
      // whole batch or, worse, the server boot that calls this. Log it and
      // leave it un-recorded so it's retried next time (next restart, or
      // the next "Run Pending Fixes" click) - by then the table it needs
      // will usually exist.
      console.error(`Schema fix "${file}" failed, will retry later:`, err.message);
      failed.push({ file, error: err.message });
    }
  }

  return { applied, skipped, failed };
};

module.exports = { runPendingFixes };
