/**
 * Centralized Model Registry and Relationship Setup
 * This file imports all models and defines relationships between them
 */

const { sequelize } = require('../config/db');

// Import all models
const User = require('./User');
const Society = require('./Society');
const Resident = require('./Resident');
const Unit = require('./Unit');
const Building = require('./Building');
const FlatOwner = require('./FlatOwner');
const Pet = require('./Pet');
const Visitor = require('./Visitor');
const Vehicle = require('./Vehicle');
const GatePass = require('./GatePass');
const Shift = require('./Shift');
const Complaint = require('./Complaint');
const Maintenance = require('./Maintenance');
const Notice = require('./Notice');
const Meeting = require('./Meeting');
const MeetingAttendance = require('./MeetingAttendance');
const Poll = require('./Poll');
const CommitteeVote = require('./CommitteeVote');
const ManagementVote = require('./ManagementVote');
const Amenity = require('./Amenity');
const Document = require('./Document');
const Invoice = require('./Invoice');
const Transaction = require('./Transaction');
const Plan = require('./Plan');
const Fund = require('./Fund');
const Investment = require('./Investment');
const Task = require('./Task');
const Supply = require('./Supply');
const Lease = require('./Lease');
const FamilyMember = require('./FamilyMember');
const HomeService = require('./HomeService');
const RoleChecklist = require('./RoleChecklist');
const AgendaItem = require('./AgendaItem');
const CameraRequest = require('./CameraRequest');
const Emergency = require('./Emergency');
const Policy = require('./Policy');
const Membership = require('./Membership');

// ============================================
// DEFINE RELATIONSHIPS (One-to-Many, Many-to-Many)
// ============================================

/**
 * USER RELATIONSHIPS
 */
User.hasMany(Resident, { 
  foreignKey: 'userId', 
  as: 'residents',
  onDelete: 'CASCADE'
});
Resident.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

User.hasMany(FamilyMember, { 
  foreignKey: 'userId',
  as: 'familyMembers',
  onDelete: 'CASCADE'
});
FamilyMember.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Visitor, { 
  foreignKey: 'createdBy',
  as: 'visitors',
  onDelete: 'SET NULL'
});
Visitor.belongsTo(User, { 
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Complaint, { 
  foreignKey: 'createdBy',
  as: 'complaints',
  onDelete: 'SET NULL'
});
Complaint.belongsTo(User, { 
  foreignKey: 'createdBy',
  as: 'creator'
});

User.hasMany(Task, { 
  foreignKey: 'assignedTo',
  as: 'tasks',
  onDelete: 'SET NULL'
});
Task.belongsTo(User, { 
  foreignKey: 'assignedTo',
  as: 'assignee'
});

User.hasMany(Document, { 
  foreignKey: 'uploadedBy',
  as: 'documents',
  onDelete: 'SET NULL'
});
Document.belongsTo(User, { 
  foreignKey: 'uploadedBy',
  as: 'uploader'
});

/**
 * SOCIETY RELATIONSHIPS
 */
Society.hasMany(Unit, { 
  foreignKey: 'societyId',
  as: 'units',
  onDelete: 'CASCADE'
});
Unit.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Building, { 
  foreignKey: 'societyId',
  as: 'buildings',
  onDelete: 'CASCADE'
});
Building.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Resident, { 
  foreignKey: 'societyId',
  as: 'residents',
  onDelete: 'CASCADE'
});
Resident.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Amenity, { 
  foreignKey: 'societyId',
  as: 'amenities',
  onDelete: 'CASCADE'
});
Amenity.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Meeting, { 
  foreignKey: 'societyId',
  as: 'meetings',
  onDelete: 'CASCADE'
});
Meeting.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Fund, { 
  foreignKey: 'societyId',
  as: 'funds',
  onDelete: 'CASCADE'
});
Fund.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.hasMany(Policy, { 
  foreignKey: 'societyId',
  as: 'policies',
  onDelete: 'CASCADE'
});
Policy.belongsTo(Society, { 
  foreignKey: 'societyId',
  as: 'society'
});

Society.belongsTo(Plan, { 
  foreignKey: 'planId',
  as: 'plan'
});
Plan.hasMany(Society, { 
  foreignKey: 'planId',
  as: 'societies',
  onDelete: 'SET NULL'
});

/**
 * RESIDENT RELATIONSHIPS
 */
Resident.hasMany(Pet, { 
  foreignKey: 'residentId',
  as: 'pets',
  onDelete: 'CASCADE'
});
Pet.belongsTo(Resident, { 
  foreignKey: 'residentId',
  as: 'resident'
});

Resident.hasMany(Vehicle, { 
  foreignKey: 'residentId',
  as: 'vehicles',
  onDelete: 'CASCADE'
});
Vehicle.belongsTo(Resident, { 
  foreignKey: 'residentId',
  as: 'resident'
});

Resident.hasMany(GatePass, { 
  foreignKey: 'residentId',
  as: 'gatePasses',
  onDelete: 'CASCADE'
});
GatePass.belongsTo(Resident, { 
  foreignKey: 'residentId',
  as: 'resident'
});

Resident.hasMany(Lease, { 
  foreignKey: 'residentId',
  as: 'leases',
  onDelete: 'CASCADE'
});
Lease.belongsTo(Resident, { 
  foreignKey: 'residentId',
  as: 'resident'
});

/**
 * UNIT RELATIONSHIPS
 */
Unit.hasMany(FlatOwner, { 
  foreignKey: 'unitId',
  as: 'flatOwners',
  onDelete: 'CASCADE'
});
FlatOwner.belongsTo(Unit, { 
  foreignKey: 'unitId',
  as: 'unit'
});

/**
 * BUILDING RELATIONSHIPS
 */
Building.hasMany(Unit, { 
  foreignKey: 'buildingId',
  as: 'units',
  onDelete: 'CASCADE'
});
Unit.belongsTo(Building, { 
  foreignKey: 'buildingId',
  as: 'building'
});

Building.hasMany(Shift, { 
  foreignKey: 'buildingId',
  as: 'shifts',
  onDelete: 'CASCADE'
});
Shift.belongsTo(Building, { 
  foreignKey: 'buildingId',
  as: 'building'
});

/**
 * MEETING RELATIONSHIPS
 */
Meeting.hasMany(MeetingAttendance, { 
  foreignKey: 'meetingId',
  as: 'attendances',
  onDelete: 'CASCADE'
});
MeetingAttendance.belongsTo(Meeting, { 
  foreignKey: 'meetingId',
  as: 'meeting'
});

Meeting.hasMany(AgendaItem, { 
  foreignKey: 'meetingId',
  as: 'agendaItems',
  onDelete: 'CASCADE'
});
AgendaItem.belongsTo(Meeting, { 
  foreignKey: 'meetingId',
  as: 'meeting'
});

Meeting.hasMany(CommitteeVote, { 
  foreignKey: 'meetingId',
  as: 'votes',
  onDelete: 'CASCADE'
});
CommitteeVote.belongsTo(Meeting, { 
  foreignKey: 'meetingId',
  as: 'meeting'
});

/**
 * INVOICE & TRANSACTION RELATIONSHIPS
 */
Invoice.hasMany(Transaction, { 
  foreignKey: 'invoiceId',
  as: 'transactions',
  onDelete: 'SET NULL'
});
Transaction.belongsTo(Invoice, { 
  foreignKey: 'invoiceId',
  as: 'invoice'
});

/**
 * MAINTENANCE RELATIONSHIPS
 */
Maintenance.hasMany(Supply, { 
  foreignKey: 'maintenanceId',
  as: 'supplies',
  onDelete: 'CASCADE'
});
Supply.belongsTo(Maintenance, { 
  foreignKey: 'maintenanceId',
  as: 'maintenance'
});

// ============================================
// EXPORT ALL MODELS AND SEQUELIZE INSTANCE
// ============================================

module.exports = {
  sequelize,
  User,
  Society,
  Resident,
  Unit,
  Building,
  FlatOwner,
  Pet,
  Visitor,
  Vehicle,
  GatePass,
  Shift,
  Complaint,
  Maintenance,
  Notice,
  Meeting,
  MeetingAttendance,
  Poll,
  CommitteeVote,
  ManagementVote,
  Amenity,
  Document,
  Invoice,
  Transaction,
  Plan,
  Fund,
  Investment,
  Task,
  Supply,
  Lease,
  FamilyMember,
  HomeService,
  RoleChecklist,
  AgendaItem,
  CameraRequest,
  Emergency,
  Policy,
  Membership,
};
