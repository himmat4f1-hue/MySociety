// Same story as 001, one level deeper: (meeting, user, role) still wasn't
// enough - the same login can hold TWO memberships with the SAME role
// (e.g. Resident/Owner of two different flats), so flatId needs to be part
// of the uniqueness too. Drops the old 3-column unique index;
// sequelize.sync({ alter: true }) adds the new 4-column
// (meeting, user, role, flatId) one on the next backend restart. No data
// touched.
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
            AND indexdef ILIKE '%role%'
            AND indexdef NOT ILIKE '%flatId%'
        LOOP
          EXECUTE 'DROP INDEX IF EXISTS "' || r.indexname || '"';
        END LOOP;
      END $$;
    `);
  },
};
