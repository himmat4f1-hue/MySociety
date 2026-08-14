const { protect } = require('./auth');

// Auto-fills a required "who submitted this" field (raisedBy, requestedBy,
// etc.) from the logged-in user on POST, when the frontend form doesn't (and
// shouldn't have to) ask "who are you" as a field. Without this, submitting
// via the UI fails with a "cannot be null" validation error on any model
// where that FK is required but isn't in the form.
//
// Usage: router.use(autoFillUser('raisedBy'), makeCrudRouter(...))
const autoFillUser = (fieldName) => [
  protect,
  (req, res, next) => {
    if (req.method === 'POST' && !req.body[fieldName]) {
      req.body[fieldName] = req.user.id;
    }
    next();
  },
];

module.exports = { autoFillUser };
