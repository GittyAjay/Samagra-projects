export default function RootLoading() {
  return (
    <div className="root-loading-wrapper">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes samagra-root-spin {
              to { transform: rotate(360deg); }
            }
            .samagra-root-loading {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 48px 24px;
              background: linear-gradient(135deg, #fdfdfd 0%, #fff7ef 55%, #f8fafc 100%);
              font-family: 'Open Sans', sans-serif;
            }
            .samagra-root-loading-inner {
              text-align: center;
              max-width: 320px;
            }
            .samagra-root-loading-spinner {
              width: 40px;
              height: 40px;
              margin: 0 auto 18px;
              border: 3px solid rgba(13, 35, 58, 0.12);
              border-top-color: #0d233a;
              border-radius: 50%;
              animation: samagra-root-spin 0.75s linear infinite;
            }
            .samagra-root-loading-inner h1 {
              font-family: 'Oswald', sans-serif;
              font-size: 22px;
              font-weight: 600;
              color: #0d233a;
              margin: 0 0 8px;
            }
            .samagra-root-loading-inner p {
              font-size: 14px;
              line-height: 1.6;
              color: #666;
              margin: 0;
            }
          `,
        }}
      />
      <main className="samagra-root-loading" role="status" aria-busy="true" aria-live="polite">
        <div className="samagra-root-loading-inner">
          <div className="samagra-root-loading-spinner" aria-hidden="true" />
          <h1>Loading</h1>
          <p>Preparing the page…</p>
        </div>
      </main>
    </div>
  );
}
