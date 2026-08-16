import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Flag,
  FileText,
  Tag,
  ListChecks,
  PlayCircle,
  XCircle,
  UserPlus,
  StopCircle,
  LogOut,
  Loader2,
  Plus,
  Hourglass,
  Pencil,
  Trash2,
  GripVertical,
  Check,
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

const MANAGEMENT_ROLES = ['secretary', 'chairman', 'treasurer', 'committee_member'];

// Vote UI for one agenda row - left-to-right: "Add Option" (+, secretary
// only, passed in as addOptionButton), Vote button, then the option select.
// canVote here already reflects BOTH the meeting-type voting-rights rule
// (General meeting -> only General members; Committee meeting -> only
// Management) and whether quorum has been met - see MeetingDetail below.
const OptionSelectVote = ({ item, canVote, hasJoined, onVote, busy, hasVoted, addOptionButton }) => {
  const [choice, setChoice] = useState(item.voteOptions[0]?.label || '');
  if (!hasJoined) {
    return (
      <div className="flex items-center gap-1.5">
        {addOptionButton}
        <span className="text-slate-300">—</span>
      </div>
    );
  }
  if (!canVote) {
    return (
      <div className="flex items-center gap-1.5">
        {addOptionButton}
        <span className="text-xs text-slate-400">View only</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {addOptionButton}
      {/* One vote per person - once hasVoted comes back true from the
          server, this button stays disabled forever for this agenda item,
          even after a page reload (not just for the current session). */}
      <button
        disabled={busy || hasVoted}
        onClick={() => onVote(item._id, choice)}
        className="btn-primary text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-50 shrink-0"
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : <ListChecks size={11} />} {hasVoted ? 'Voted' : 'Vote'}
      </button>
      <select disabled={hasVoted} className="input py-1 text-xs w-36 disabled:opacity-60" value={choice} onChange={(e) => setChoice(e.target.value)}>
        {item.voteOptions.map((o) => (
          <option key={o.label} value={o.label}>
            {o.label}(Votes={o.votes || 0})
          </option>
        ))}
      </select>
    </div>
  );
};

// "Add Option" popup (#4 follow-up) - a small modal with a textbox, Save
// (adds the option, then auto-closes) and Cancel (just closes). Replaces
// the old inline per-row textbox / separate table column entirely.
const AddOptionModal = ({ agendaId, onClose, onAdded }) => {
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);

  if (!agendaId) return null;

  const save = async () => {
    const text = label.trim();
    if (!text) return;
    setBusy(true);
    try {
      await api.post(`/agenda-items/${agendaId}/options`, { label: text });
      await onAdded();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add option.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-3">
        <h3 className="text-base font-semibold text-slate-800">Add Vote Option</h3>
        <input
          autoFocus
          className="input"
          placeholder="e.g. Postpone"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), save())}
        />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={save} className="btn-primary disabled:opacity-60 flex items-center gap-1.5">
            {busy && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
};

const MeetingDetail = ({ meeting, onClose, onChanged, user }) => {
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [optionModalAgenda, setOptionModalAgenda] = useState(null);

  const canManage = user?.role === 'secretary';

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

  const { attendance, agendaItems, joiners, hasJoined, hasExited, status } = detail;
  const isGeneral = detail.type !== 'Committee';
  const relevantJoined = isGeneral ? attendance.joinedMembers : attendance.joinedManagement;
  const relevantRequired = isGeneral ? attendance.minRequiredMembers : attendance.minRequiredManagement;
  const quorumMet = relevantJoined >= relevantRequired;
  // Voting rights (#2): General meeting -> only General members may vote;
  // Committee meeting -> only Management may vote. The voting table itself
  // is also hidden entirely until quorum is met (#1) - see below.
  const canVote = isGeneral ? ['resident', 'tenant'].includes(user?.role) : MANAGEMENT_ROLES.includes(user?.role);
  const showVotingTable = status !== 'Upcoming' && quorumMet;

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
        {/* Date/Venue/Priority/Type/Description (#3) - all five stay visible
            from "Start Attendance" right through to the meeting closing, not
            just at the Upcoming/schedule stage. */}
        <div className="card bg-slate-50 border-0">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-slate-600">
              <Clock size={14} className="text-slate-400 shrink-0" /> {fmtDateTime(detail.date)} {detail.time && `· ${detail.time}`}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <MapPin size={14} className="text-slate-400 shrink-0" /> {detail.location || '—'}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <Flag size={14} className="text-slate-400 shrink-0" /> {detail.priority || 'Medium'}
            </p>
            <p className="flex items-center gap-2 text-slate-600">
              <Tag size={14} className="text-slate-400 shrink-0" /> {detail.type === 'Committee' ? 'Committee (Management)' : 'General (Members)'}
            </p>
            {detail.description && (
              <p className="flex items-start gap-2 text-slate-600">
                <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" /> <span>{detail.description}</span>
              </p>
            )}
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
      ) : !showVotingTable ? (
        // Upcoming, OR In Progress but quorum not yet met (#1) - plain
        // Sr./Agenda list only, no Vote/Decision until quorum is reached.
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
              {/* Decision now renders under the Vote cell itself, so no
                  separate Decision column is needed (#4). */}
              <th className="font-medium pb-1.5">Vote</th>
            </tr>
          </thead>
          <tbody>
            {agendaItems.map((a, i) => (
              <tr key={a._id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 text-slate-500">{i + 1}</td>
                <td className="py-2 text-slate-700">{a.agenda}</td>
                <td className="py-2">
                  <OptionSelectVote
                    item={a}
                    canVote={canVote && status === 'In Progress'}
                    hasJoined={hasJoined}
                    onVote={handleVote}
                    busy={votingId === a._id}
                    hasVoted={a.hasVoted}
                    addOptionButton={
                      canManage ? (
                        <button onClick={() => setOptionModalAgenda(a._id)} title="Add Option" className="text-slate-400 hover:text-brand-600 shrink-0">
                          <Plus size={15} />
                        </button>
                      ) : null
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Decision: {a.decision && a.decision.votes > 0 ? <span className="text-slate-600 font-medium">{a.decision.label}(Votes={a.decision.votes})</span> : '—'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Action buttons - Secretary controls (Start/Stop/Cancel) are shown
          purely based on `status`, independent of whether *this* viewer has
          joined; the participant's own Add Me / Exit action is a separate
          block driven by hasJoined/hasExited (#2 fix: once hasExited is
          true, neither button renders again for this person). Stop Meeting
          additionally requires quorum to be met (#1). */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {status === 'Upcoming' && canManage && (
          <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/start-attendance`))} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
            <PlayCircle size={15} /> Start Attendance
          </button>
        )}

        {status === 'In Progress' && canManage && quorumMet && (
          <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/stop`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
            <StopCircle size={15} /> Stop Meeting
          </button>
        )}

        {['Upcoming', 'In Progress'].includes(status) && canManage && (
          <button disabled={busy} onClick={() => act(() => api.patch(`/meetings/${meeting._id}/cancel`))} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
            <XCircle size={15} /> Cancel Meeting
          </button>
        )}

        {status === 'In Progress' && !hasJoined && (
          <button disabled={busy} onClick={() => act(() => api.post(`/meetings/${meeting._id}/add-me`))} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Add Me
          </button>
        )}

        {status === 'In Progress' && hasJoined && !hasExited && (
          <button
            onClick={() => act(() => api.post(`/meetings/${meeting._id}/exit`), false).then(onClose)}
            className="btn-secondary flex items-center gap-1.5"
          >
            <LogOut size={15} /> Exit from Meeting
          </button>
        )}
      </div>

      {status === 'In Progress' && !quorumMet && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm text-amber-800">
          <Hourglass size={16} className="shrink-0 mt-0.5" />
          <p>
            Minimum required {isGeneral ? 'members' : 'management'} have not yet joined ({relevantJoined}/{relevantRequired}). Voting will unlock, and the meeting can be stopped, once quorum is met.
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

      <AddOptionModal agendaId={optionModalAgenda} onClose={() => setOptionModalAgenda(null)} onAdded={load} />
    </div>
  );
};

// Schedule Meeting modal (#1) - now a 2-tab wizard matching the mockup:
// Tab 1 "Meeting Information" (title/type/priority/date/time/venue/
// description), Tab 2 "Add Agenda" (add/edit/delete/drag-reorder agenda
// items). Both tabs share the same Cancel/Save - nothing is actually
// created until Save is pressed on either tab.
const TABS_META = [
  { id: 1, label: '1. Meeting Information' },
  { id: 2, label: '2. Add Agenda' },
];

const MAX_DESCRIPTION = 500;

const ScheduleMeetingModal = ({ open, onClose, onSubmit }) => {
  const [tab, setTab] = useState(1);
  const [values, setValues] = useState({ title: '', type: 'General', priority: 'Medium', date: '', time: '', location: '', description: '' });
  const [agendaList, setAgendaList] = useState([]); // [{ text }]
  const [agendaDraft, setAgendaDraft] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(1);
      setValues({ title: '', type: 'General', priority: 'Medium', date: '', time: '', location: '', description: '' });
      setAgendaList([]);
      setAgendaDraft('');
      setEditingIdx(null);
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

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditingText(agendaList[idx]);
  };

  const saveEdit = (idx) => {
    const text = editingText.trim();
    if (!text) return;
    setAgendaList(agendaList.map((a, i) => (i === idx ? text : a)));
    setEditingIdx(null);
  };

  // Drag-to-reorder (#1's "You can reorder agenda items by dragging them up
  // or down" note) - plain HTML5 drag events, no extra library needed.
  const onDragStart = (idx) => setDragIdx(idx);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...agendaList];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setAgendaList(next);
    setDragIdx(null);
  };

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
        <div className="flex items-center gap-2 px-5 pt-5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
            <CalendarDays size={16} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Schedule Meeting</h3>
        </div>

        {/* Tabstrip (#1) */}
        <div className="flex border-b border-slate-200 mt-4 px-5">
          {TABS_META.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {tab === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input className="input" required value={values.title} onChange={(e) => set('title', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select className="input" value={values.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="General">General (Members)</option>
                    <option value="Committee">Committee (Management)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority *</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time (e.g. 07:00 PM) *</label>
                  <input className="input" value={values.time} onChange={(e) => set('time', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Venue *</label>
                <input className="input" value={values.location} onChange={(e) => set('location', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  maxLength={MAX_DESCRIPTION}
                  placeholder="Enter meeting description..."
                  value={values.description}
                  onChange={(e) => set('description', e.target.value)}
                />
                <p className="text-right text-xs text-slate-400 mt-0.5">{values.description.length} / {MAX_DESCRIPTION}</p>
              </div>
            </>
          )}

          {tab === 2 && (
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
                    <li
                      key={i}
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(i)}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-2 py-1.5 text-sm cursor-grab active:cursor-grabbing"
                    >
                      <span className="flex items-center gap-1.5 min-w-0 flex-1">
                        <GripVertical size={14} className="text-slate-300 shrink-0" />
                        {editingIdx === i ? (
                          <input
                            autoFocus
                            className="input py-1 text-sm"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), saveEdit(i))}
                          />
                        ) : (
                          <span className="text-slate-700 truncate">
                            {i + 1}. {a}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 shrink-0 ml-2">
                        {editingIdx === i ? (
                          <button type="button" onClick={() => saveEdit(i)} className="text-emerald-600 hover:text-emerald-800">
                            <Check size={14} />
                          </button>
                        ) : (
                          <button type="button" onClick={() => startEdit(i)} className="text-blue-500 hover:text-blue-700">
                            <Pencil size={14} />
                          </button>
                        )}
                        <button type="button" onClick={() => removeAgenda(i)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {agendaList.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">You can reorder agenda items by dragging them up or down.</p>
              )}
            </div>
          )}

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
