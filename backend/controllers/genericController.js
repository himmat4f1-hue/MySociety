const asyncHandler = require('../utils/asyncHandler');

// Factory that builds standard CRUD handlers for a given Mongoose model.
// Every handler automatically scopes reads/writes to req.societyId (set by the
// auth middleware from the JWT) so that data from one society is never visible
// to, or editable by, a user of another society. This single file is what makes
// the whole app multi-tenant - every route built with makeCrudRouter gets this
// isolation for free.
//
// options.searchFields -> array of string fields to support ?search= text search
// options.populate -> string or array to populate on read
// options.scoped -> set to false only for models that are NOT per-society (rare)
function buildCrudController(Model, options = {}) {
  const { searchFields = [], populate = null, scoped = true } = options;

  const getAll = asyncHandler(async (req, res) => {
    const { search, status, category, page = 1, limit = 20, ...filters } = req.query;
    const query = {};
    if (scoped) query.society = req.societyId;

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== 'All') query[key] = filters[key];
    });
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    if (search && searchFields.length) {
      query.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }

    let q = Model.find(query).sort({ createdAt: -1 });
    if (populate) q = q.populate(populate);

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);
    const total = await Model.countDocuments(query);
    const data = await q.skip((pageNum - 1) * limitNum).limit(limitNum);

    res.json({
      data,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    const query = { _id: req.params.id };
    if (scoped) query.society = req.societyId;
    let q = Model.findOne(query);
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  });

  const createOne = asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (scoped) payload.society = req.societyId; // always force to the caller's own society
    const doc = await Model.create(payload);
    res.status(201).json(doc);
  });

  const updateOne = asyncHandler(async (req, res) => {
    const query = { _id: req.params.id };
    if (scoped) query.society = req.societyId;
    const payload = { ...req.body };
    delete payload.society; // never allow moving a record to a different society
    const doc = await Model.findOneAndUpdate(query, payload, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const query = { _id: req.params.id };
    if (scoped) query.society = req.societyId;
    const doc = await Model.findOneAndDelete(query);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  });

  return { getAll, getOne, createOne, updateOne, deleteOne };
}

module.exports = buildCrudController;
