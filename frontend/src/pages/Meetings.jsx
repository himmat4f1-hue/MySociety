import React, { useEffect, useState, useCallback } from 'react';
import { CalendarDays, Clock, ListChecks, PlayCircle, Users, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Loader2, Plus } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

const STATUS_STYLE = {
  'Not yet Started': 'bg-slate-100 text-slate-600',
  Started: 'bg-blue-50 text-blue-600',
  'Counting Attendance': 'bg-amber-50 text-amber-600',
  Completed: 'bg-emerald-50 text-emerald-600',
  Cancelled: 'bg-red-50 text-red-600',
};

const votingWindowStatus = (item) => {
  const now = new Date();
  if (item.votingStartAt && now < new Date(item.votingStartAt)) return 'not-open';
  if (item.votingEndAt && now > new Date(item.votingEndAt)) return 'closed';
  return 'open';
};

const Meetings = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // meeting id currently mid-action
  const [detailMeeting, setDetailMeeting] = useState(null); // full detail for a Completed/Cancelled meeting
  const [voting, setVoting] = useState(null); // `${agendaId}-${optionLabel}`
  const [modalOpen, setModalOpen] = useState(false);

  const canManage = user?.role === 'secretary';
  const canVote = ['secretary', 'chairman', 'treasurer', 'committee_member'].includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/meetings/by-date', { params: { date: selectedDate } });
      setMeetings(res.data);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
    setDetailMeeting(null);
  }, [load]);

  const openDetail = async (meeting) => {
    const res = await api.get(`/meetings/${meeting._id}/full`);
    setDetailMeeting(res.data);
  };

  const handleStart = async (id) => {
    setBusyId(id);
    try {
      await api.patch(`/meetings/${id}/start`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start the meeting.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSetStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.patch(`/meetings/${id}/status`, { status });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update meeting status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleAddMe = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/meetings/${id}/add-me`);
      alert('You have been marked present.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark attendance.');
    } finally {
      setBusyId(null);
    }
  };

  const handleVote = async (agendaId, optionLabel) => {
    setVoting(`${agendaId}-${optionLabel}`);
    try {
      await api.post(`/agenda-items/${agendaId}/vote`, { optionLabel });
      if (detailMeeting) await openDetail({ _id: detailMeeting._id });
    } catch (err) {
      alert(err.response?.data?.message || 'Could not vote');
    } finally {
      setVoting(null);
    }
  };

  const handleCreate = async (values) => {
    await api.post('/meetings', values);
    await load();
  };

  const finishedMeetings = meetings.filter((m) => ['Completed', 'Cancelled'].includes(m.status));

  return (
    <Layout title="Meetings" subtitle="Schedule, run, and record attendance & agenda decisions - all in one place">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-slate-400" />
          <label className="text-sm text-slate-500">Filter: By Date</label>
          <input type="date" className="input w-auto" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        {canManage && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Schedule Meeting
          </button>
        )}
      </div>

      {/* List of meetings on the selected date */}
      <div className="space-y-3 mb-8">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : meetings.length === 0 ? (
          <p className="text-slate-400">No meetings scheduled on this date.</p>
        ) : (
          meetings.map((m) => (
            <div key={m._id} className="card flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">{m.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock size={11} /> {fmtDateTime(m.date)} {m.time && `· ${m.time}`} {m.location && `· ${m.location}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <ListChecks size={12} /> {m.agendaCount} agenda{m.agendaCount === 1 ? '' : 's'}
                </span>
                <span className={`badge ${STATUS_STYLE[m.status] || STATUS_STYLE['Not yet Started']}`}>{m.status}</span>

                {m.status === 'Not yet Started' && canManage && (
                  <button disabled={busyId === m._id} onClick={() => handleStart(m._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60">
                    {busyId === m._id ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />} Start Meeting
                  </button>
                )}
                {m.status === 'Started' && canManage && (
                  <button disabled={busyId === m._id} onClick={() => handleSetStatus(m._id, 'Counting Attendance')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60">
                    <Users size={12} /> Begin Attendance Count
                  </button>
                )}
                {m.status === 'Counting Attendance' && (
                  <button disabled={busyId === m._id} onClick={() => handleAddMe(m._id)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60">
                    {busyId === m._id ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />} Add Me
                  </button>
                )}
                {m.status === 'Counting Attendance' && canManage && (
                  <>
                    <button disabled={busyId === m._id} onClick={() => handleSetStatus(m._id, 'Completed')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60">
                      <CheckCircle2 size={12} /> Complete
                    </button>
                    <button disabled={busyId === m._id} onClick={() => handleSetStatus(m._id, 'Cancelled')} className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 disabled:opacity-60">
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {['Completed', 'Cancelled'].includes(m.status) && (
                  <button onClick={() => openDetail(m)} className="text-xs text-brand-600 font-medium px-2">
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail card - only for a Completed/Cancelled meeting the person opened */}
      {detailMeeting && (
        <div className="card border-2 border-brand-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{detailMeeting.title}</h3>
              <p className="text-xs text-slate-500">
                {fmtDateTime(detailMeeting.date)} {detailMeeting.time && `· ${detailMeeting.time}`} · {detailMeeting.attendanceCount} attended
              </p>
            </div>
            <span className={`badge ${STATUS_STYLE[detailMeeting.status]}`}>{detailMeeting.status}</span>
          </div>

          {detailMeeting.agenda && <p className="text-sm text-slate-600 mb-4">{detailMeeting.agenda}</p>}

          <p className="text-xs font-semibold text-slate-400 mb-2">AGENDA ITEMS ({detailMeeting.agendaItems.length})</p>
          {detailMeeting.agendaItems.length === 0 ? (
            <p className="text-sm text-slate-400">No agenda items were recorded for this meeting.</p>
          ) : (
            <div className="space-y-3">
              {detailMeeting.agendaItems.map((item) => {
                const windowStatus = votingWindowStatus(item);
                const options = item.voteOptions?.length ? item.voteOptions : [{ label: 'Approve', votes: 0 }, { label: 'Reject', votes: 0 }];
                return (
                  <div key={item._id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.agenda}</p>
                        {item.managementDecision && <p className="text-xs text-slate-500 mt-0.5">Decision: {item.managementDecision}</p>}
                      </div>
                      <span className="badge shrink-0">{item.agendaStatus}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {options.map((o) => (
                        <span key={o.label}>
                          {o.label}: <strong className="text-slate-700">{o.votes || 0}</strong>
                        </span>
                      ))}
                      {canVote && windowStatus === 'open' && (
                        <div className="flex gap-1 ml-auto">
                          {options.map((o) => (
                            <button
                              key={o.label}
                              disabled={voting === `${item._id}-${o.label}`}
                              onClick={() => handleVote(item._id, o.label)}
                              className="btn-secondary text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-50"
                            >
                              {o.label === 'Approve' ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />} {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={() => setDetailMeeting(null)} className="text-xs text-slate-400 mt-4">
            Close details
          </button>
        </div>
      )}

      {canManage && (
        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
          title="Schedule Meeting"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['General', 'Committee', 'Internal', 'Community'] },
            { name: 'date', label: 'Date', type: 'date', required: true },
            { name: 'time', label: 'Time (e.g. 07:00 PM)' },
            { name: 'location', label: 'Venue' },
            { name: 'agenda', label: 'Overview / Agenda Summary', type: 'textarea' },
          ]}
        />
      )}
    </Layout>
  );
};

export default Meetings;
