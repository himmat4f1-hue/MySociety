const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const AgendaItem = sequelize.define('AgendaItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // FK -> Society
  society: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // FK -> Meeting
  meeting: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  managementDecision: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  agendaStatus: {
    type: DataTypes.ENUM('Not Started', 'In Discussion', 'Postponed', 'Resolved', 'Rejected'),
    defaultValue: 'Not Started',
  },
  noOfVotes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  // internal dedup list of MEMBERSHIP keys ("user:role:flatId", see
  // utils/membership.js) - never exposed via API. Keyed by membership, not
  // just user id, because one login can hold multiple memberships (e.g.
  // Resident of two different flats) that must each get their own vote.
  voters: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  estimatedStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // "Agenda Voting Mechanism" (#33) - Secretary sets a voting window; the
  // vote/select-account panels are only active inside it (enforced in the
  // route, not just the UI). voteOptions is an array of
  // {label, votes} - always includes the default Cancel/Reject/Approve set;
  // the Secretary can add further custom options via POST /:id/options.
  votingStartAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  votingEndAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  voteOptions: {
    type: DataTypes.JSONB,
    defaultValue: [{ label: 'Approve', votes: 0 }, { label: 'Reject/Cancel', votes: 0 }],
  },
  // Secretary-controlled voting toggle for THIS agenda item (separate from
  // votingStartAt/votingEndAt above, which are an optional fixed window -
  // this is a manual on/off switch): 'not_started' -> Vote button hidden
  // for everyone; 'active' -> eligible voters (per meeting type) see the
  // Vote button; 'stopped' -> Vote button hidden again and the Start/Stop
  // toggle itself hides too, until "Reset" (which also clears all votes)
  // brings it back to 'not_started'.
  votingState: {
    type: DataTypes.ENUM('not_started', 'active', 'stopped'),
    defaultValue: 'not_started',
  },
  // Secretary's manual tie-break pick when two or more options end up with
  // the SAME top vote count (a real tie can't resolve itself). Once set,
  // this option is the definitive Decision regardless of the raw vote
  // count comparison. Cleared back to null by "Reset" along with everything
  // else.
  finalDecision: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(AgendaItem);
