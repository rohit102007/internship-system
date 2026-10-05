"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';
  
  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [gpa, setGpa] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          phone, 
          role,
          department,
          gpa
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: 'student', label: 'Student', icon: '🎓' },
    { key: 'faculty', label: 'Faculty', icon: '📋' }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create your account</h1>
        <p style={{ color: 'var(--text-muted)' }}>Join InternConnect and get started</p>
      </div>
      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div style={{
            color: 'var(--danger)',
            background: 'var(--danger-light)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>{error}</div>
        )}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="input-label" style={{ marginBottom: '0.6rem' }}>I am a...</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {roles.map(r => (
              <button 
                key={r.key}
                type="button"
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  border: `1.5px solid ${role === r.key ? 'var(--primary)' : 'var(--surface-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  background: role === r.key ? 'var(--primary-light)' : 'var(--surface)',
                  color: role === r.key ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: role === r.key ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
                onClick={() => setRole(r.key)}
              >
                <span style={{ fontSize: '1.15rem' }}>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label required-label">{role === 'company' ? 'Company Name' : 'Full Name'}</label>
            <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder={role === 'company' ? 'Acme Corp' : 'John Doe'} required />
          </div>
          
          <div className="input-group">
            <label className="input-label required-label">Email address</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <div className="input-group">
            <label className="input-label required-label">Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required 
                   pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$" 
                   title="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character"
                   placeholder="Min 8 characters with mixed case, number & symbol" />
          </div>

          <div className="input-group">
            <label className="input-label required-label">Phone number</label>
            <input type="tel" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" required />
          </div>

          {role === 'student' && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label required-label">Department</label>
                <input type="text" className="input-field" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computer Science" required />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label required-label">GPA (0.0 – 4.0)</label>
                <input type="number" step="0.1" min="0" max="4" className="input-field" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="3.5" required />
              </div>
            </div>
          )}

          {role === 'faculty' && (
            <div className="input-group">
              <label className="input-label required-label">Department</label>
              <input type="text" className="input-field" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computer Science" required />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
      <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
