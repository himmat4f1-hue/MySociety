// The frontend (unchanged from the original MongoDB build) reads `_id` off
// every record returned by the API. Sequelize/Postgres uses `id`. Rather than
// touch 30+ frontend pages, every model gets its toJSON() overridden here so
// records always carry BOTH `id` and `_id` (same UUID) - this is the single
// place that keeps the old frontend working unmodified against the new
// Postgres backend.
function withMongoIdAlias(Model) {
  Model.prototype.toJSON = function toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };
  return Model;
}

module.exports = { withMongoIdAlias };
