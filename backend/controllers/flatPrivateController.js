const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/auditLog');

// Strips empty-string values for ENUM-typed columns before an insert/update.
// Postgres rejects "" as an invalid enum value (it must be one of the
// defined labels, or absent so the column's own default applies) - without
// this, any client (UI or direct API call) that sends "" for an unselected
// dropdown gets a hard 500 instead of the column quietly using its default.
const stripEmptyEnumValues = (Model, payload) => {
  const cleaned = { ...payload };
  Object.keys(cleaned).forEach((key) => {
    const attr = Model.rawAttributes[key];
    if (attr && attr.type?.constructor?.name === 'ENUM' && cleaned[key] === '') {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Builds CRUD handlers for models that are private to a single flat:
// FlatOwner, FamilyMember, Vehicle, HomeService, Pet ("Personal Data" /
// "Family Data" / "Vehicle Data" / "Home Services" / "Pet Data" from the spec).
//
// READ visibility: a record with flatId = X is visible to
//   - the caller's own flat (req.flatId === X)
//   - Secretary and Chairman (society "upper management" read access)
//
// WRITE access: Secretary can always write (across any flat). Chairman is
// VIEW-ONLY here (per the "chairman sees whatever secretary sees, but cannot
// make changes" rule) - so chairman is deliberately NOT included in the
// write-bypass list, only in the read-bypass list. For write-restricted
// models (FlatOwner = Secretary only) pass ownFlatCanWrite: false; otherwise
// the caller's own flat (their own household's account) can also write their
// own flatId's records.
const CAN_READ_ALL_FLATS = ['secretary', 'chairman'];
const CAN_WRITE_ALL_FLATS = ['secretary'];

function buildFlatPrivateController(Model, options = {}) {
  const { searchFields = [], ownFlatCanWrite = true } = options;

  const canReadAll = (req) => CAN_READ_ALL_FLATS.includes(req.role);
  const canWriteAll = (req) => CAN_WRITE_ALL_FLATS.includes(req.role);

  const getAll = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 20, ...filters } = req.query;
    const where = { society: req.societyId };

    if (!canReadAll(req)) {
      if (!req.flatId) {
        return res.json({ data: [], total: 0, page: 1, pages: 0 }); // staff with no flat, nothing to show
      }
      where.flatId = req.flatId;
    } else if (filters.flatId) {
      where.flatId = filters.flatId;
    }

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

    res.json({ data: rows, total: count, page: pageNum, pages: Math.ceil(count / limitNum) });
  });

  const getOne = asyncHandler(async (req, res) => {
    const doc = await Model.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (!canReadAll(req) && doc.flatId !== req.flatId) {
      return res.status(403).json({ message: 'You do not have permission to view this record' });
    }
    res.json(doc);
  });

  const createOne = asyncHandler(async (req, res) => {
    const payload = stripEmptyEnumValues(Model, { ...req.body, society: req.societyId });
    delete payload.id;
    delete payload._id;

    if (!canWriteAll(req)) {
      if (!ownFlatCanWrite) {
        return res.status(403).json({ message: 'Only the Secretary can add records here' });
      }
      if (!req.flatId) {
        return res.status(403).json({ message: 'Your account is not linked to a flat' });
      }
      payload.flatId = req.flatId; // force to caller's own flat - can never write for another flat
    }

    const doc = await Model.create(payload);
    logActivity(req, { action: 'Create', resourceType: Model.name, resourceId: doc.id });
    res.status(201).json(doc);
  });

  const updateOne = asyncHandler(async (req, res) => {
    const existing = await Model.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    if (!canWriteAll(req)) {
      if (!ownFlatCanWrite || existing.flatId !== req.flatId) {
        return res.status(403).json({ message: 'You do not have permission to edit this record' });
      }
    }

    const payload = stripEmptyEnumValues(Model, req.body);
    delete payload.society;
    delete payload.flatId; // flatId is never editable via update - prevents moving records between flats
    delete payload.id;
    delete payload._id;

    await existing.update(payload);
    logActivity(req, { action: 'Update', resourceType: Model.name, resourceId: existing.id, details: { changed: Object.keys(payload) } });
    res.json(existing);
  });

  const deleteOne = asyncHandler(async (req, res) => {
    const existing = await Model.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    if (!canWriteAll(req)) {
      if (!ownFlatCanWrite || existing.flatId !== req.flatId) {
        return res.status(403).json({ message: 'You do not have permission to delete this record' });
      }
    }

    await existing.destroy();
    logActivity(req, { action: 'Delete', resourceType: Model.name, resourceId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  });

  return { getAll, getOne, createOne, updateOne, deleteOne };
}

module.exports = buildFlatPrivateController;
