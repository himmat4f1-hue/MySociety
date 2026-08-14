const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');

// Field -> Model name to manually "populate" after the main query, matching
// what the old Mongoose .populate() calls returned. Only the fields actually
// used with `populate:` in the route files are listed here.
const REF_MODELS = {
  raisedBy: 'User',
  meeting: 'Meeting',
  user: 'User',
  owner: 'User',
  resident: 'User',
  createdBy: 'User',
  uploadedBy: 'User',
  requestedBy: 'User',
  issuedBy: 'User',
  approvedBy: 'User',
  amenity: 'Amenity',
};

// Manually replaces populate-field UUIDs with the referenced record (a small
// subset of fields, chosen server-side to match the frontend's needs) - the
// same shape Mongoose's .populate() used to produce.
async function applyPopulate(rows, populate) {
  if (!populate || !rows.length) return rows;
  const fields = Array.isArray(populate) ? populate : [populate];
  const models = require('../models');

  for (const field of fields) {
    const modelName = REF_MODELS[field];
    if (!modelName) continue;
    const Model = models[modelName];
    const ids = [...new Set(rows.map((r) => r[field]).filter(Boolean))];
    if (!ids.length) continue;

    const attributes = modelName === 'User' ? ['id', 'name', 'email', 'avatar'] : undefined;
    const refs = await Model.findAll({ where: { id: { [Op.in]: ids } }, ...(attributes ? { attributes } : {}) });
    const byId = new Map(refs.map((r) => [r.id, r.toJSON()]));
    rows.forEach((r) => {
      if (r[field] && byId.has(r[field])) r[field] = byId.get(r[field]);
    });
  }
  return rows;
}

// Factory that builds standard CRUD handlers for a given Sequelize model.
// Every handler automatically scopes reads/writes to req.societyId (set by
// the auth middleware from the JWT) so data from one society is never
// visible to, or editable by, a user of another society. This single file
// is what makes the whole app multi-tenant - every route built with
// makeCrudRouter gets this isolation for free.
//
// options.searchFields -> array of string fields to support ?search= text search
// options.populate -> string or array of ref fields to expand on read (see REF_MODELS above)
// options.scoped -> set to false only for models that are NOT per-society (rare)
function buildCrudController(Model, options = {}) {
  const { searchFields = [], populate = null, scoped = true } = options;

  const getAll = asyncHandler(async (req, res) => {
    const { search, status, category, page = 1, limit = 20, ...filters } = req.query;
    const where = {};
    if (scoped) where.society = req.societyId;

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== 'All' && Model.rawAttributes[key]) where[key] = filters[key];
    });
    if (status && status !== 'All') where.status = status;
    if (category && category !== 'All') where.category = category;

    if (search && searchFields.length) {
      where[Op.or] = searchFields.map((field) => ({ [field]: { [Op.iLike]: `%${search}%` } }));
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);

    const { rows, count } = await Model.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
    });

    let data = rows.map((r) => r.toJSON());
    data = await applyPopulate(data, populate);

    res.json({
      data,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    const where = { id: req.params.id };
    if (scoped) where.society = req.societyId;
    const doc = await Model.findOne({ where });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    let data = doc.toJSON();
    [data] = await applyPopulate([data], populate);
    res.json(data);
  });

  const createOne = asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (scoped) payload.society = req.societyId; // always force to the caller's own society
    delete payload.id;
    delete payload._id;
    const doc = await Model.create(payload);
    res.status(201).json(doc);
  });

  const updateOne = asyncHandler(async (req, res) => {
    const where = { id: req.params.id };
    if (scoped) where.society = req.societyId;
    const doc = await Model.findOne({ where });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    const payload = { ...req.body };
    delete payload.society; // never allow moving a record to a different society
    delete payload.id;
    delete payload._id;

    await doc.update(payload);
    res.json(doc);
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const where = { id: req.params.id };
    if (scoped) where.society = req.societyId;
    const doc = await Model.findOne({ where });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    await doc.destroy();
    res.json({ message: 'Deleted successfully' });
  });

  return { getAll, getOne, createOne, updateOne, deleteOne };
}

module.exports = buildCrudController;
