"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Create user form
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', phone: '', role: 'STUDENT', department: '' });

  // Edit user
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/reports').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/internships').then(r => r.json()),
    ]).then(([reportsData, usersData, internshipsData]) => {
      if (!reportsData.error) setReports(reportsData);
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(internshipsData)) setInternships(internshipsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if (res.ok) {
      alert('User created!');
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', name: '', phone: '', role: 'STUDENT', department: '' });
      // Refresh users
      const usersRes = await fetch('/api/admin/users');
      setUsers(await usersRes.json());
    } else {
      alert(data.error);
    }
  };

  const editUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users/' + editingUser.id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingUser)
    });
    if (res.ok) {
      alert('User updated!');
      setEditingUser(null);
      const usersRes = await fetch('/api/admin/users');
      setUsers(await usersRes.json());
    }
  };

  const deactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    const res = await fetch('/api/admin/users/' + userId, { method: 'DELETE' });
    if (res.ok) {
      alert('User deactivated');
      const usersRes = await fetch('/api/admin/users');
      setUsers(await usersRes.json());
    }
  };

  const updateInternshipStatus = async (internshipId: string, status: string) => {
    const res = await fetch('/api/admin/internships', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internshipId, status })
    });
    if (res.ok) {
      setInternships(prev => prev.map(i => i.id === internshipId ? { ...i, status } : i));
    }
  };

  const deleteInternship = async (internshipId: string) => {
    if (!confirm('Are you sure you want to permanently delete this internship? This will also remove its applications and interviews.')) return;
    const res = await fetch('/api/admin/internships', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internshipId })
    });
    if (res.ok) {
      setInternships(prev => prev.filter(i => i.id !== internshipId));
    } else {
      alert('Failed to delete internship');
    }
  };

  const exportData = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (loading) return <div className="container"><p style={{ color: 'var(--text-muted)' }}>Loading admin dashboard...</p></div>;
  if (!reports) return <div className="container"><p style={{ color: 'var(--text-muted)' }}>Unauthorized or error loading.</p></div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'internships', label: 'Internships' },
    { id: 'compliance', label: 'Compliance' },
  ];

  const statCardStyle = {
    textAlign: 'center' as const,
    padding: '1.25rem'
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>System overview and management</p>
        </div>
        <button onClick={exportData} className="btn btn-outline">📥 Export CSV</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-warm)', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {[
            { label: 'Total Students', value: reports.systemOverview.totalStudents, color: 'var(--primary)' },
            { label: 'Total Faculty', value: reports.systemOverview.totalFaculty, color: 'var(--primary)' },
            { label: 'Total Companies', value: reports.systemOverview.totalCompanies, color: 'var(--accent)' },
            { label: 'Open Internships', value: reports.systemOverview.openInternships, color: 'var(--accent)' },
            { label: 'Total Applications', value: reports.applicationAnalytics.totalApplications, color: 'var(--warning)' },
            { label: 'Acceptance Rate', value: `${reports.applicationAnalytics.acceptanceRate}%`, color: 'var(--accent)' },
            { label: 'Students Placed', value: reports.placementSummary.totalStudentsPlaced, color: 'var(--accent)' },
            { label: 'Average Stipend', value: `$${reports.placementSummary.averageStipend}`, color: 'var(--primary)' },
          ].map((stat, i) => (
            <div key={i} className="card" style={statCardStyle}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 0.35rem 0', fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}

          {/* Application Status Breakdown */}
          <div className="card" style={{ gridColumn: 'span 2', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem' }}>Application Status Breakdown</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Pending', value: reports.applicationAnalytics.pending, color: 'var(--warning)' },
                { label: 'Shortlisted', value: reports.applicationAnalytics.shortlisted, color: 'var(--info)' },
                { label: 'Accepted', value: reports.applicationAnalytics.accepted, color: 'var(--accent)' },
                { label: 'Rejected', value: reports.applicationAnalytics.rejected, color: 'var(--danger)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.875rem' }}>{item.label}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Companies */}
          <div className="card" style={{ gridColumn: 'span 2', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem' }}>Top Companies by Internship Count</h3>
            {reports.companyStatistics.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No data yet.</p>
            ) : (
              <div>
                {reports.companyStatistics.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: i < reports.companyStatistics.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                    <span>{c.name}</span><strong>{c.count} internships</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Health */}
          <div className="card" style={{ gridColumn: 'span 2', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '1rem' }}>System Health & Activity</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div><p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.2rem 0' }}>Interviews</p><strong>{reports.systemOverview.totalInterviews} total / {reports.systemOverview.completedInterviews} completed</strong></div>
              <div><p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.2rem 0' }}>Evaluations</p><strong>{reports.systemOverview.totalEvaluations}</strong></div>
              <div><p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.2rem 0' }}>Feedback Items</p><strong>{reports.systemOverview.totalFeedback}</strong></div>
              <div><p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 0.2rem 0' }}>Registrations (7d)</p><strong>{reports.systemOverview.recentRegistrations}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ============ USERS TAB ============ */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setShowCreateUser(!showCreateUser)} className="btn btn-primary">
              {showCreateUser ? 'Cancel' : '+ Create User'}
            </button>
          </div>

          {showCreateUser && (
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Create New User</h3>
              <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group"><label className="input-label">Name</label><input className="input-field" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Email</label><input type="email" className="input-field" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Password</label><input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} /></div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="STUDENT">Student</option><option value="FACULTY">Faculty</option><option value="ADMIN">Admin</option><option value="COMPANY">Company</option>
                  </select>
                </div>
                <div className="input-group"><label className="input-label">Department</label><input className="input-field" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} /></div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Create User</button>
              </form>
            </div>
          )}

          {editingUser && (
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Edit User: {editingUser.email}</h3>
              <form onSubmit={editUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group"><label className="input-label">Name</label><input className="input-field" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} /></div>
                <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} /></div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select className="input-field" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="STUDENT">Student</option><option value="FACULTY">Faculty</option><option value="ADMIN">Admin</option><option value="COMPANY">Company</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                  <button type="button" onClick={() => setEditingUser(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 500 }}>{user.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                      <td>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>{user.role}</span>
                      </td>
                      <td>
                        <span style={{ color: user.studentProfile?.isActive === false ? 'var(--danger)' : 'var(--accent)', fontWeight: 500, fontSize: '0.875rem' }}>
                          {user.studentProfile?.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => setEditingUser(user)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>Edit</button>
                          <button onClick={() => deactivateUser(user.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Deactivate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============ INTERNSHIPS TAB ============ */}
      {activeTab === 'internships' && (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Posted By</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 500 }}>{i.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{i.company?.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{i.faculty?.user?.name}</td>
                    <td>{i.applications?.length || 0}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        background: i.status === 'OPEN' ? 'var(--accent-light)' : i.status === 'PENDING' ? 'var(--warning-light)' : i.status === 'REJECTED' || i.status === 'CLOSED' ? 'var(--danger-light)' : '#F0F0F0',
                        color: i.status === 'OPEN' ? 'var(--accent)' : i.status === 'PENDING' ? 'var(--warning)' : i.status === 'REJECTED' || i.status === 'CLOSED' ? 'var(--danger)' : '#888' }}>
                        {i.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {i.status === 'PENDING' && (
                          <button onClick={() => updateInternshipStatus(i.id, 'OPEN')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', color: 'var(--accent)', borderColor: 'var(--accent)' }}>Approve</button>
                        )}
                        {i.status === 'PENDING' && (
                          <button onClick={() => updateInternshipStatus(i.id, 'REJECTED')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Reject</button>
                        )}
                        {!['ARCHIVED', 'PENDING'].includes(i.status) && <button onClick={() => updateInternshipStatus(i.id, 'ARCHIVED')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>Archive</button>}
                        <button onClick={() => deleteInternship(i.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ COMPLIANCE TAB ============ */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>System Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['Email Verification', 'Password Policy (8+ chars)', 'Resume PDF Only', 'Duplicate Application Prevention', 'Interview 24h Notice'].map(policy => (
                <div key={policy} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{policy}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.82rem' }}>✓ Active</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Data Validation Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {['GPA Range (0.0-4.0)', 'Duration (4-24 weeks)', 'Feedback Rating (1-5)', 'Unique Registration Numbers', 'Future Dates Only'].map(rule => (
                <div key={rule} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>{rule}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.82rem' }}>✓ Enforced</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
