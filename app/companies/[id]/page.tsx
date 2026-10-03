"use client";
import { useEffect, useState } from 'react';

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [company, setCompany] = useState<any>(null);
  useEffect(() => { params.then(({ id }) => fetch('/api/companies/' + id).then(res => res.json()).then(setCompany)); }, [params]);
  if (!company) return <div className="container"><p>Loading company details…</p></div>;
  if (company.error) return <div className="container"><p>{company.error}</p></div>;
  return <div className="container animate-fade-in" style={{ maxWidth: '900px' }}><div className="card"><h1 className="text-gradient">{company.name}</h1><p className="text-muted">{company.location}</p><p><strong>Contact:</strong> {company.contactPerson}{company.contactEmail ? ` · ${company.contactEmail}` : ''}{company.contactPhone ? ` · ${company.contactPhone}` : ''}</p><p><strong>Student rating:</strong> {company.rating ? `★ ${company.rating.toFixed(1)} from ${company.ratingCount} rating(s)` : 'No ratings yet'}</p></div><h2 style={{ marginTop: '2rem' }}>Posted internships</h2>{company.internships.length ? <div style={{ display: 'grid', gap: '1rem' }}>{company.internships.map((internship: any) => <div key={internship.id} className="card"><h3 style={{ margin: 0 }}>{internship.title}</h3><p className="text-muted">{internship.domain} · {internship.duration} weeks · ${internship.stipend}</p><p>{internship.description}</p></div>)}</div> : <p className="text-muted">No internships posted yet.</p>}</div>;
}
