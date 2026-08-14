const express = require('express');
const Document = require('../models/Document');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/auditLog');

const router = express.Router();

// "Document Management System" (#48) - upload a new version of an existing
// document: bumps `version`, and pushes the CURRENT fileUrl/uploadedBy/
// uploadedOn into `previousVersions` before overwriting, so history is
// never lost. Registered BEFORE the generic /:id routes below.
router.post(
  '/:id/new-version',
  protect,
  authorize('secretary', 'treasurer', 'accountant'),
  asyncHandler(async (req, res) => {
    const doc = await Document.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const { fileUrl, sizeKB } = req.body;
    if (!fileUrl) return res.status(400).json({ message: 'fileUrl is required for a new version' });

    const history = [...(doc.previousVersions || []), { version: doc.version, fileUrl: doc.fileUrl, uploadedBy: doc.uploadedBy, uploadedOn: doc.uploadedOn }];

    await doc.update({
      fileUrl,
      sizeKB: sizeKB ?? doc.sizeKB,
      version: doc.version + 1,
      previousVersions: history,
      uploadedBy: req.user.id,
      uploadedOn: new Date(),
    });
    logActivity(req, { action: 'Update', resourceType: 'Document', resourceId: doc.id, details: { newVersion: doc.version } });

    res.json(doc);
  })
);

router.use('/', makeCrudRouter(Document, { searchFields: ['name', 'category'] }, { read: 'any', write: ['secretary', 'treasurer', 'accountant'] }));

module.exports = router;
