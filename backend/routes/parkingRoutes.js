const ParkingAllotment = require('../models/ParkingAllotment');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(ParkingAllotment, { searchFields: ['spotNumber', 'flatId', 'vehicleNumber'] }, rolesFor('parking'));
