const UtilityReading = require('../models/UtilityReading');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(UtilityReading, { searchFields: ['flatId', 'tower'] }, rolesFor('utilityReadings'));
