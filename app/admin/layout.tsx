import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <Link href="/" className="nav-link">← Vissza az oldalra</Link>
        <span className="nav-title">Admin</span>
      </nav>
      {children}
      <style>{`
        .admin-layout { min-height: 100vh; padding: 0 16px 32px; background: var(--bg); }
        .admin-nav { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .nav-link { color: var(--accent-2); font-size: 14px; }
        .nav-title { color: var(--muted); font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
      `}</style>
    </div>
  )
}