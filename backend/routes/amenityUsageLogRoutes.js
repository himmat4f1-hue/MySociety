const AmenityUsageLog = require('../models/AmenityUsageLog');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(
  AmenityUsageLog,
  { searchFields: ['flatId'], populate: ['amenity', 'user'] },
  rolesFor('amenityBookings')
);
