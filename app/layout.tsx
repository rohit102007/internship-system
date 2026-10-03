import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "InternConnect · College Internship Management",
  description: "A comprehensive platform connecting students, faculty, and companies for seamless internship management.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250, 246, 241, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--surface-border)',
          padding: '0'
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '60px'
          }}>
            <Link href="/" style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#FFF',
                fontSize: '0.9rem',
                fontWeight: 800
              }}>IC</span>
              InternConnect
            </Link>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <Link href="/internships" style={{
                color: 'var(--text-muted)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}>Internships</Link>
              <Link href="/companies" style={{
                color: 'var(--text-muted)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}>Companies</Link>

              {token ? (
                <>
                  <Link href="/dashboard" style={{
                    color: 'var(--text-main)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}>Dashboard</Link>
                  <form action={async () => {
                    "use server";
                    const cookieStore = await cookies();
                    cookieStore.delete('auth_token');
                    redirect('/login');
                  }}>
                    <button type="submit" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>Log out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Log in</Link>
                  <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main style={{ flex: 1, padding: '2rem 0' }}>
          {children}
        </main>
        <footer style={{
          borderTop: '1px solid var(--surface-border)',
          padding: '1.5rem 0',
          marginTop: 'auto',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          background: 'var(--bg-warm)'
        }}>
          <div className="container">
            <p>&copy; {new Date().getFullYear()} InternConnect — College Internship Management System</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
