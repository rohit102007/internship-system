import Link from "next/link";

export default function Home() {
  return (
    <div className="container animate-fade-in">
      <section style={{
        textAlign: 'center',
        padding: '5rem 0 3.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.35rem 1rem',
          background: 'var(--primary-light)',
          borderRadius: '20px',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          Your internship journey starts here
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          lineHeight: 1.15,
          fontWeight: 800,
          maxWidth: '720px',
          margin: '0 auto',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)'
        }}>
          Bridge the gap between <span style={{ color: 'var(--primary)' }}>Classroom</span> and <span style={{ color: 'var(--accent)' }}>Career</span>
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '520px',
          margin: '0 auto',
          lineHeight: 1.7
        }}>
          A unified platform for students, faculty, and companies to seamlessly manage the entire internship lifecycle.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/register?role=student" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Get Started as Student
          </Link>
          <Link href="/register?role=faculty" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Register as Faculty
          </Link>
        </div>
      </section>

      <section style={{ padding: '3rem 0 4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Everything you need in one place</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            Designed for every stakeholder in the internship process
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {[
            {
              title: "For Students",
              desc: "Discover opportunities, apply with one click, and track your application status in real-time.",
              icon: "🎓",
              color: "var(--primary)",
              bg: "var(--primary-light)"
            },
            {
              title: "For Faculty",
              desc: "Monitor student progress, evaluate performance, and generate comprehensive reports.",
              icon: "📋",
              color: "var(--info)",
              bg: "var(--info-light)"
            },
            {
              title: "For Companies",
              desc: "Post internships, review applications, schedule interviews, and provide feedback.",
              icon: "🏛️",
              color: "var(--accent)",
              bg: "var(--accent-light)"
            }
          ].map((feature, i) => (
            <div key={i} className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: feature.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: feature.color }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
