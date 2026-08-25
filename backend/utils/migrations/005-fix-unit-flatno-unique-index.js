// Unit's unique index changed from (society, flatNo) to
// (society, buildingId, floorId, flatNo) - a society-wide-only constraint
// was too strict: real societies reuse flat numbers across buildings/
// floors constantly (e.g. "101" in both Building A and Building B). This
// caused 500 errors on the Society Setup wizard's bulk CSV import and the
// manual "Add Flat" auto-naming, since both are scoped per floor, not per
// society. Drops the old 2-column unique index; sequelize.sync({alter:true})
// adds the new 4-column one on the next backend restart. No data touched.
module.exports = {
  run: async (sequelize) => {
    await sequelize.query(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN
          SELECT indexname FROM pg_indexes
          WHERE tablename = 'Units'
            AND indexdef ILIKE '%UNIQUE%'
            AND indexdef ILIKE '%society%'
            AND indexdef ILIKE '%flatNo%'
            AND indexdef NOT ILIKE '%buildingId%'
        LOOP
          EXECUTE 'DROP INDEX IF EXISTS "' || r.indexname || '"';
        END LOOP;
      END $$;
    `);
  },
};
