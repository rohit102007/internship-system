"use client";
import { useState, useEffect } from 'react';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/interviews')
      .then(res => res.json())
      .then(data => {
        setInterviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>My Interviews</h1>
        <p style={{ color: 'var(--text-muted)' }}>View your upcoming and past interview schedule</p>
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading interviews...</p>
      ) : interviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>You have no scheduled interviews yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {interviews.map(interview => (
            <div key={interview.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{interview.application?.internship?.title}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>{interview.application?.internship?.company?.name}</p>
                <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <p style={{ margin: 0 }}><strong>Date & Time:</strong> {new Date(interview.date).toLocaleDateString()} at {interview.time}</p>
                  <p style={{ margin: 0 }}><strong>Interviewer:</strong> {interview.interviewerDetails}</p>
                </div>
              </div>
              <span style={{ 
                padding: '0.3rem 0.75rem', 
                borderRadius: '20px', 
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'var(--info-light)',
                color: 'var(--info)'
              }}>
                {interview.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
