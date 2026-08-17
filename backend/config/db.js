const { Sequelize } = require('sequelize');

// Two ways to configure the database connection:
//  1. DATABASE_URL - a single connection string (this is what Render's
//     PostgreSQL "Internal/External Database URL" gives you). Preferred for
//     deployment.
//  2. DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD - individual
//     fields, handy for local development.
const connectionString = process.env.DATABASE_URL;

const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+00:00',
};

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      ...commonOptions,
      // Render's managed Postgres requires SSL for external connections.
      // Safe to leave this on even for the Internal Database URL.
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'mysociety_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully');

    // Run any pending non-destructive schema fixes BEFORE sync (see
    // utils/migrations/). This matters specifically because some model
    // changes (e.g. widening an array column's element type) are
    // incompatible enough that sync({alter:true}) can't reconcile them on
    // its own - it throws, and since any sync failure below calls
    // process.exit(1), that would crash the server on every single boot
    // until someone manually intervened. Running these first means the
    // schema is already compatible by the time sync runs, so the normal
    // (safe) column-add/adjust behavior of alter:true is all that's left
    // for it to do. Required (not optional/lazy-loaded via a button) for
    // exactly this reason - a fix that only runs from an authenticated
    // endpoint is useless if the server never boots far enough to serve
    // that endpoint.
    const { runPendingFixes } = require('../utils/migrations');
    const fixResult = await runPendingFixes();
    if (fixResult.applied.length) console.log('Applied schema fixes:', fixResult.applied.join(', '));
    if (fixResult.failed.length) console.warn('Schema fixes skipped for now (will retry next boot):', fixResult.failed.map((f) => f.file).join(', '));

    // Sync models with database (creates tables if missing, and - critically -
    // ALTERs existing tables to add/adjust columns when a model changes).
    // This app has no separate migration system, so `alter: true` runs in
    // every environment, not just development; without it, any new field
    // added to a model (e.g. Unit.forSale) would silently never appear on an
    // already-deployed database, breaking anything that reads/writes it.
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
