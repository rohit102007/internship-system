"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', department: '', gpa: '', resumeUrl: '' });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/profile')
      .then(async res => {
        if (!res.ok) {
          setProfile(null);
          router.replace('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setProfile(data);
          setForm({
            name: data.user?.name || '',
            phone: data.user?.phone || '',
            department: data.department || '',
            gpa: data.gpa?.toString() || '',
            resumeUrl: data.resumeUrl || ''
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let resumeUrl = form.resumeUrl;
      if (resumeFile) {
        if (resumeFile.type !== 'application/pdf' || resumeFile.size > 5 * 1024 * 1024) {
          setError('Resume must be a PDF no larger than 5 MB');
          return;
        }
        const uploadData = new FormData();
        uploadData.append('resume', resumeFile);
        const uploadRes = await fetch('/api/resumes', { method: 'POST', body: uploadData });
        const upload = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(upload.error || 'Unable to upload resume');
          return;
        }
        resumeUrl = upload.resumeUrl;
      }
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, resumeUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        alert('Profile updated!');
        // Refresh
        const profileRes = await fetch('/api/student/profile');
        setProfile(await profileRes.json());
      } else {
        setError(data.error);
      }
    } catch { setError('Error updating profile'); }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Remove your resume from your profile? Applications that use it will keep their copy.')) return;
    setError('');
    try {
      const res = await fetch('/api/resumes', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unable to remove resume'); return; }
      setProfile({ ...profile, resumeUrl: null });
      setForm({ ...form, resumeUrl: '' });
      setResumeFile(null);
    } catch { setError('Unable to remove resume'); }
  };

  const handleDeactivateAccount = async () => {
    if (!confirm('Deactivate your account? You will be signed out and will need an administrator to reactivate it.')) return;
    setError('');
    try {
      const res = await fetch('/api/student/profile', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unable to deactivate account'); return; }
      router.replace('/login');
      router.refresh();
    } catch { setError('Unable to deactivate account'); }
  };

  if (loading) return <div className="container"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your personal information</p>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-outline">
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {error && (
        <div style={{
          color: 'var(--danger)',
          background: 'var(--danger-light)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>{error}</div>
      )}

      <div className="card" style={{ padding: '1.75rem' }}>
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="input-group">
              <label className="input-label">Phone (10-15 digits, international format)</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1234567890" />
            </div>
            <div className="input-group">
              <label className="input-label">Department</label>
              <input className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">GPA (0.0 - 4.0)</label>
              <input type="number" step="0.1" min="0" max="4" className="input-field" value={form.gpa} onChange={e => setForm({...form, gpa: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Resume (PDF only)</label>
              <input type="file" accept="application/pdf,.pdf" className="input-field" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PDF only, maximum 5 MB. Leave this empty to keep your current resume.</p>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {[
              ['Full Name', profile?.user?.name],
              ['Email', profile?.user?.email],
              ['Phone', profile?.user?.phone],
              ['Department', profile?.department],
              ['GPA', profile?.gpa],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.15rem 0', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '1rem', margin: 0 }}>{value || 'Not set'}</p>
              </div>
            ))}
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.15rem 0', fontWeight: 500 }}>Resume</p>
              {profile?.resumeUrl ? (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 500 }}>📄 View Resume (PDF)</a>
              ) : (
                <p style={{ margin: 0 }}>No resume uploaded. <button onClick={() => setIsEditing(true)} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-sans)' }}>Upload now</button></p>
              )}
              {profile?.resumeUrl && <button onClick={handleDeleteResume} className="btn btn-outline" style={{ marginTop: '0.65rem', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}>Delete resume</button>}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
        <p style={{ margin: '0 0 .65rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.875rem' }}>Danger zone</p>
        <button onClick={handleDeactivateAccount} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Deactivate account</button>
      </div>
    </div>
  );
}
