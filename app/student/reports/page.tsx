"use client";
import { useEffect, useState } from 'react';

export default function StudentReportsPage() {
  const [report, setReport] = useState<any>(null);
  useEffect(() => { fetch('/api/student/reports').then(r => r.json()).then(setReport).catch(() => setReport({ error: 'Unable to load report' })); }, []);
  if (!report) return <div className="container"><p>Loading report…</p></div>;
  if (report.error) return <div className="container"><p className="text-muted">{report.error}</p></div>;
  const stats = [['Total applications', report.applications.total], ['Pending', report.applications.pending], ['Shortlisted', report.applications.shortlisted], ['Accepted', report.applications.accepted], ['Upcoming interviews', report.interviews.upcoming.length]];
  return <div className="container animate-fade-in"><h1 className="text-gradient" style={{ marginBottom: '2rem' }}>My Placement Report</h1><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>{stats.map(([label, value]) => <div key={String(label)} className="card"><p className="text-muted">{label}</p><p style={{ margin: 0, fontWeight: 700, fontSize: '2rem' }}>{value}</p></div>)}</div><div className="card"><h2>Placement status</h2>{report.placement.length ? report.placement.map((offer: any) => <p key={offer.internship}><strong>{offer.internship}</strong> at {offer.company} — ${offer.stipend}</p>) : <p className="text-muted">No accepted offers yet.</p>}</div></div>;
}
