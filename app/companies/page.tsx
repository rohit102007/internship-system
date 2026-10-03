"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(data => {
        setCompanies(Array.isArray(data) ? data : []);
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
        <h1 style={{ marginBottom: '0.25rem' }}>Partner Companies</h1>
        <p style={{ color: 'var(--text-muted)' }}>Explore companies offering internship opportunities</p>
      </div>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading companies...</p>
      ) : companies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>No companies available.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {companies.map(company => (
            <div key={company.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginBottom: '0.75rem'
              }}>
                {company.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem' }}>{company.name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>📍 {company.location}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                <span style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 600 }}>{company.internships?.length || 0} Openings</span>
                <span>{company.rating ? `★ ${company.rating.toFixed(1)} (${company.ratingCount})` : 'No ratings yet'}</span>
              </div>
              <Link href={`/companies/${company.id}`} className="btn btn-outline" style={{ textAlign: 'center' }}>View details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
