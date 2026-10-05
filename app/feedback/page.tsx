"use client";
import { useState, useEffect } from 'react';

export default function StudentFeedbackPage() {
  const [type, setType] = useState('STUDENT_ON_COMPANY');
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hover, setHover] = useState(0);

  useEffect(() => { fetch('/api/companies').then(res => res.json()).then(data => setCompanies(Array.isArray(data) ? data : [])); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rating, comments: type === 'STUDENT_ON_COMPANY' ? `[company:${companyId}] ${comments}` : comments })
      });
      if (res.ok) {
        setSubmitted(true);
        setComments('');
        setRating(5);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch { alert('Error submitting feedback'); }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Submit Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>Share your internship experience or platform suggestions</p>
      </div>

      {submitted && (
        <div className="card" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', marginBottom: '1.5rem', textAlign: 'center', padding: '1.25rem' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>✓ Thank you! Your feedback has been submitted.</p>
          <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ marginTop: '0.75rem' }}>Submit Another</button>
        </div>
      )}

      <div className="card" style={{ padding: '1.75rem' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label required-label">Feedback Type</label>
            <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
              <option value="STUDENT_ON_COMPANY">Rate Company / Internship Experience</option>
              <option value="SYSTEM">Platform Suggestion / Bug Report</option>
            </select>
          </div>

          {type === 'STUDENT_ON_COMPANY' && (
            <>
              <div className="input-group">
                <label className="input-label required-label">Company</label>
                <select className="input-field" value={companyId} onChange={e => setCompanyId(e.target.value)} required>
                  <option value="">Select the company</option>
                  {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Company Culture</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>How was the overall company culture and work environment?</p>
              </div>
              <div className="input-group">
                <label className="input-label">Mentorship Quality</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Rate the quality of mentorship and guidance received.</p>
              </div>
              <div className="input-group">
                <label className="input-label">Technical Learning</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Rate the technical learning opportunities provided.</p>
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label required-label">Overall Rating</label>
            <div style={{ display: 'flex', gap: '0.35rem', fontSize: '1.75rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{ cursor: 'pointer', color: star <= (hover || rating) ? 'var(--warning)' : 'var(--surface-border)', transition: 'color 0.15s' }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >★</span>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label required-label">Detailed Comments</label>
            <textarea className="input-field" rows={5} value={comments} onChange={e => setComments(e.target.value)} 
              placeholder={type === 'SYSTEM' ? "Describe the feature suggestion or bug you'd like to report..." : "Share your detailed experience including strengths and areas for improvement..."} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}
