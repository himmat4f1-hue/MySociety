import React, { useEffect, useState } from 'react';
import { ListChecks, ThumbsUp } from 'lucide-react';
import api from '../api/axios';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import FormModal from '../components/FormModal';
import { useAuth } from '../context/AuthContext';

const AgendaItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [voting, setVoting] = useState(null);

  const canWrite = user?.role === 'secretary';
  const canVote = ['secretary', 'chairman', 'treasurer', 'committee_member'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const [itemsRes, meetRes] = await Promise.all([
        api.get('/agenda-items', { params: { limit: 100 } }),
        api.get('/meetings', { params: { limit: 100 } }),
      ]);
      setItems(itemsRes.data.data);
      setMeetings(meetRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVote = async (id) => {
    setVoting(id);
    try {
      await api.post(`/agenda-items/${id}/vote`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not vote');
    } finally {
      setVoting(null);
    }
  };

  const handleAdd = async (values) => {
    const meetingObj = meetings.find((m) => m.title === values.meeting);
    await api.post('/agenda-items', { ...values, meeting: meetingObj?._id });
    await load();
  };

  const meetingTitle = (id) => meetings.find((m) => m._id === id)?.title || meetings.find((m) => m._id === id?._id)?.title || '—';

  return (
    <Layout title="Meeting Agenda Items" subtitle="Decisions, status and vote counts per agenda item">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ListChecks} label="Total Agenda Items" value={items.length} color="blue" />
        <StatCard icon={ListChecks} label="In Discussion" value={items.filter((i) => i.agendaStatus === 'In Discussion').length} color="amber" />
        <StatCard icon={ListChecks} label="Resolved" value={items.filter((i) => i.agendaStatus === 'Resolved').length} color="green" />
        <StatCard icon={ListChecks} label="Not Started" value={items.filter((i) => i.agendaStatus === 'Not Started').length} color="slate" />
      </div>

      {canWrite && (
        <button onClick={() => setModalOpen(true)} className="btn-primary mb-4">
          + Add Agenda Item
        </button>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400">No agenda items yet.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="card">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs text-slate-400 mb-1">{item.meeting?.title || meetingTitle(item.meeting)}</p>
                  <h3 className="font-semibold text-slate-800">{item.agenda}</h3>
                  {item.managementDecision && (
                    <p className="text-sm text-slate-600 mt-1"><strong>Decision:</strong> {item.managementDecision}</p>
                  )}
                  {(item.estimatedStartDate || item.estimatedEndDate) && (
                    <p className="text-xs text-slate-500 mt-1">
                      Estimated: {item.estimatedStartDate ? new Date(item.estimatedStartDate).toLocaleDateString() : '—'} to {item.estimatedEndDate ? new Date(item.estimatedEndDate).toLocaleDateString() : '—'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    <Badge text={item.priority} />
                    <Badge text={item.agendaStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{item.noOfVotes} votes</span>
                    {canVote && (
                      <button
                        disabled={voting === item._id}
                        onClick={() => handleVote(item._id)}
                        className="btn-secondary text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-50"
                      >
                        <ThumbsUp size={12} /> Vote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {canWrite && (
        <FormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAdd}
          title="Add Agenda Item"
          fields={[
            { name: 'meeting', label: 'Meeting', type: 'select', options: meetings.map((m) => m.title), required: true },
            { name: 'agenda', label: 'Agenda', type: 'textarea', required: true },
            { name: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
            { name: 'managementDecision', label: 'Management Decision' },
            { name: 'agendaStatus', label: 'Agenda Status', type: 'select', options: ['Not Started', 'In Discussion', 'Postponed', 'Resolved', 'Rejected'] },
            { name: 'estimatedStartDate', label: 'Estimated Start Date', type: 'date' },
            { name: 'estimatedEndDate', label: 'Estimated End Date', type: 'date' },
          ]}
        />
      )}
    </Layout>
  );
};

export default AgendaItems;
