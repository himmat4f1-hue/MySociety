const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const buildCrudController = require('../controllers/genericController');

// roles = { read: [...roles or 'any'], write: [...roles] }
function makeCrudRouter(Model, options = {}, roles = {}) {
  const router = express.Router();
  const ctrl = buildCrudController(Model, options);

  const readRoles = roles.read || 'any';
  const writeRoles = roles.write || 'any';

  const readMw = readRoles === 'any' ? [protect] : [protect, authorize(...readRoles)];
  const writeMw = writeRoles === 'any' ? [protect] : [protect, authorize(...writeRoles)];

  router.get('/', ...readMw, ctrl.getAll);
  router.get('/:id', ...readMw, ctrl.getOne);
  router.post('/', ...writeMw, ctrl.createOne);
  router.put('/:id', ...writeMw, ctrl.updateOne);
  router.delete('/:id', ...writeMw, ctrl.deleteOne);

  return router;
}

module.exports = makeCrudRouter;
