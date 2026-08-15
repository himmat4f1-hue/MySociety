import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Flag,
  ListChecks,
  PlayCircle,
  XCircle,
  UserPlus,
  StopCircle,
  LogOut,
  Loader2,
  Plus,
  Hourglass,
  X,
} from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');

const STATUS_STYLE = {
  Upcoming: 'bg-blue-50 text-blue-600',
  'In Progress': 'bg-emerald-50 text-emerald-600',
  Completed: 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-red-50 text-red-600',
};

const OptionSelectVote = ({ item, canVote, hasJoined, onVote, busy }) => {
  const [choice, setChoice] = useState(item.voteOptions[0]?.label || '');
  if (!hasJoined) {
    return <span className="text-slate-300">—</span>;
  }
  if (!canVote) {
    return <span className="text-xs text-slate-400">View only</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <select className="input py-1 text-xs w-24" value={choice} onChange={(e) => setChoice(e.target.value)}>
        {item.voteOptions.map((o) => (
          <option key={o.label} value={o.label}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        disabled={busy}
        onClick={() => onVote(item._id, choice)}
        className="btn-primary text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-50 shrink-0"
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : <ListChecks size={11} />} Vote
      </button>
    </div>
  );
};

const MeetingDetail = ({ meeting, onClose, onChanged, user }) => {
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [votingId, setVotingId] = useState(null);

  const canManage = user?.role === 'secretary';
  const canVote = ['secretary', 'chairman', 'treasurer', 'committee_member'].includes(user?.role);

  const load = useCallback(async () => {
    const res = await api.get(`/meetings/${meeting._id}/full`);
    setDetail(res.data);
  }, [meeting._id]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, successRefresh = true) => {
    setBusy(true);
    try {
      await fn();
      if (successRefresh) {
        await load();
        onChanged();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const handleVote = async (agendaId, optionLabel) => {
    setVotingId(agendaId);
    try {
      await api.post(`/agenda-items/${agendaId}/vote`, { optionLabel });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not vote.');
    } finally {
      setVotingId(null);
    }
  };

  if (!detail) {
    return (
      <div className="card mt-4">
        <p className="text-slate-400">Loading meeting...</p>
      </div>
    );
  }

  const { attendance, agendaItems, joiners, hasJoined, status } = detail;
  const isGeneral = detail.type !== 'Committee';
  const relevantJoined = isGeneral ? attendance.joinedMembers : attendance.joinedManagement;
  const relevantRequired = isGeneral ? attendance.minRequiredMembers : attendance.minRequiredManagement;
  const quorumMet = relevantJoined >= relevantRequired;

  return (
    <div className="card mt-4 border-2 border-brand-100">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <CalendarDays size={22} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">{detail.title}</h2>
        </div>
        <span className={`badge ${STATUS_STYLE[status]}`}>Meeting Status: {status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="card bg-slate-50 border-0">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-slate-600">
              <Clock size={14} className="text-slate-400" /> {fmtDateTime(detail.date)} {detail.time && `· ${detail.time}`}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <MapPin size={14} className="text-slate-400" /> {detail.location || '—'}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <Flag size={14} className="text-slate-400" /> {detail.priority || 'Medium'}
            </p>
          </div>
        </div>

        {status !== 'Upcoming' && (
          <div className="card bg-slate-50 border-0">
            <p className="text-xs font-semibold text-slate-500 mb-2">Attendance</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-left">
                  <th className="font-medium pb-1">Category</th>
                  <th className="font-medium pb-1 text-right">Total</th>
                  <th className="font-medium pb-1 text-right">Joined</th>
                  <th className="font-medium pb-1 text-right">Min. Required</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="py-1.5">Members (General)</td>
                  <td className="py-1.5 text-right">{attendance.totalMembers}</td>
                  <td className="py-1.5 text-right font-semibold">{attendance.joinedMembers}</td>
                  <td className="py-1.5 text-right">{attendance.minRequiredMembers}</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="py-1.5">Management (Committee)</td>
                  <td className="py-1.5 text-right">{attendance.totalManagement}</td>
                  <td className="py-1.5 text-right font-semibold">{attendance.joinedManagement}</td>
                  <td className="py-1.5 text-right">{attendance.minRequiredManagement}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-2">Agenda Count: {agendaItems.length}</p>
      {agendaItems.length === 0 ? (
        <p className="text-sm text-slate-400 mb-4">No agenda items added yet.</p>
      ) : status === 'Upcoming' ? (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium pb-1.5 w-12">Sr.</th>
              <th className="font-medium pb-1.5">Agenda</th>
            </tr>
          </thead>
          <tbody>
            {agendaItems.map((a, i) => (
              <tr key={a._id} className="border-b border-slate-50 last:border-0">
                <td className="py-1.5 text-slate-500">{i + 1}</td>
                <td className="py-1.5 text-slate-700">{a.agenda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium pb-1.5 w-8">Sr.</th>
              <th className="font-medium pb-1.5">Agenda</th>
              <th className="font-medium pb-1.5">Options</th>
              <th className="font-medium pb-1.5">Vote</th>
              <th className="font-medium pb-1.5">Decision</th>
            </tr>
          </thead>
          <tbody>
            {agendaItems.map((a, i) => (
              <tr key={a._id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 text-slate-500">{i + 1}</td>
                <td className="py-2 text-slate-700">{a.agenda}</td>
                <td className="py-2 text-slate-500 text-xs">{a.voteOptions.map((o) => o.label).join(' / ')}</td>
                <td className="py-2">
                  <OptionSelectVote item={a} canVote={canVote && status === 'In Progress'} hasJoined={hasJoined} onVote={handleVote} busy={votingId === a._id} />
                </td>
                <td className="py-2 text-slate-700">
                  {a.decision && a.decision.votes > 0 ? (
                    <span>
                      {a.decision.label} <span className="text-slate-400">({a.decision.votes} votes)</span>
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {status === 'Upcoming' && canManage && (
          <>
            <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/start-attendance`))} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
              <PlayCircle size={15} /> Start Attendance
            </button>
            <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/cancel`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
              <XCircle size={15} /> Cancel Meeting
            </button>
          </>
        )}

        {status === 'In Progress' && !hasJoined && (
          <>
            <button disabled={busy} onClick={() => act(() => api.post(`/meetings/${meeting._id}/add-me`))} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add Me
            </button>
            {canManage && (
              <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/cancel`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
                <XCircle size={15} /> Cancel Meeting
              </button>
            )}
          </>
        )}

        {status === 'In Progress' && hasJoined && (
          <>
            {canManage && (
              <>
                <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/stop`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
                  <StopCircle size={15} /> Stop Meeting
                </button>
                <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/cancel`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
                  <XCircle size={15} /> Cancel Meeting
                </button>
              </>
            )}
            <button
              onClick={() => act(() => api.post(`/meetings/${meeting._id}/exit`), false).then(onClose)}
              className="btn-secondary flex items-center gap-1.5"
            >
              <LogOut size={15} /> Exit from Meeting
            </button>
          </>
        )}
      </div>

      {status === 'In Progress' && !quorumMet && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm text-amber-800">
          <Hourglass size={16} className="shrink-0 mt-0.5" />
          <p>
            Minimum required {isGeneral ? 'members' : 'management'} have not yet joined ({relevantJoined}/{relevantRequired}). Voting results shown are provisional until quorum is met.
          </p>
        </div>
      )}

      <p className="text-xs font-semibold text-slate-500 mb-2">List of Joiners ({joiners.length})</p>
      {joiners.length === 0 ? (
        <p className="text-sm text-slate-400">No one has joined yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-100">
              <th className="font-medium pb-1.5">Building No.</th>
              <th className="font-medium pb-1.5">Flat No.</th>
              <th className="font-medium pb-1.5">Name</th>
              <th className="font-medium pb-1.5">Role</th>
            </tr>
          </thead>
          <tbody>
            {joiners.map((j) => (
              <tr key={j._id} className="border-b border-slate-50 last:border-0">
                <td className="py-1.5 text-slate-600">{j.buildingNo}</td>
                <td className="py-1.5 text-slate-600">{j.flatNo}</td>
                <td className="py-1.5 text-slate-700">{j.name}</td>
                <td className="py-1.5 text-slate-500">{j.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={onClose} className="text-xs text-slate-400 mt-4">
        Close
      </button>
    </div>
  );
};

// "Add Agenda" flow (#1) - instead of one free-text "agenda summary" blob,
// the Secretary adds structured agenda items one at a time (each becomes its
// own real AgendaItem row, with its own voting later) right in this modal.
const ScheduleMeetingModal = ({ open, onClose, onSubmit }) => {
  const [values, setValues] = useState({ title: '', type: 'General', priority: 'Medium', date: '', time: '', location: '' });
  const [agendaList, setAgendaList] = useState([]);
  const [agendaDraft, setAgendaDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({ title: '', type: 'General', priority: 'Medium', date: '', time: '', location: '' });
      setAgendaList([]);
      setAgendaDraft('');
    }
  }, [open]);

  if (!open) return null;

  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

  const addAgenda = () => {
    const text = agendaDraft.trim();
    if (!text) return;
    setAgendaList([...agendaList, text]);
    setAgendaDraft('');
  };

  const removeAgenda = (idx) => setAgendaList(agendaList.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...values, agendaList });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">Schedule Meeting</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input className="input" required value={values.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select className="input" value={values.type} onChange={(e) => set('type', e.target.value)}>
                <option value="General">General (Members)</option>
                <option value="Committee">Committee (Management)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select className="input" value={values.priority} onChange={(e) => set('priority', e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input type="date" className="input" required value={values.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time (e.g. 07:00 PM)</label>
              <input className="input" value={values.time} onChange={(e) => set('time', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
            <input className="input" value={values.location} onChange={(e) => set('location', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agenda Items</label>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="e.g. Maintenance Charge Revision"
                value={agendaDraft}
                onChange={(e) => setAgendaDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAgenda())}
              />
              <button type="button" onClick={addAgenda} className="btn-secondary px-3 shrink-0 flex items-center gap-1">
                <Plus size={15} /> Add Agenda
              </button>
            </div>

            {agendaList.length > 0 && (
              <ul className="mt-2 space-y-1">
                {agendaList.map((a, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                    <span className="text-slate-700">
                      {i + 1}. {a}
                    </span>
                    <button type="button" onClick={() => removeAgenda(i)} className="text-slate-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />} {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Meetings = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMeeting, setOpenMeeting] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const canManage = user?.role === 'secretary';

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
    setOpenMeeting(null);
  }, [load]);

  const handleCreate = async (values) => {
    const { agendaList, ...meetingFields } = values;
    const res = await api.post('/meetings', meetingFields);
    const newMeetingId = res.data.id;
    // Create each agenda item added in the "Add Agenda" list, linked to the
    // meeting just created.
    for (const agendaText of agendaList) {
      await api.post('/agenda-items', { meeting: newMeetingId, agenda: agendaText });
    }
    await load();
  };

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

      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : meetings.length === 0 ? (
          <p className="text-slate-400">No meetings scheduled on this date.</p>
        ) : (
          meetings.map((m) => (
            <button
              key={m._id}
              onClick={() => setOpenMeeting(m)}
              className={`card w-full text-left flex items-center justify-between flex-wrap gap-3 hover:border-brand-300 transition-colors ${openMeeting?._id === m._id ? 'border-brand-300 ring-1 ring-brand-100' : ''}`}
            >
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
                <span className={`badge ${STATUS_STYLE[m.status]}`}>{m.status}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {openMeeting && <MeetingDetail meeting={openMeeting} onClose={() => setOpenMeeting(null)} onChanged={load} user={user} />}

      {canManage && <ScheduleMeetingModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />}
    </Layout>
  );
};

export default Meetings;
