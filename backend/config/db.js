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
