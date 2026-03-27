export default function AdminSegmentLoading() {
  return (
    <main className="admin-dashboard-page admin-route-loading" aria-busy="true" aria-label="Loading">
      <div className="admin-route-loading-card">
        <span className="admin-route-loading-spinner" aria-hidden="true" />
        <p className="admin-route-loading-text">Loading…</p>
      </div>
    </main>
  );
}
