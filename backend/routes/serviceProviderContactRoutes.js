const ServiceProviderContact = require('../models/ServiceProviderContact');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(
  ServiceProviderContact,
  { searchFields: ['name', 'serviceType', 'companyName'] },
  rolesFor('serviceProviderContacts')
);
