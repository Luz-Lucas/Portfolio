import { requireAdmin } from '@/lib/auth';
import '../admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="admin">
      <header className="admin-header">
        <h1>Admin do portfólio</h1>
        <span>
          {user.user_metadata.user_name} · <a href="/">ver site</a>
        </span>
      </header>
      {children}
    </div>
  );
}
