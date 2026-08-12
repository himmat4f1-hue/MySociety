import React, { useEffect, useState } from 'react';
import { UserCheck, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

const MeetingAttendancePage = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [meetRes, attRes] = await Promise.all([
        api.get('/meetings', { params: { limit: 50 } }),
        api.get('/meeting-attendance'),
      ]);
      setMeetings(meetRes.data.data);
      setAttendance(attRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async (meetingId) => {
    setCheckingIn(meetingId);
    try {
      await api.post('/meeting-attendance/check-in', { meetingId });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not check in');
    } finally {
      setCheckingIn(null);
    }
  };

  const myAttendedMeetingIds = new Set(attendance.filter((a) => a.user?._id === user?._id).map((a) => a.meeting));
  const attendanceByMeeting = (meetingId) => attendance.filter((a) => a.meeting === meetingId);

  return (
    <Layout title="Meeting Attendance" subtitle='Tap "Add Me" when you are present at a meeting - your role is captured automatically from your account'>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarDays} label="Total Meetings" value={meetings.length} color="blue" />
        <StatCard icon={UserCheck} label="Total Check-ins" value={attendance.length} color="green" />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : meetings.length === 0 ? (
          <p className="text-slate-400">No meetings scheduled yet.</p>
        ) : (
          meetings.map((m) => {
            const attendees = attendanceByMeeting(m._id);
            const alreadyIn = myAttendedMeetingIds.has(m._id);
            return (
              <div key={m._id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-slate-800">{m.title}</h3>
                    <p className="text-sm text-slate-500">{new Date(m.date).toLocaleString()} &middot; {m.location}</p>
                  </div>
                  <button
                    disabled={alreadyIn || checkingIn === m._id}
                    onClick={() => handleCheckIn(m._id)}
                    className="btn-primary disabled:opacity-50 shrink-0"
                  >
                    {alreadyIn ? "You're checked in" : checkingIn === m._id ? 'Adding...' : 'Add Me'}
                  </button>
                </div>

                {attendees.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">CHECKED IN ({attendees.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {attendees.map((a) => (
                        <span key={a._id} className="text-xs bg-slate-100 rounded-full px-3 py-1">
                          {a.user?.name || 'Member'} <span className="text-slate-400 capitalize">({a.role.replace('_', ' ')})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default MeetingAttendancePage;
