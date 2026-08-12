const mongoose = require('mongoose');

// Self check-in log: when a meeting is announced, attendees tap "Add Me" on
// their phone during/at the meeting. The role is captured automatically from
// whichever account (role) they are logged in as at the moment they check in -
// NOT manually selected - so the same person shows up as "Committee Member"
// if they checked in from that account, or "Member" if from their resident account.
const meetingAttendanceSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    role: { type: String, required: true }, // captured from the checking-in user's active role
    flatId: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkedInAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A given user can only check themselves into a given meeting once
meetingAttendanceSchema.index({ meeting: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('MeetingAttendance', meetingAttendanceSchema);
