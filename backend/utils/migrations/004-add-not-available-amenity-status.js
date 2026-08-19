// Amenity.status gained a new allowed value ('Not Available'), alongside
// the existing Available / Under Maintenance / Out of Service. Postgres
// ENUM types can't have a value added via a plain ALTER COLUMN the way
// sequelize.sync({alter:true}) handles other column changes - it needs an
// explicit ALTER TYPE ... ADD VALUE. This looks up the actual enum type
// name backing Amenities.status (rather than hardcoding it, since
// Sequelize's auto-generated enum type names can vary) and adds the new
// value if it isn't already there. Guarded to no-op if the Amenities table
// doesn't exist yet (fresh database - sync will create it with the
// already-correct 4-value enum from the start).
module.exports = {
  run: async (sequelize) => {
    await sequelize.query(`
      DO $$
      DECLARE enum_type text;
      BEGIN
        SELECT pg_type.typname INTO enum_type
        FROM pg_type
        JOIN pg_attribute ON pg_attribute.atttypid = pg_type.oid
        JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
        WHERE pg_class.relname = 'Amenities' AND pg_attribute.attname = 'status';

        IF enum_type IS NOT NULL THEN
          EXECUTE 'ALTER TYPE "' || enum_type || '" ADD VALUE IF NOT EXISTS ''Not Available''';
        END IF;
      END $$;
    `);
  },
};
