"use client";
import { useState, useEffect } from 'react';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch('/api/company/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    }
  };

  if (loading) return <div className="container animate-fade-in"><p>Loading profile...</p></div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient">Company Profile</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-outline">
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="card glass-panel">
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label">Company Name</label>
              <input type="text" className="input-field" value={profile?.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Location</label>
              <input type="text" className="input-field" value={profile?.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Contact Person</label>
              <input type="text" className="input-field" value={profile?.contactPerson || ''} onChange={e => setProfile({...profile, contactPerson: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><p className="text-muted">Company Name</p><p style={{ fontSize: '1.25rem' }}>{profile?.name || 'Not set'}</p></div>
            <div><p className="text-muted">Registration Number</p><p>{profile?.registrationNumber || 'Not set'}</p></div>
            <div><p className="text-muted">Location</p><p>{profile?.location || 'Not set'}</p></div>
            <div><p className="text-muted">Contact Person</p><p>{profile?.contactPerson || 'Not set'}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
