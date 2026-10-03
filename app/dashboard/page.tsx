import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  let user = null;
  try {
    user = jwt.verify(token, JWT_SECRET) as any;
  } catch {
    redirect('/login');
  }

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    padding: '1.5rem'
  };

  const iconBoxStyle = (bg: string) => ({
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-sm)',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    marginBottom: '0.25rem'
  });

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome back, {user.email}</h1>
        <div style={{
          display: 'inline-flex',
          padding: '0.25rem 0.65rem',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em'
        }}>{user.role}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

        {/* ============ ADMIN ============ */}
        {user.role === 'ADMIN' && (
          <>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--info-light)')}>📊</div>
              <h3 style={{ margin: 0 }}>Analytics & Reports</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Placement summary, application analytics, system health.</p>
              <a href="/admin" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Dashboard</a>
            </div>
          </>
        )}

        {/* ============ STUDENT ============ */}
        {user.role === 'STUDENT' && (
          <>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--primary-light)')}>🔍</div>
              <h3 style={{ margin: 0 }}>Browse Internships</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Search and filter by domain, company, location, stipend.</p>
              <a href="/internships" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Browse</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--info-light)')}>📋</div>
              <h3 style={{ margin: 0 }}>My Applications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Track status, timeline, and feedback.</p>
              <a href="/applications" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Applications</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--accent-light)')}>📅</div>
              <h3 style={{ margin: 0 }}>My Interviews</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>View schedule, results, and feedback.</p>
              <a href="/interviews" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Schedule</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--warning-light)')}>👤</div>
              <h3 style={{ margin: 0 }}>My Profile</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Update resume, contact info, GPA.</p>
              <a href="/profile" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Edit Profile</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--warning-light)')}>⭐</div>
              <h3 style={{ margin: 0 }}>Give Feedback</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Rate companies, report bugs, suggest features.</p>
              <a href="/feedback" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Submit Feedback</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--accent-light)')}>📈</div>
              <h3 style={{ margin: 0 }}>Placement Report</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>View application status, interviews, and offer details.</p>
              <a href="/student/reports" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Report</a>
            </div>
          </>
        )}
        
        {/* ============ FACULTY ============ */}
        {user.role === 'FACULTY' && (
          <>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--primary-light)')}>💼</div>
              <h3 style={{ margin: 0 }}>Manage Internships</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Post, edit, and archive internship opportunities.</p>
              <a href="/faculty/internships" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Manage</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--info-light)')}>📝</div>
              <h3 style={{ margin: 0 }}>Review Applications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Evaluate, schedule interviews, accept/reject.</p>
              <a href="/faculty/applications" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Review</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--warning-light)')}>💬</div>
              <h3 style={{ margin: 0 }}>Student Feedback</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Review student feedback and respond to it.</p>
              <a href="/faculty/feedback" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Feedback</a>
            </div>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--accent-light)')}>📈</div>
              <h3 style={{ margin: 0 }}>My Reports</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Review posting, application, interview, and evaluation statistics.</p>
              <a href="/faculty/reports" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Reports</a>
            </div>
          </>
        )}

        {/* ============ COMPANY ============ */}
        {user.role === 'COMPANY' && (
          <>
            <div className="card" style={cardStyle}>
              <div style={iconBoxStyle('var(--primary-light)')}>🏛️</div>
              <h3 style={{ margin: 0 }}>Company Profile</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Manage your company details and profile.</p>
              <a href="/company/profile" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>View Profile</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
