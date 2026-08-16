// MeetingAttendance's unique index changed from (meeting, user) to
// (meeting, user, role) so the same login can join a meeting under more
// than one membership (e.g. Secretary AND a flat's Resident/Owner).
// sequelize.sync({ alter: true }) added the new 3-column index but left the
// old 2-column one in place, which still blocked that second join. This
// finds and drops ONLY that old index - nothing else, no data touched.
module.exports = {
  run: async (sequelize) => {
    await sequelize.query(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN
          SELECT indexname FROM pg_indexes
          WHERE tablename = 'MeetingAttendances'
            AND indexdef ILIKE '%UNIQUE%'
            AND indexdef ILIKE '%meeting%'
            AND indexdef ILIKE '%user%'
            AND indexdef NOT ILIKE '%role%'
        LOOP
          EXECUTE 'DROP INDEX IF EXISTS "' || r.indexname || '"';
        END LOOP;
      END $$;
    `);
  },
};
