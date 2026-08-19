import React, { useState } from 'react';
import { Vote, Trophy, Info } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MANAGEMENT_ROLES = ['Chairman', 'Secretary', 'Accountant', 'Treasurer'];

const Elections = () => {
  const { user } = useAuth();
  const isCommittee = user?.role === 'committee_member';
  const canSeeResults = ['secretary', 'chairman'].includes(user?.role);

  const [tab, setTab] = useState('committee');

  // Committee ballot state
  const [cDate, setCDate] = useState(new Date().toISOString().slice(0, 10));
  const [cCandidate, setCCandidate] = useState('');
  const [cMsg, setCMsg] = useState('');

  // Management ballot state
  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mRole, setMRole] = useState('Chairman');
  const [mCandidate, setMCandidate] = useState('');
  const [mMsg, setMMsg] = useState('');

  // Results state
  const [resultsDate, setResultsDate] = useState(new Date().toISOString().slice(0, 10));
  const [resultsRole, setResultsRole] = useState('Chairman');
  const [committeeResults, setCommitteeResults] = useState(null);
  const [managementResults, setManagementResults] = useState(null);

  const submitCommitteeVote = async (e) => {
    e.preventDefault();
    setCMsg('');
    try {
      const res = await api.post('/committee-votes', { electionDate: cDate, candidateFlatId: cCandidate });
      setCMsg(res.data.message);
      setCCandidate('');
    } catch (err) {
      setCMsg(err.response?.data?.message || 'Could not submit vote');
    }
  };

  const submitManagementVote = async (e) => {
    e.preventDefault();
    setMMsg('');
    try {
      const res = await api.post('/management-votes', { electionDate: mDate, role: mRole, candidateFlatId: mCandidate });
      setMMsg(res.data.message);
      setMCandidate('');
    } catch (err) {
      setMMsg(err.response?.data?.message || 'Could not submit vote');
    }
  };

  const loadCommitteeResults = async () => {
    const res = await api.get('/committee-votes/results', { params: { electionDate: resultsDate } });
    setCommitteeResults(res.data);
  };

  const loadManagementResults = async () => {
    const res = await api.get('/management-votes/results', { params: { electionDate: resultsDate, role: resultsRole } });
    setManagementResults(res.data);
  };

  return (
    <>
      <div className="flex border-b border-slate-200 mb-6">
        {[
          { id: 'committee', label: 'Vote for Committee Member' },
          { id: 'management', label: 'Vote for Upper Management' },
          ...(canSeeResults ? [{ id: 'results', label: 'Results' }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 pb-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'committee' && (
        <div className="max-w-lg card">
          <div className="flex items-start gap-2 bg-blue-50 text-blue-700 text-xs rounded-lg p-3 mb-5">
            <Info size={14} className="mt-0.5 shrink-0" />
            One vote per flat. Candidates are announced separately (e.g. on the Notice Board) - enter their Flat ID below.
          </div>
          <form onSubmit={submitCommitteeVote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Election Date</label>
              <input type="date" className="input" value={cDate} onChange={(e) => setCDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Candidate's Flat ID (e.g. "G 610")</label>
              <input className="input" value={cCandidate} onChange={(e) => setCCandidate(e.target.value)} required />
            </div>
            {cMsg && <p className="text-sm text-slate-600">{cMsg}</p>}
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Vote size={16} /> Cast Vote
            </button>
          </form>
        </div>
      )}

      {tab === 'management' && (
        <div className="max-w-lg card">
          {!isCommittee ? (
            <p className="text-sm text-slate-500">Only Committee Members can vote for upper management roles.</p>
          ) : (
            <>
              <div className="flex items-start gap-2 bg-blue-50 text-blue-700 text-xs rounded-lg p-3 mb-5">
                <Info size={14} className="mt-0.5 shrink-0" />
                One vote per flat per role. Enter the candidate's Flat ID below.
              </div>
              <form onSubmit={submitManagementVote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Election Date</label>
                  <input type="date" className="input" value={mDate} onChange={(e) => setMDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select className="input" value={mRole} onChange={(e) => setMRole(e.target.value)}>
                    {MANAGEMENT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Candidate's Flat ID</label>
                  <input className="input" value={mCandidate} onChange={(e) => setMCandidate(e.target.value)} required />
                </div>
                {mMsg && <p className="text-sm text-slate-600">{mMsg}</p>}
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Vote size={16} /> Cast Vote
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {tab === 'results' && canSeeResults && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Trophy size={18} /> Committee Member Results</h3>
            <div className="flex gap-2 mb-4">
              <input type="date" className="input" value={resultsDate} onChange={(e) => setResultsDate(e.target.value)} />
              <button onClick={loadCommitteeResults} className="btn-secondary shrink-0">Load</button>
            </div>
            {committeeResults && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Total votes: {committeeResults.totalVotes}</p>
                {committeeResults.results.length === 0 ? (
                  <p className="text-sm text-slate-400">No votes yet for this date.</p>
                ) : (
                  committeeResults.results.map((r) => (
                    <div key={r.candidateFlatId} className="flex justify-between text-sm border-b border-slate-100 py-2">
                      <span>{r.candidateFlatId}</span>
                      <span className="font-semibold">{r.votes} votes</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Trophy size={18} /> Upper Management Results</h3>
            <div className="flex gap-2 mb-4">
              <input type="date" className="input" value={resultsDate} onChange={(e) => setResultsDate(e.target.value)} />
              <select className="input" value={resultsRole} onChange={(e) => setResultsRole(e.target.value)}>
                {MANAGEMENT_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button onClick={loadManagementResults} className="btn-secondary shrink-0">Load</button>
            </div>
            {managementResults && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-2">Total votes: {managementResults.totalVotes}</p>
                {managementResults.results.length === 0 ? (
                  <p className="text-sm text-slate-400">No votes yet for this date/role.</p>
                ) : (
                  managementResults.results.map((r) => (
                    <div key={r.candidateFlatId} className="flex justify-between text-sm border-b border-slate-100 py-2">
                      <span>{r.candidateFlatId}</span>
                      <span className="font-semibold">{r.votes} votes</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Elections;
