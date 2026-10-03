"use client";
import { useEffect, useState } from 'react';

export default function FacultyReportsPage() {
  const [report, setReport] = useState<any>(null);
  useEffect(() => { fetch('/api/faculty/reports').then(r => r.json()).then(setReport).catch(() => setReport({ error: 'Unable to load report' })); }, []);
  if (!report) return <div className="container"><p>Loading report…</p></div>;
  if (report.error) return <div className="container"><p className="text-muted">{report.error}</p></div>;
  const cards = [['Posted internships', report.postings], ['Applications received', report.applications.total], ['Pending review', report.applications.pending], ['Shortlisted', report.applications.shortlisted], ['Accepted', report.applications.accepted], ['Scheduled interviews', report.interviews.scheduled], ['Completed interviews', report.interviews.completed], ['Evaluations submitted', report.evaluations.count], ['Average evaluation', Number(report.evaluations.averageScore).toFixed(1) + ' / 5']];
  return <div className="container animate-fade-in"><h1 className="text-gradient" style={{ marginBottom: '2rem' }}>My Internship Reports</h1><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>{cards.map(([label, value]) => <div key={String(label)} className="card"><p className="text-muted">{label}</p><p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{value}</p></div>)}</div></div>;
}
