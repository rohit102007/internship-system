"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InternshipsPage() {
  const router = useRouter();
  const [internships, setInternships] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [minStipend, setMinStipend] = useState('');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [applicationError, setApplicationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [userRole, setUserRole] = useState<string | null | undefined>(undefined);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const resumeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/internships')
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setInternships(arr);
        setFiltered(arr);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setUserRole(data.user?.role ?? null))
      .catch(() => setUserRole(null));
  }, []);

  useEffect(() => {
    if (userRole !== 'STUDENT') return;
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAppliedIds(new Set(data.map((app: any) => app.internshipId)));
      })
      .catch(() => {});
  }, [userRole]);

  useEffect(() => {
    let result = internships;
    if (search) {
      result = result.filter(i => 
        i.title.toLowerCase().includes(search.toLowerCase()) || 
        i.company?.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (domainFilter) {
      result = result.filter(i => i.domain.toLowerCase().includes(domainFilter.toLowerCase()));
    }
    if (minStipend) {
      result = result.filter(i => i.stipend >= parseInt(minStipend));
    }
    setFiltered(result);
  }, [search, domainFilter, minStipend, internships]);

  const handleApply = async () => {
    if (!selectedInternshipId || !resume) return;
    setSubmitting(true);
    setApplicationError('');
    try {
      const uploadData = new FormData();
      uploadData.append('resume', resume);
      const uploadRes = await fetch('/api/resumes', { method: 'POST', body: uploadData });
      const upload = await uploadRes.json();
      if (!uploadRes.ok) {
        setApplicationError(upload.error || 'Unable to upload resume');
        return;
      }
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internshipId: selectedInternshipId, resumeUrl: upload.resumeUrl, coverLetter, qualifications })
      });
      const data = await res.json();
      if (!res.ok) setApplicationError(data.error || 'Unable to submit application');
      else {
        setAppliedIds(prev => new Set(prev).add(selectedInternshipId));
        setSelectedInternshipId(null);
        setResume(null);
        setCoverLetter('');
        setQualifications('');
        alert('Application submitted successfully!');
      }
    } catch {
      setApplicationError('Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const chooseInternship = (internshipId: string) => {
    if (!userRole) {
      router.push('/login');
      return;
    }
    if (userRole !== 'STUDENT') {
      alert('Only student accounts can apply for internships.');
      return;
    }
    setSelectedInternshipId(internshipId);
    setResume(null);
    setCoverLetter('');
    setQualifications('');
    setApplicationError('');
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Available Internships</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find and apply to opportunities that match your interests</p>
      </div>
      
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
        <input type="text" className="input-field" placeholder="Search by title or company..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 200px', marginBottom: 0 }} />
        <input type="text" className="input-field" placeholder="Filter by domain..." value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={{ flex: '1 1 180px', marginBottom: 0 }} />
        <input type="number" className="input-field" placeholder="Min stipend ($)" value={minStipend} onChange={e => setMinStipend(e.target.value)} style={{ flex: '1 1 140px', marginBottom: 0 }} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading opportunities...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>No open internships match your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filtered.map(internship => (
            <div key={internship.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{internship.title}</h3>
                <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {internship.domain}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.9rem' }}>
                {internship.company?.name || 'Company Name'} · {internship.company?.location || 'Remote'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1, lineHeight: 1.6 }}>
                {internship.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⏱ {internship.duration} Weeks</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>💰 ${internship.stipend}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📅 {new Date(internship.applicationDeadline).toLocaleDateString()}</span>
              </div>
              
              <button onClick={() => chooseInternship(internship.id)} className="btn btn-primary" style={{ width: '100%' }} disabled={userRole === undefined || appliedIds.has(internship.id)}>
                {appliedIds.has(internship.id) ? 'Applied ✓' : userRole === undefined ? 'Checking access…' : !userRole ? 'Login to apply' : userRole === 'STUDENT' ? 'Apply Now' : 'Student accounts only'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedInternshipId && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(26, 26, 46, 0.4)', display: 'grid', placeItems: 'center', padding: '1rem', zIndex: 20 }}>
          <div className="card" style={{ width: 'min(100%, 520px)', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Apply for internship</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem', fontSize: '0.9rem' }}>Upload your resume as a PDF. Maximum file size: 5 MB.</p>
            <input ref={resumeInput} id="resume-upload" type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0] || null; setResume(file); setApplicationError(file && file.size > 5 * 1024 * 1024 ? 'Resume must be no larger than 5 MB' : ''); }} />
            <label htmlFor="resume-upload" className="btn btn-outline" style={{ display: 'inline-flex', cursor: 'pointer', marginBottom: '0.75rem' }}>Choose PDF file</label>
            <div style={{ minHeight: '2rem', padding: '0.55rem 0.75rem', border: '1.5px dashed var(--surface-border)', borderRadius: 'var(--radius-sm)', color: resume ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.875rem', background: 'var(--surface-alt)' }}>{resume ? `Selected: ${resume.name}` : 'No resume selected'}</div>
            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="input-label">Cover letter</label>
              <textarea className="input-field" rows={3} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Briefly explain why you are a strong fit." />
            </div>
            <div className="input-group">
              <label className="input-label">Relevant qualifications</label>
              <textarea className="input-field" rows={2} value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder="Skills, certifications, or projects relevant to this role." />
            </div>
            {applicationError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 500 }}>{applicationError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button className="btn btn-outline" disabled={submitting} onClick={() => setSelectedInternshipId(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={!resume || !!applicationError || submitting} onClick={handleApply}>{submitting ? 'Submitting…' : 'Upload & Apply'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
