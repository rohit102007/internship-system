"use client";
import { useEffect, useState } from 'react';

export default function FacultyFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]); const [replying, setReplying] = useState<string | null>(null); const [response, setResponse] = useState('');
  const load = () => fetch('/api/feedback').then(r => r.json()).then(data => setFeedbacks(Array.isArray(data) ? data : []));
  useEffect(() => { load(); }, []);
  const submit = async (id: string) => { const res = await fetch('/api/feedback/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response }) }); if (res.ok) { setReplying(null); setResponse(''); load(); } else alert((await res.json()).error); };
  return <div className="container animate-fade-in"><h1 className="text-gradient" style={{ marginBottom: '2rem' }}>Student Feedback</h1>{feedbacks.length === 0 ? <div className="card"><p className="text-muted">No feedback is available yet.</p></div> : <div style={{ display: 'grid', gap: '1rem' }}>{feedbacks.map(item => <div key={item.id} className="card"><div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}><strong>{item.student?.user?.name || 'Student'}</strong><span>{item.rating ? `${item.rating} / 5` : item.type}</span></div><p style={{ whiteSpace: 'pre-wrap' }}>{item.comments}</p>{replying === item.id ? <><textarea className="input-field" rows={3} value={response} onChange={e => setResponse(e.target.value)} placeholder="Write a response…" /><div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}><button className="btn btn-primary" onClick={() => submit(item.id)}>Send response</button><button className="btn btn-outline" onClick={() => setReplying(null)}>Cancel</button></div></> : <button className="btn btn-outline" onClick={() => { setReplying(item.id); setResponse(''); }}>Respond</button>}</div>)}</div>}</div>;
}
