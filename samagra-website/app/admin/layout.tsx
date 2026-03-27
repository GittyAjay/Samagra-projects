import { AdminAppChrome } from './admin-app-chrome';
import { adminStyles } from './admin-styles';
import { logoutAdmin } from './actions';
import { getAdminSession } from './lib';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="admin-app-root">
      <style dangerouslySetInnerHTML={{ __html: adminStyles }} />
      {session ? <AdminAppChrome logoutAction={logoutAdmin}>{children}</AdminAppChrome> : children}
    </div>
  );
}
