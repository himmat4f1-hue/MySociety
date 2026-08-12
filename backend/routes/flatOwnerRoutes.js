const express = require('express');
const router = express.Router();
const FlatOwner = require('../models/FlatOwner');
const FamilyMember = require('../models/FamilyMember');
const { protect, authorize } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

// FlatOwner ("Personal Data"): only Secretary/Admin can add/edit/delete.
const ctrl = buildFlatPrivateController(FlatOwner, { searchFields: ['firstName', 'lastName', 'flatId', 'mobileNumber'], ownFlatCanWrite: false });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, authorize('secretary'), async (req, res, next) => {
  // Auto-add the owner into Family Data too, as noted in the spec ("Auto Add >")
  try {
    const payload = { ...req.body, society: req.societyId };
    delete payload.id;
    delete payload._id;
    const doc = await FlatOwner.create(payload);
    await FamilyMember.create({
      society: req.societyId,
      flatId: doc.flatId,
      firstName: doc.firstName,
      middleName: doc.middleName,
      lastName: doc.lastName,
      birthDate: doc.birthDate,
      gender: doc.gender,
      religion: doc.religion,
      mobileNumber: doc.mobileNumber,
      isAutoAddedOwner: true,
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});
router.put('/:id', protect, authorize('secretary'), ctrl.updateOne);
router.delete('/:id', protect, authorize('secretary'), ctrl.deleteOne);

module.exports = router;
