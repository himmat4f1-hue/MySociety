const asyncHandler = require('../utils/asyncHandler');

// Factory that builds standard CRUD handlers for a given Mongoose model.
// options.searchFields -> array of string fields to support ?search= text search
// options.populate -> string or array to populate on read
function buildCrudController(Model, options = {}) {
  const { searchFields = [], populate = null } = options;

  const getAll = asyncHandler(async (req, res) => {
    const { search, status, category, page = 1, limit = 20, ...filters } = req.query;
    const query = {};

    // simple equality filters (status, category, priority, tower, building, type etc.)
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
    let q = Model.findById(req.params.id);
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  });

  const createOne = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  });

  const updateOne = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  });

  return { getAll, getOne, createOne, updateOne, deleteOne };
}

module.exports = buildCrudController;
