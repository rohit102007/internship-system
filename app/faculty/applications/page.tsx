"use client";
import { useState, useEffect } from 'react';

export default function FacultyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Schedule interview modal
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewerDetails, setInterviewerDetails] = useState('');

  // Evaluate modal
  const [evaluating, setEvaluating] = useState<any>(null);
  const [criteria, setCriteria] = useState('');
  const [scoring, setScoring] = useState('');
  const [evalFeedback, setEvalFeedback] = useState('');

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch('/api/applications/' + appId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch { alert("Failed to update status"); }
  };

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: scheduling, date: interviewDate, time: interviewTime, interviewerDetails })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Interview scheduled!');
        setScheduling(null);
        setInterviewDate('');
        setInterviewTime('');
        setInterviewerDetails('');
      } else {
        alert(data.error);
      }
    } catch { alert("Failed to schedule interview"); }
  };

  const submitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: evaluating.studentId,
          internshipId: evaluating.internshipId,
          criteria,
          scoring,
          feedback: evalFeedback
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Evaluation submitted!');
        setEvaluating(null);
        setCriteria('');
        setScoring('');
        setEvalFeedback('');
      } else {
        alert(data.error);
      }
    } catch { alert("Failed to submit evaluation"); }
  };

  return (
    <div className="container animate-fade-in">
      <h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Review Applications</h1>

      {/* Schedule Interview Modal */}
      {scheduling && (
        <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>Schedule Interview</h3>
          <form onSubmit={scheduleInterview} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label required-label">Date</label>
              <input type="date" className="input-field" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label required-label">Time</label>
              <input type="time" className="input-field" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} required />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label required-label">Interviewer Details</label>
              <input type="text" className="input-field" placeholder="Name, designation, department" value={interviewerDetails} onChange={e => setInterviewerDetails(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Schedule</button>
            <button type="button" onClick={() => setScheduling(null)} className="btn btn-outline">Cancel</button>
          </form>
        </div>
      )}

      {/* Evaluate Modal */}
      {evaluating && (
        <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>Evaluate Student: {evaluating.student?.user?.name}</h3>
          <form onSubmit={submitEvaluation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label required-label">Evaluation Criteria</label>
              <textarea className="input-field" rows={3} placeholder="Technical skills, communication, problem solving..." value={criteria} onChange={e => setCriteria(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label required-label">Score (1-5)</label>
              <input type="number" min="1" max="5" step="1" className="input-field" value={scoring} onChange={e => setScoring(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Feedback</label>
              <textarea className="input-field" rows={2} value={evalFeedback} onChange={e => setEvalFeedback(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Submit Evaluation</button>
            <button type="button" onClick={() => setEvaluating(null)} className="btn btn-outline">Cancel</button>
          </form>
        </div>
      )}
      
      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="card glass-panel" style={{ textAlign: 'center' }}>
          <p className="text-muted">No applications received for your internships yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>{app.student?.user?.name}</h3>
                  <p className="text-muted" style={{ margin: '0.25rem 0' }}>{app.student?.user?.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{app.internship?.title}</p>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', textTransform: 'capitalize',
                    background: app.status === 'pending' ? 'rgba(245,158,11,0.1)' : app.status === 'accepted' ? 'rgba(16,185,129,0.1)' : app.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                    color: app.status === 'pending' ? '#F59E0B' : app.status === 'accepted' ? '#10B981' : app.status === 'rejected' ? '#EF4444' : '#3B82F6'
                  }}>{app.status}</span>
                </div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                <p><strong>Resume:</strong> <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>View PDF</a></p>
                {app.coverLetter && <p><strong>Cover Letter:</strong> {app.coverLetter}</p>}
                <p><strong>Applied on:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => updateStatus(app.id, 'shortlisted')} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }} disabled={app.status === 'shortlisted'}>Shortlist</button>
                <button onClick={() => updateStatus(app.id, 'accepted')} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', background: 'var(--accent)' }} disabled={app.status === 'accepted'}>Accept</button>
                <button onClick={() => updateStatus(app.id, 'rejected')} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} disabled={app.status === 'rejected'}>Reject</button>
                <button onClick={() => setScheduling(app.id)} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>📅 Schedule Interview</button>
                <button onClick={() => setEvaluating(app)} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem' }}>📝 Evaluate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
