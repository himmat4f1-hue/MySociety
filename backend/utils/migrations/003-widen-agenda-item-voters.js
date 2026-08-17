// AgendaItem.voters used to store bare user UUIDs. It now stores composite
// "user:role:flatId" MEMBERSHIP keys (see utils/membership.js) so the same
// login's different memberships (e.g. Resident of two flats, or Secretary
// + a Resident) are tracked - and can each vote - separately. A plain
// UUID[] column can't hold those composite strings, so this widens the
// column type.
//
// Old UUID-only entries can't be reinterpreted as membership keys, so this
// also clears any votes cast before this fix. Vote COUNTS already
// recorded in voteOptions are untouched (nothing here changes tallies) -
// only the internal "who's already voted" dedupe list resets, meaning
// anyone who voted before this fix could vote once more after it.
//
// Guarded with an existence check: on a brand-new database this runs
// BEFORE the AgendaItems table has ever been created (this fix runs prior
// to sequelize.sync in config/db.js, precisely so a mismatched column type
// can't make sync itself crash the server on every boot) - in that case
// there's nothing to alter yet, and sync will create the table with the
// correct (already-STRING[]) type on its own.
module.exports = {
  run: async (sequelize) => {
    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AgendaItems') THEN
          ALTER TABLE "AgendaItems"
          ALTER COLUMN voters TYPE varchar(255)[] USING ARRAY[]::varchar(255)[];
        END IF;
      END $$;
    `);
  },
};

