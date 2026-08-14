const InventoryItem = require('../models/InventoryItem');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(InventoryItem, { searchFields: ['itemName', 'category', 'location'] }, rolesFor('inventory'));
