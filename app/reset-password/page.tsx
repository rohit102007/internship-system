"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

function ResetPasswordForm() {
  const params = useSearchParams(); const router = useRouter(); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (password !== confirmPassword) { setError('Passwords do not match'); return; } setLoading(true); setError(''); try { const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: params.get('token'), password }) }); const data = await res.json(); if (!res.ok) setError(data.error); else router.push('/login'); } catch { setError('Something went wrong. Please try again.'); } finally { setLoading(false); } };
  return <><form onSubmit={submit}><div className="input-group"><label className="input-label required-label">New password</label><input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required /><p className="text-muted" style={{ fontSize: '.8rem' }}>At least 8 characters with uppercase, lowercase, number, and special character.</p></div><div className="input-group"><label className="input-label required-label">Confirm password</label><input type="password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div><button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button></form>{error && <p style={{ color: 'var(--danger)' }}>{error}</p>}</>;
}

export default function ResetPasswordPage() {
  return <div className="container flex-center animate-fade-in" style={{ minHeight: '70vh' }}><div className="card glass-panel" style={{ width: '100%', maxWidth: '460px' }}><h1 className="text-gradient" style={{ textAlign: 'center' }}>Choose a new password</h1><Suspense fallback={<p className="text-muted" style={{ textAlign: 'center' }}>Loading...</p>}><ResetPasswordForm /></Suspense><p style={{ textAlign: 'center', marginTop: '1rem' }}><Link href="/login" style={{ color: 'var(--primary)' }}>Back to login</Link></p></div></div>;
}
