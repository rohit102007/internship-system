"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); const data = await res.json(); if (!res.ok) setError(data.error); else if (data.resetToken) router.push('/reset-password?token=' + encodeURIComponent(data.resetToken)); else setError('No account was found for that email address.'); };
  return <div className="container flex-center animate-fade-in" style={{ minHeight: '70vh' }}><div className="card glass-panel" style={{ width: '100%', maxWidth: '460px' }}><h1 className="text-gradient" style={{ textAlign: 'center' }}>Reset password</h1><p className="text-muted" style={{ textAlign: 'center' }}>Enter your account email to reset your password.</p><form onSubmit={submit}><div className="input-group"><label className="input-label required-label">Email address</label><input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required /></div><button className="btn btn-primary" style={{ width: '100%' }}>Continue</button></form>{error && <p style={{ color: 'var(--danger)' }}>{error}</p>}<p style={{ textAlign: 'center', marginTop: '1rem' }}><Link href="/login" style={{ color: 'var(--primary)' }}>Back to login</Link></p></div></div>;
}
