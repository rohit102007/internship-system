"use client";
import { useState, useEffect } from 'react';

export default function ManageInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [duration, setDuration] = useState('');
  const [stipend, setStipend] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchInternships = async () => {
    try {
      const res = await fetch('/api/internships?mine=true');
      const data = await res.json();
      setInternships(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchInternships(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, domain, duration, stipend, startDate, endDate, applicationDeadline })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      alert('Internship submitted for admin approval.');
      setShowForm(false);
      resetForm();
      fetchInternships();
    } catch { alert('Error posting internship'); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/internships/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, domain, duration, stipend, startDate, endDate, applicationDeadline })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      alert('Internship updated!');
      setEditingId(null);
      resetForm();
      fetchInternships();
    } catch { alert('Error updating internship'); }
  };

  const startEdit = (i: any) => {
    setEditingId(i.id);
    setTitle(i.title);
    setDescription(i.description);
    setDomain(i.domain);
    setDuration(i.duration.toString());
    setStipend(i.stipend.toString());
    setStartDate(new Date(i.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(i.endDate).toISOString().split('T')[0]);
    setApplicationDeadline(new Date(i.applicationDeadline).toISOString().split('T')[0]);
    setShowForm(false);
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setDomain(''); setDuration('');
    setStipend(''); setStartDate(''); setEndDate(''); setApplicationDeadline('');
  };

  const deleteInternship = async (id: string) => {
    if (!confirm('Archive this internship?')) return;
    try {
      const res = await fetch('/api/internships/' + id, { method: 'DELETE' });
      if (res.ok) { fetchInternships(); }
      else { const data = await res.json(); alert(data.error); }
    } catch { alert('Error deleting'); }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient">Manage Internships</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Post New Internship'}
        </button>
      </div>

      {(showForm || editingId) && (
        <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
          <h2>{editingId ? 'Edit Internship' : 'Post New Internship'}</h2>
          <form onSubmit={editingId ? handleEdit : handlePost} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Title</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Description</label>
              <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
            </div>
            <div className="input-group">
              <label className="input-label">Domain</label>
              <input type="text" className="input-field" value={domain} onChange={e => setDomain(e.target.value)} required placeholder="e.g. Software Engineering" />
            </div>
            <div className="input-group">
              <label className="input-label">Duration (Weeks, 4-24)</label>
              <input type="number" min="4" max="24" className="input-field" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Stipend ($)</label>
              <input type="number" className="input-field" value={stipend} onChange={e => setStipend(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Application Deadline</label>
              <input type="date" className="input-field" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Start Date</label>
              <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">End Date</label>
              <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Post'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : internships.length === 0 ? (
        <div className="card glass-panel" style={{ textAlign: 'center' }}><p className="text-muted">No internships posted yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {internships.map(i => (
            <div key={i.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>{i.title}</h3>
                <p className="text-muted" style={{ margin: '0.25rem 0' }}>{i.domain} • {i.duration} weeks • ${i.stipend}</p>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem',
                  background: i.status === 'OPEN' ? 'rgba(16,185,129,0.1)' : i.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: i.status === 'OPEN' ? '#10B981' : i.status === 'PENDING' ? '#F59E0B' : '#EF4444' }}>{i.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => startEdit(i)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>Edit</button>
                <button onClick={() => deleteInternship(i.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Archive</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
