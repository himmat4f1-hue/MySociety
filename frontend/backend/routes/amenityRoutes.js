const Amenity = require('../models/Amenity');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Amenity,
  { searchFields: ['name', 'type', 'building'] },
  { read: 'any', write: ['admin', 'secretary'] }
);

module.exports = router;
