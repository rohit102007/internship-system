"use client";
import { useState, useEffect } from 'react';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const withdrawApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      const res = await fetch('/api/applications/' + appId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'withdrawn' })
      });
      if (res.ok) {
        setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: 'withdrawn' } : a));
      }
    } catch { alert("Failed to withdraw"); }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string, color: string }> = {
      pending: { bg: 'var(--warning-light)', color: 'var(--warning)' },
      shortlisted: { bg: 'var(--info-light)', color: 'var(--info)' },
      accepted: { bg: 'var(--accent-light)', color: 'var(--accent)' },
      rejected: { bg: 'var(--danger-light)', color: 'var(--danger)' },
      withdrawn: { bg: '#F0F0F0', color: '#888' },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>My Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track the status of your internship applications</p>
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1.05rem' }}>You haven&apos;t applied to any internships yet.</p>
          <a href="/internships" className="btn btn-primary">Browse Internships</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {applications.map(app => {
            const s = getStatusStyle(app.status);
            return (
              <div key={app.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{app.internship?.title}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>{app.internship?.company?.name}</p>
                  </div>
                  <span style={{ 
                    padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                    background: s.bg, color: s.color
                  }}>{app.status}</span>
                </div>

                <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Applied: {new Date(app.createdAt).toLocaleDateString()} &nbsp;·&nbsp;
                    Updated: {new Date(app.updatedAt).toLocaleDateString()}
                  </p>
                  {app.feedback && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}><strong>Feedback:</strong> {app.feedback}</p>}
                </div>

                {app.status === 'pending' && (
                  <button onClick={() => withdrawApplication(app.id)} className="btn btn-outline" style={{ marginTop: '0.85rem', borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}>
                    Withdraw Application
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
