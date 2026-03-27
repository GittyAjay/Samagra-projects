export const adminStyles = `
.admin-app-root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

:root {
  --admin-bg: #eff4ff;
  --admin-surface: rgba(255, 255, 255, 0.88);
  --admin-border: rgba(148, 163, 184, 0.2);
  --admin-ink: #0f172a;
  --admin-copy: #5f6f86;
  --admin-muted: #cbd5e1;
  --admin-accent: #f97316;
  --admin-info: #4f46e5;
  --admin-success: #059669;
  /* Form system — matches --admin-accent / console theme */
  --admin-form-label: #64748b;
  --admin-form-border: #e2e8f0;
  --admin-form-focus: #ea580c;
  --admin-form-focus-ring: rgba(249, 115, 22, 0.22);
  --admin-form-primary-from: #ea580c;
  --admin-form-primary-to: #fb923c;
  --admin-form-primary-shadow: rgba(234, 88, 12, 0.28);
}

.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfdfd 0%, #fff7ef 55%, #f8fafc 100%);
  padding: 40px 20px;
}

.admin-login-shell {
  max-width: 520px;
  margin: 0 auto;
}

.admin-login-card {
  background: #fff;
  border: 1px solid var(--admin-form-border);
  border-radius: 16px;
  padding: 36px 32px;
  box-shadow:
    0 20px 50px rgba(100, 116, 139, 0.1),
    0 4px 14px rgba(15, 23, 42, 0.05);
}

.admin-login-brand {
  margin-bottom: 26px;
}

.admin-brand-dark {
  color: #0d233a !important;
}

.admin-brand-dark span {
  color: #666 !important;
}

.admin-login-card h1 {
  font-family: 'Oswald', sans-serif;
  font-size: 38px;
  line-height: 1.08;
  color: #0d233a;
  margin-bottom: 14px;
}

.admin-login-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 18px;
}

.admin-auth-form,
.admin-stack-form {
  display: grid;
  gap: 18px;
}

.admin-form-group label {
  display: block;
  color: var(--admin-form-label);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  margin-bottom: 7px;
}

.admin-form-group input,
.admin-form-group select,
.admin-form-group textarea,
.admin-inline-form input,
.admin-inline-form select {
  width: 100%;
  border: 1px solid var(--admin-form-border);
  border-radius: 10px;
  background: #fff;
  color: var(--admin-ink);
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;
  padding: 10px 13px;
  min-height: 40px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.035);
}

.admin-form-group textarea {
  min-height: 96px;
  resize: vertical;
  line-height: 1.5;
}

.admin-form-group select,
.admin-inline-form select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 11px center;
  background-size: 16px;
  padding-right: 38px;
  cursor: pointer;
}

.admin-form-group input:focus,
.admin-form-group select:focus,
.admin-form-group textarea:focus,
.admin-inline-form input:focus,
.admin-inline-form select:focus {
  border-color: var(--admin-form-focus);
  box-shadow:
    0 0 0 2px var(--admin-form-focus-ring),
    0 3px 12px rgba(249, 115, 22, 0.1);
}

.admin-submit-btn {
  width: 100%;
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  min-height: 44px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: linear-gradient(145deg, var(--admin-form-primary-from) 0%, #f97316 45%, var(--admin-form-primary-to) 100%);
  color: #fff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 6px 18px var(--admin-form-primary-shadow);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, border-color 0.18s ease,
    background 0.18s ease;
}

.admin-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow:
    0 2px 6px rgba(15, 23, 42, 0.08),
    0 10px 26px rgba(234, 88, 12, 0.38);
}

.admin-submit-btn:active:not(:disabled) {
  transform: translateY(0);
  filter: brightness(0.98);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 4px 14px var(--admin-form-primary-shadow);
}

.admin-submit-btn--secondary {
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  color: #0f172a;
  border: 1px solid #94a3b8;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 4px 14px rgba(100, 116, 139, 0.12);
}

.admin-submit-btn--secondary:hover:not(:disabled) {
  filter: none;
  background: #fff;
  border-color: #64748b;
  color: #0f172a;
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.06),
    0 8px 22px rgba(100, 116, 139, 0.16);
}

.admin-submit-btn--secondary:active:not(:disabled) {
  filter: none;
  background: #f8fafc;
}

.admin-top-header .admin-logout-btn.admin-submit-btn {
  background: rgba(255, 255, 255, 0.94);
  color: #334155;
  border: 1px solid rgba(148, 163, 184, 0.55);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  filter: none;
}

.admin-top-header .admin-logout-btn.admin-submit-btn:hover:not(:disabled) {
  background: #fff;
  border-color: #94a3b8;
  color: #0f172a;
  filter: none;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.admin-top-header .admin-logout-btn.admin-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.admin-dashboard-page .btn-orange,
.admin-login-page .btn-orange {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-height: 42px;
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--admin-form-primary-from) 0%, var(--admin-form-primary-to) 100%);
  color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 4px 14px var(--admin-form-primary-shadow);
  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
}

.admin-dashboard-page .btn-orange:hover,
.admin-login-page .btn-orange:hover {
  background: linear-gradient(135deg, #c2410c 0%, #f97316 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(234, 88, 12, 0.32);
}

.admin-dashboard-page .admin-submit-btn.btn-orange,
.admin-login-page .admin-submit-btn.btn-orange {
  width: 100%;
}

.admin-stack-form .btn-orange,
.admin-auth-form .btn-orange {
  width: 100%;
  justify-content: center;
}

.admin-login-page .section-tag {
  color: var(--admin-accent);
  letter-spacing: 0.18em;
}

.admin-dashboard-page .section-tag {
  color: var(--admin-accent);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-bottom: 4px;
}

.admin-form-group input::placeholder,
.admin-form-group textarea::placeholder,
.admin-inline-form input::placeholder {
  color: #94a3b8;
  opacity: 1;
}

.admin-dashboard-page {
  background: transparent;
  /* Fills the scroll outlet under the header — do not use 100vh + hidden here (clips Clients, etc.). */
  display: block;
  min-height: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: visible;
}

.admin-shell {
  width: 100%;
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  gap: 0;
  height: 100vh;
  align-items: stretch;
}

.admin-sidebar {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar-panel {
  background: linear-gradient(180deg, #0f172a 0%, #162033 100%);
  color: #fff;
  height: 100%;
  padding: 22px 16px 24px;
  box-shadow: 18px 0 40px rgba(15, 23, 42, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.admin-sidebar-brand {
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
  margin-bottom: 0;
  padding: 8px 8px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  width: 100%;
  max-width: 240px;
  text-align: center;
}

.admin-sidebar-brand .brand-logo {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-sidebar-brand .brand-name {
  min-width: 0;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 1.2;
  letter-spacing: 0.7px;
  text-align: left;
}

.admin-sidebar-brand .brand-name span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 7px;
  letter-spacing: 1.4px;
}

.admin-sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 16px 0;
  width: 100%;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-sidebar-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  text-decoration: none;
  color: #fff;
  text-align: left;
  width: min(100%, 260px);
  padding: 12px 14px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease;
}

.admin-sidebar-button {
  width: min(100%, 260px);
  appearance: none;
  cursor: pointer;
  font: inherit;
}

a.admin-sidebar-button {
  box-sizing: border-box;
}

.admin-sidebar-link:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
}

.admin-sidebar-link.is-active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.admin-sidebar-link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  color: rgba(255, 255, 255, 0.5);
}

.admin-sidebar-link.is-active .admin-sidebar-link-icon {
  color: #ff9f40;
}

.admin-sidebar-link-copy {
  min-width: 0;
  text-align: left;
}

.admin-sidebar-link-copy strong {
  display: block;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 1.25;
  font-weight: 500;
}

.admin-sidebar-link-copy small {
  display: none;
}

.admin-sidebar-link.is-active .admin-sidebar-link-copy strong {
  color: #fff;
}

.admin-main {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 28px 0 28px;
  padding-top: 0;
  margin-top: 0;
  height: 100vh;
  min-height: 0;
  max-height: 100vh;
  overflow: hidden;
  min-width: 0;
  background: var(--admin-bg);
}

/* Single scroll region: keeps top bar visible while lists (Clients, etc.) scroll. */
.admin-active-section.admin-layout-outlet,
.admin-active-section,
.admin-layout-outlet {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* Keep the first rounded panel clear of the sticky header. */
  padding: 14px 20px 32px 20px;
}

.admin-layout-outlet > .admin-dashboard-page {
  padding-top: 0;
  margin-top: 0;
}

.admin-layout-outlet > .admin-dashboard-page.admin-nested-route {
  padding-top: 4px;
}

.admin-top-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  row-gap: 10px;
  align-items: center;
  flex-shrink: 0;
  margin-left: -28px;
  margin-top: 0;
  margin-bottom: 0;
  padding: 10px 22px 10px 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--admin-border);
  border-left: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 5;
}

.admin-top-header-left,
.admin-top-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-top-header-left {
  gap: 10px;
  min-width: 0;
}

.admin-header-back {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 11px 7px 9px;
  margin-right: 2px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admin-header-back:hover {
  border-color: rgba(249, 115, 22, 0.45);
  color: var(--admin-accent);
  background: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.12);
}

.admin-header-back:focus-visible {
  outline: 2px solid var(--admin-form-focus-ring);
  outline-offset: 2px;
}

.admin-header-back svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.admin-top-header-left > div:not(.admin-section-icon) {
  min-width: 0;
}

.admin-top-header-left h1,
.admin-top-header-left p {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.admin-top-header-right {
  justify-content: flex-end;
  min-width: 0;
}

.admin-top-header-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  max-width: 100%;
}

.admin-top-header-left h1 {
  color: var(--admin-ink);
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.admin-top-header-left p {
  margin-top: 2px;
  color: var(--admin-copy);
  font-size: 11px;
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.admin-section-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #64748b;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.admin-section-icon svg {
  width: 15px;
  height: 15px;
}

.admin-search-shell {
  position: relative;
  flex: 0 1 240px;
  min-width: 0;
}

.admin-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 280px;
  padding: 0 12px;
  height: 36px;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
}

.admin-search-icon {
  width: 12px;
  height: 12px;
  border: 2px solid #9ca3af;
  border-radius: 999px;
  position: relative;
}

.admin-search-icon::after {
  content: '';
  position: absolute;
  width: 7px;
  height: 2px;
  background: #9ca3af;
  border-radius: 999px;
  right: -5px;
  bottom: -3px;
  transform: rotate(45deg);
}

.admin-search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--admin-copy);
  font-size: 13px;
}

.admin-search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.admin-search-result {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-search-result:hover {
  background: rgba(241, 245, 249, 0.92);
}

.admin-search-result strong {
  color: var(--admin-ink);
  font-size: 13px;
  font-weight: 700;
}

.admin-search-result span,
.admin-search-empty {
  color: var(--admin-muted);
  font-size: 12px;
  line-height: 1.5;
}

.admin-search-empty {
  padding: 10px 12px;
}

.admin-dashboard-hero,
.admin-section {
  background-color: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 28px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 20px rgba(148, 163, 184, 0.07);
  padding: 4px 0 20px;
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* Swapped dashboard panels — kill extra top offset so content aligns under the header */
.admin-dashboard-section-root {
  margin: 0;
  padding: 0;
  padding-top: 0;
  min-height: 0;
}

.admin-dashboard-panel {
  animation: adminSectionFade 180ms ease;
}

.admin-dashboard-panel[hidden] {
  display: none;
}

.admin-dashboard-panel > .admin-section,
.admin-dashboard-panel > .admin-dashboard-hero {
  margin-top: 0;
  padding: 0 24px 24px;
}

/* Space under sticky chrome + between section title, metrics, and lists */
.admin-dashboard-panel > .admin-section > .admin-section-header:first-child {
  margin-top: 0;
  padding-top: 0;
  margin-bottom: 16px;
  padding-top: 22px;
  padding-bottom: 14px;
}

.admin-dashboard-section-root .admin-section .admin-card-list {
  margin-top: 18px;
}

.admin-dashboard-section-root .admin-section > .admin-kpi-grid + .admin-card-list {
  margin-top: 20px;
}

.admin-dashboard-panel > .admin-dashboard-hero > .admin-section-toolbar:first-child {
  margin-top: 4px;
  padding-top: 22px;
  margin-bottom: 4px;
}

@keyframes adminSectionFade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-summary-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 18px;
  align-items: start;
}

.admin-summary-copy h2 {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(26px, 2.4vw, 32px);
  line-height: 1.12;
  color: var(--admin-ink);
  margin-top: 8px;
  max-width: 36ch;
}

.admin-summary-copy p,
.admin-section-header p {
  max-width: 48ch;
  margin-top: 6px;
  color: var(--admin-copy);
  font-size: 12px;
  line-height: 1.55;
}

.admin-topbar-card {
  background: linear-gradient(135deg, rgba(16, 35, 63, 0.95) 0%, rgba(26, 43, 70, 0.92) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.admin-section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.admin-dashboard-hero > .admin-section-toolbar:first-child {
  margin-top: 0;
}

.admin-section-toolbar h3 {
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.admin-filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(148, 163, 184, 0.1);
}

.admin-filter-pill.light {
  background: rgba(255, 255, 255, 0.72);
  box-shadow: none;
}

button.admin-filter-pill {
  cursor: pointer;
  font: inherit;
  text-align: center;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

button.admin-filter-pill:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--admin-ink);
}

button.admin-filter-pill.light.is-active {
  background: rgba(255, 247, 237, 0.98);
  border-color: rgba(249, 115, 22, 0.45);
  color: #9a3412;
}

.admin-topbar-card span,
.admin-topbar-card small {
  display: block;
}

.admin-topbar-card span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  font-weight: 700;
}

.admin-topbar-card strong {
  display: block;
  margin-top: 6px;
  margin-bottom: 4px;
  color: #fff;
  font-size: 18px;
  font-family: 'Oswald', sans-serif;
  line-height: 1.15;
}

.admin-topbar-card small {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.admin-top-header .nav-cta {
  min-height: 34px !important;
  padding: 7px 14px !important;
  font-size: 11px !important;
  letter-spacing: 0.08em !important;
  border-radius: 8px !important;
}

.admin-top-header .admin-logout-btn {
  width: auto;
}

.admin-top-header-right form {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 0;
  flex: 0 0 auto;
}

.admin-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.admin-kpi-grid.compact {
  gap: 12px;
  margin-top: 14px;
}

.admin-kpi-grid.secondary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 4px;
}

.admin-kpi-card {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 14px;
  padding: 16px 16px 14px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
}

.admin-kpi-grid.compact .admin-kpi-card {
  padding: 14px 12px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.admin-kpi-grid.secondary .admin-kpi-card {
  padding: 14px 16px;
}

.admin-kpi-card.accent {
  background: linear-gradient(180deg, #fffbeb 0%, #fff 48%);
  border-color: rgba(251, 191, 36, 0.35);
}

.admin-kpi-card span {
  display: block;
  color: var(--admin-copy);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.admin-kpi-card strong {
  display: block;
  margin: 8px 0 4px;
  color: #1f2937;
  font-family: 'Oswald', sans-serif;
  font-size: 28px;
  line-height: 1.1;
  word-break: break-word;
}

.admin-kpi-grid.compact .admin-kpi-card strong {
  font-size: 24px;
  margin: 6px 0 2px;
}

.admin-kpi-grid.secondary .admin-kpi-card strong {
  font-size: 22px;
  margin: 6px 0 2px;
}

.admin-kpi-card small {
  display: block;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.admin-kpi-card.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.admin-kpi-card-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 6px;
}

.admin-kpi-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--admin-ink);
  letter-spacing: 0.01em;
}

.admin-kpi-caption {
  display: block;
  margin-top: 2px;
  max-width: 16ch;
  font-size: 11px;
  line-height: 1.4;
  color: var(--admin-copy);
  font-weight: 500;
}

.admin-kpi-grid.secondary .admin-kpi-caption {
  margin-top: 4px;
  max-width: 20ch;
}

.admin-kpi-delta-hint {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.02em;
}

.admin-kpi-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
}

.admin-kpi-icon svg {
  display: block;
}

.admin-kpi-grid.compact .admin-kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 12px;
  margin: 0 auto;
}

.admin-kpi-icon.clients {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.admin-kpi-icon.leads {
  background: rgba(249, 115, 22, 0.14);
  color: #c2410c;
}

.admin-kpi-icon.orders {
  background: rgba(250, 204, 21, 0.18);
  color: #ca8a04;
}

.admin-kpi-icon.revenue {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}

.admin-kpi-icon.conversion {
  background: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}

.admin-kpi-icon.installations {
  background: rgba(14, 165, 233, 0.12);
  color: #0369a1;
}

.admin-kpi-icon.trend {
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
}

.admin-kpi-icon.collections-overview {
  background: rgba(5, 150, 105, 0.1);
  color: #047857;
}

.admin-kpi-card.centered > strong {
  margin-top: 4px;
}

.admin-kpi-card em {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.25;
}

.admin-kpi-grid.compact .admin-kpi-card em {
  margin-top: 6px;
}

.admin-kpi-card em.is-up {
  color: #22c55e;
}

.admin-kpi-card em.is-down {
  color: #ef4444;
}

.admin-overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
  padding-bottom: 8px;
}

.admin-dashboard-hero .admin-visual-card {
  min-width: 0;
  padding: 16px 18px;
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(148, 163, 184, 0.11);
}

.admin-overview-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  min-width: 0;
}

.admin-overview-card-title-block {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
}

.admin-overview-card-titles {
  min-width: 0;
}

.admin-overview-card-heading {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--admin-ink);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.admin-overview-card-lede {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--admin-copy);
}

.admin-overview-empty {
  margin: 0;
  padding: 8px 0 4px;
  color: var(--admin-copy);
  font-size: 13px;
  line-height: 1.5;
}

.admin-dashboard-hero .admin-overview-card-head .admin-kpi-icon {
  margin: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
}

.admin-dashboard-hero .admin-overview-card-head .admin-card-badge {
  flex-shrink: 0;
  margin-top: 0;
  min-height: 28px;
  padding: 0 8px;
  font-size: 9px;
}

.admin-dashboard-hero .admin-overview-card-head .admin-kpi-icon svg {
  width: 16px;
  height: 16px;
}

.admin-dashboard-hero .admin-card-heading {
  margin-bottom: 12px;
  gap: 10px;
}

.admin-dashboard-hero .admin-card-badge {
  min-height: 28px;
  padding: 0 9px;
  font-size: 9px;
}

.admin-dashboard-hero .admin-visual-card .admin-feature-eyebrow {
  margin-bottom: 6px;
  font-size: 10px;
  letter-spacing: 1.6px;
}

.admin-dashboard-hero .admin-visual-card h3 {
  font-size: 17px;
  line-height: 1.2;
}

.admin-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0;
  margin-bottom: 10px;
  padding-top: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.85);
}

/* Eyebrow → title → rule: a little air */
.admin-section-header .section-tag {
  display: block;
  margin-bottom: 6px;
}

.admin-section-header h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 22px;
  line-height: 1.08;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--admin-ink);
  margin: 0;
}

.admin-plus-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--admin-form-primary-from) 0%, var(--admin-form-primary-to) 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.22);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.admin-plus-action span {
  font-size: 28px;
  line-height: 1;
  font-weight: 400;
}

.admin-plus-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(234, 88, 12, 0.28);
}

.admin-plus-action.is-open span {
  transform: rotate(45deg);
}

.admin-content-grid,
.admin-management-grid {
  display: grid;
  gap: 20px;
}

.admin-content-grid.two-up {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-content-grid.two-up > .admin-report-span-full {
  grid-column: 1 / -1;
}

.admin-management-grid {
  grid-template-columns: minmax(320px, .82fr) minmax(0, 1.18fr);
}

.admin-management-grid-stack {
  grid-template-columns: 1fr;
}

.admin-section-gap {
  margin-top: 20px;
}

.admin-order-payment-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-surface-card,
.admin-list-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
}

.admin-form-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 20px;
  padding: 28px 28px 26px;
  box-shadow:
    0 14px 44px rgba(100, 116, 139, 0.09),
    0 2px 8px rgba(15, 23, 42, 0.04);
}

.admin-list-card h3,
.admin-form-card h3,
.admin-surface-card h3 {
  font-family: 'Oswald', sans-serif;
  font-size: 26px;
  line-height: 1.12;
  color: var(--admin-ink);
  margin-bottom: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.admin-visual-card h3 {
  margin-bottom: 0;
}

.admin-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.admin-card-badge {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(239, 246, 255, 1);
  color: #334155;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-section-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;
}

.admin-section-tabs button {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0 0 10px;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.admin-section-tabs button:hover {
  color: #334155;
}

.admin-section-tabs button.is-active {
  color: #0f172a;
  border-bottom-color: var(--admin-accent);
}

.admin-list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.admin-list-heading span {
  color: var(--admin-copy);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.admin-feature-eyebrow {
  display: inline-block;
  color: var(--admin-accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 14px;
}

.admin-form-split,
.admin-form-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.admin-card-list {
  display: grid;
  gap: 20px;
}

.admin-item-card {
  border: 1px solid var(--admin-border);
  border-radius: 18px;
  padding: 20px 22px 18px;
  background: rgba(250, 251, 255, 0.96);
}

.admin-item-card.wide {
  background: #fff;
}

.admin-item-card p {
  color: var(--admin-copy);
  font-size: 13px;
  line-height: 1.65;
  margin-top: 10px;
}

.admin-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.admin-item-head strong {
  display: block;
  color: var(--admin-ink);
  font-size: 14px;
  margin-bottom: 3px;
}

.admin-item-head span {
  color: #8391a7;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.admin-item-head em {
  color: var(--admin-accent);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.admin-inline-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
  align-items: stretch;
}

.admin-inline-form > .admin-pending-note {
  grid-column: 1 / -1;
  margin-top: 2px;
}

.admin-inline-form--order-status {
  grid-template-columns: minmax(140px, 1fr) minmax(120px, 1.2fr) auto;
  margin-top: 10px;
}

.admin-inline-form--order-payment {
  grid-template-columns: minmax(0, 1fr) auto;
  margin-top: 10px;
}

.admin-inline-form input,
.admin-inline-form select {
  min-height: 40px;
  font-size: 13px;
  padding: 9px 11px;
}

.admin-inline-form select {
  padding-right: 36px;
  background-position: right 9px center;
  background-size: 15px;
}

.admin-inline-form button,
.admin-danger-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
}

.admin-inline-form button {
  background: linear-gradient(135deg, var(--admin-form-primary-from) 0%, var(--admin-form-primary-to) 100%);
  color: #fff;
  box-shadow: 0 3px 12px var(--admin-form-primary-shadow);
  min-height: 40px;
}

.admin-inline-form button:disabled,
.admin-danger-btn:disabled,
.admin-submit-btn:disabled,
.admin-logout-btn:disabled,
.btn-orange:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

.admin-inline-form button:hover,
.admin-danger-btn:hover {
  transform: translateY(-1px);
}

.admin-inline-form button:hover {
  box-shadow: 0 5px 16px rgba(234, 88, 12, 0.28);
}

.admin-danger-btn {
  margin-top: 10px;
  background: #fff1f0;
  color: #ba1a1a;
}

.admin-submit-btn--icon {
  min-width: 40px;
  width: 40px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-danger-btn.admin-submit-btn--icon {
  margin-top: 0;
}

.admin-submit-btn--icon-labeled {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  min-width: auto !important;
  width: auto !important;
  padding-left: 14px !important;
  padding-right: 18px !important;
  gap: 0;
}

.admin-submit-btn__with-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.admin-top-header .nav-cta.admin-submit-btn--icon-labeled {
  min-height: 34px !important;
  padding: 7px 14px 7px 11px !important;
  width: auto !important;
  white-space: nowrap;
}

.admin-btn-icon-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-btn-icon-inner svg {
  display: block;
}

.admin-btn-spinner {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: admin-btn-spin 0.72s linear infinite;
}

.admin-submit-btn--secondary .admin-btn-spinner {
  border-color: rgba(15, 23, 42, 0.12);
  border-top-color: var(--admin-accent);
}

.admin-danger-btn .admin-btn-spinner {
  border-color: rgba(186, 26, 26, 0.22);
  border-top-color: #ba1a1a;
}

@keyframes admin-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.admin-product-row-actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.admin-product-row-actions .admin-inline-form {
  margin-top: 0;
  flex: 1 1 auto;
  min-width: min(100%, 280px);
}

.admin-product-row-actions form.admin-inline-delete-form {
  /* Visually hidden; submit via requestSubmit from confirm dialog */
  display: block;
}

.admin-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--admin-form-label);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 0 2px;
}

.admin-checkbox input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  width: 17px;
  height: 17px;
  min-height: 17px;
  border-radius: 5px;
  border: 1px solid var(--admin-form-border);
  background: #fff;
  display: inline-grid;
  place-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.admin-checkbox input[type='checkbox']::before {
  content: '';
  width: 5px;
  height: 9px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg) scale(0);
  transform-origin: center;
  transition: transform 0.15s ease-in-out;
}

.admin-checkbox input[type='checkbox']:checked {
  background: var(--admin-accent);
  border-color: var(--admin-accent);
}

.admin-checkbox input[type='checkbox']:checked::before {
  transform: rotate(45deg) scale(1);
}

.admin-checkbox.compact {
  align-self: center;
}

.admin-inline-note {
  margin-top: 14px;
  color: var(--admin-copy);
  font-size: 13px;
}

.admin-pending-note {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(249, 115, 22, 0.2);
  background: rgba(255, 247, 237, 0.95);
  color: #9a3412;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.admin-topbar-note {
  margin-top: 8px;
}

.admin-flash {
  margin-top: 18px;
  margin-bottom: 4px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.admin-flash-success {
  background: rgba(217, 31, 109, 0.08);
  color: #b91c5c;
}

.admin-flash-error {
  background: rgba(186, 26, 26, 0.1);
  color: #ba1a1a;
}

.admin-stat-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.admin-stat-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.admin-stat-list strong {
  font-family: 'Oswald', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--admin-accent);
}

.admin-stat-list span {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  text-align: right;
}

.admin-activity-list,
.admin-report-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.admin-activity-item,
.admin-report-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.admin-activity-item strong,
.admin-report-row strong {
  display: block;
  color: var(--admin-ink);
  font-size: 13px;
  margin-bottom: 4px;
  letter-spacing: .8px;
}

.admin-activity-item span,
.admin-activity-item time,
.admin-report-row span {
  color: var(--admin-copy);
  font-size: 13px;
  line-height: 1.6;
}

.admin-report-row em {
  color: var(--admin-accent);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.admin-bar-list {
  display: grid;
  gap: 14px;
}

.admin-bar-row {
  display: grid;
  grid-template-columns: minmax(96px, 120px) minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.admin-bar-copy strong,
.admin-bar-copy span {
  display: block;
}

.admin-bar-copy strong {
  color: var(--admin-ink);
  font-size: 13px;
}

.admin-bar-copy span {
  color: var(--admin-copy);
  font-size: 12px;
  margin-top: 4px;
}

.admin-bar-track,
.admin-progress-stack {
  position: relative;
  overflow: hidden;
  min-height: 12px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
}

.admin-bar-fill,
.admin-progress-fill {
  height: 100%;
  border-radius: inherit;
}

.admin-bar-fill {
  min-width: 10px;
}

.admin-bar-row em {
  color: #475569;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.admin-mini-bars {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 14px 18px;
  min-height: 0;
  padding: 8px 4px 4px;
}

.admin-mini-bars > p {
  flex: 1 1 100%;
  margin: 0;
  padding: 12px 0;
  color: var(--admin-copy);
  font-size: 13px;
  text-align: center;
}

.admin-mini-bar-item {
  display: grid;
  gap: 8px;
  justify-items: center;
  flex: 0 0 80px;
  width: 80px;
  max-width: 100%;
  min-width: 0;
}

.admin-mini-bar-track {
  position: relative;
  width: 100%;
  min-height: 120px;
  max-height: 160px;
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, rgba(249, 115, 22, 0.08) 100%),
    rgba(248, 250, 252, 0.98);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.admin-mini-bar-fill {
  width: 100%;
  border-radius: 10px 10px 0 0;
  min-height: 8%;
  /* background set inline from order stage (see orderTrendBarBackground) */
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
}

.admin-mini-bar-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 14px;
  margin: 14px 0 0;
  padding: 10px 12px;
  list-style: none;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.95);
}

.admin-mini-bar-legend li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--admin-copy);
}

.admin-mini-bar-legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.admin-mini-bar-item strong {
  color: var(--admin-ink);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-mini-bar-item span {
  color: var(--admin-copy);
  font-size: 11px;
  text-align: center;
  line-height: 1.4;
}

.admin-progress-panel {
  display: grid;
  gap: 14px;
}

.admin-arc-gauge {
  --gauge-angle: calc(180deg * var(--gauge-progress) / 100);
  position: relative;
  width: min(100%, 240px);
  aspect-ratio: 2 / 1.15;
  margin: 0 auto;
  border-radius: 320px 320px 0 0;
  overflow: hidden;
  background:
    conic-gradient(from 180deg at 50% 100%, #ff4b3e 0deg, #ff4b3e var(--gauge-angle), #e2e8f0 var(--gauge-angle), #e2e8f0 180deg);
}

.admin-arc-gauge::before {
  content: '';
  position: absolute;
  inset: 14px 14px 0;
  border-radius: 320px 320px 0 0;
  background: #fff;
}

.admin-arc-gauge-center {
  position: absolute;
  inset: auto 50% 6px;
  transform: translateX(-50%);
  width: 72%;
  text-align: center;
  z-index: 1;
}

.admin-arc-gauge-center strong {
  display: block;
  color: #1f2937;
  font-family: 'Oswald', sans-serif;
  font-size: 34px;
  line-height: 1;
}

.admin-arc-gauge-center span {
  display: block;
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.admin-progress-stack {
  min-height: 16px;
}

.admin-progress-fill {
  background: linear-gradient(90deg, #0f172a 0%, #f97316 100%);
}

.admin-metric-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.admin-metric-split div {
  padding: 18px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.admin-metric-split span,
.admin-metric-split strong {
  display: block;
}

.admin-metric-split span {
  color: var(--admin-copy);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.admin-metric-split strong {
  margin-top: 10px;
  color: var(--admin-ink);
  font-size: 28px;
  font-family: 'Oswald', sans-serif;
}

.admin-dashboard-hero .admin-metric-split {
  gap: 10px;
}

.admin-dashboard-hero .admin-metric-split div {
  padding: 12px 14px;
  border-radius: 12px;
}

.admin-dashboard-hero .admin-metric-split strong {
  margin-top: 6px;
  font-size: 18px;
}

.admin-order-card {
  padding: 20px 20px 18px;
}

.admin-item-head .admin-order-status-pill {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.28);
  color: #c2410c;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: none;
}

.admin-order-section-label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--admin-form-label);
}

.admin-order-form-hint {
  margin: 0 0 4px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--admin-copy);
}

.admin-order-form-hint strong {
  color: var(--admin-ink);
  font-weight: 600;
}

.admin-order-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--admin-form-border);
}

.admin-order-form-block {
  margin: 0;
}

.admin-order-form-block .admin-order-section-label {
  margin-bottom: 6px;
}

.admin-order-all-paid {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(5, 150, 105, 0.06);
  border: 1px solid rgba(5, 150, 105, 0.18);
  color: #047857;
  font-weight: 600;
}

.admin-order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  margin-bottom: 0;
}

.admin-order-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--admin-form-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admin-order-chip.is-paid {
  background: rgba(5, 150, 105, 0.08);
  border-color: rgba(5, 150, 105, 0.25);
}

.admin-order-chip.is-pending {
  background: #fff7ed;
  border-color: #fed7aa;
  box-shadow: 0 1px 2px rgba(234, 88, 12, 0.08);
}

.admin-order-chip span {
  color: var(--admin-copy);
  font-size: 12px;
}

.admin-order-chip strong {
  color: var(--admin-ink);
  font-size: 12px;
  font-weight: 700;
}

.admin-order-chip.is-paid strong {
  color: #047857;
}

.admin-logout-btn {
  width: 100%;
  min-height: 44px;
  border: none;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: static;
    min-height: auto;
    height: auto;
    overflow: visible;
  }

  .admin-sidebar-panel {
    min-height: auto;
    height: auto;
  }

  .admin-dashboard-topbar,
  .admin-top-header,
  .admin-summary-row,
  .admin-overview-grid,
  .admin-content-grid.two-up,
  .admin-management-grid {
    grid-template-columns: 1fr;
  }

  .admin-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-kpi-grid.secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-dashboard-page,
  .admin-shell,
  .admin-main {
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .admin-active-section.admin-layout-outlet,
  .admin-active-section,
  .admin-layout-outlet {
    flex: none;
    overflow: visible;
    min-height: 0;
    padding: 0 12px 28px 12px;
  }
}

@media (max-width: 780px) {
  .admin-shell {
    gap: 0;
  }

  .admin-login-card {
    padding: 20px;
  }

  .admin-dashboard-hero,
  .admin-section {
    padding: 16px 0 18px;
  }

  .admin-dashboard-panel > .admin-dashboard-hero,
  .admin-dashboard-panel > .admin-section {
    padding-top: 2px;
    padding-left: 0;
    padding-right: 0;
  }

  .admin-sidebar-panel {
    padding: 16px 20px 20px;
  }

  .admin-main {
    padding: 0 20px 20px;
  }

  .admin-top-header {
    margin-left: 0;
    border-left: 1px solid var(--admin-border);
    border-radius: 12px;
    min-height: auto;
    padding: 12px 18px;
  }

  .admin-top-header-left,
  .admin-top-header-right {
    flex-wrap: wrap;
  }

  .admin-top-header-actions {
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-end;
    row-gap: 8px;
  }

  .admin-section-toolbar,
  .admin-section-tabs {
    flex-wrap: wrap;
  }

  .admin-search-box {
    min-width: 100%;
  }

  .admin-summary-copy h2,
  .admin-login-card h1 {
    font-size: 34px;
  }

  .admin-kpi-grid,
  .admin-kpi-grid.secondary,
  .admin-form-split,
  .admin-form-columns,
  .admin-inline-form {
    grid-template-columns: 1fr;
  }

  .admin-inline-form--order-status,
  .admin-inline-form--order-payment {
    grid-template-columns: 1fr;
  }

  .admin-section-header,
  .admin-item-head,
  .admin-card-heading,
  .admin-report-row,
  .admin-activity-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-bar-row,
  .admin-metric-split {
    grid-template-columns: 1fr;
  }

  .admin-mini-bar-item {
    flex-basis: 72px;
    width: 72px;
  }

}

.admin-item-head-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.admin-detail-link {
  color: var(--admin-accent);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.admin-detail-link:hover {
  text-decoration: underline;
}

.admin-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.admin-catalog-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.admin-catalog-toolbar-hint {
  font-size: 12px;
  color: var(--admin-muted, #8391a7);
  margin: 0 0 12px;
}

.admin-catalog-search input {
  min-width: min(100%, 280px);
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface-alt, #f8fafc);
  font-size: 14px;
}

.admin-catalog-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.admin-catalog-chip {
  border: 1px solid var(--admin-border);
  background: var(--admin-surface, #fff);
  color: var(--admin-ink);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.admin-catalog-chip.is-active {
  border-color: var(--admin-accent);
  background: rgba(47, 127, 51, 0.08);
  color: var(--admin-accent);
}

.admin-lead-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.admin-lead-filter-tab {
  border: 1px solid rgba(15, 35, 58, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 253, 253, 0.98) 100%);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #0d233a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admin-lead-filter-tab.is-active {
  border-color: rgba(255, 140, 0, 0.26);
  background: rgba(255, 140, 0, 0.12);
  color: #e07a00;
  box-shadow: 0 8px 18px rgba(255, 140, 0, 0.12);
}

.admin-lead-card {
  border-color: rgba(255, 140, 0, 0.12);
  background:
    radial-gradient(circle at top right, rgba(255, 140, 0, 0.1), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #fffaf4 100%);
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.06),
    0 2px 8px rgba(255, 140, 0, 0.06);
}

.admin-lead-card .admin-item-head strong {
  color: #0d233a;
}

.admin-lead-card .admin-item-head em {
  color: #e07a00;
}

.admin-lead-card .admin-detail-link {
  color: #e07a00;
}

.admin-lead-card .admin-inline-form input,
.admin-lead-card .admin-inline-form select {
  border-color: rgba(255, 140, 0, 0.12);
  background: rgba(255, 255, 255, 0.96);
}

.admin-lead-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.admin-lead-status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.9;
}

.admin-lead-status--new {
  background: rgba(255, 140, 0, 0.12);
  border-color: rgba(255, 140, 0, 0.18);
  color: #e07a00;
}

.admin-lead-status--contacted {
  background: rgba(13, 35, 58, 0.08);
  border-color: rgba(13, 35, 58, 0.12);
  color: #0d233a;
}

.admin-lead-status--survey_scheduled,
.admin-lead-status--survey_completed {
  background: rgba(46, 204, 113, 0.12);
  border-color: rgba(46, 204, 113, 0.18);
  color: #1f9d57;
}

.admin-lead-status--quotation_sent {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.16);
  color: #2563eb;
}

.admin-lead-status--won {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.18);
  color: #15803d;
}

.admin-lead-status--lost {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.16);
  color: #dc2626;
}

.admin-subpage-main {
  padding: 0;
}

.admin-subpage {
  max-width: 920px;
  margin: 0 auto;
  padding: 24px 28px 48px;
}

.admin-subpage-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--admin-border);
}

.admin-subpage-back {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: var(--admin-accent);
  text-decoration: none;
  margin-bottom: 10px;
}

.admin-subpage-back:hover {
  text-decoration: underline;
}

.admin-subpage-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--admin-ink);
}

.admin-subpage-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-subpage-primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  color: #fff;
}

.admin-lead-detail-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface, #fff);
}

.admin-lead-detail-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
}

.admin-lead-detail-title .admin-hero-primary-link {
  color: inherit;
  text-decoration: none;
}

.admin-lead-detail-title .admin-hero-primary-link:hover {
  color: var(--admin-accent);
}

.admin-lead-detail-id {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #475569;
  padding: 4px 9px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.14);
}

.admin-quotation-detail-head {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.admin-lead-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
}

.admin-status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(47, 127, 51, 0.12);
  color: var(--admin-accent);
}

.admin-lead-detail-client {
  margin: 0 0 6px;
  font-size: 14px;
}

.admin-lead-detail-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.admin-lead-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 820px) {
  .admin-lead-detail-grid {
    grid-template-columns: 1fr;
  }
}

.admin-span-2 {
  grid-column: 1 / -1;
}

/* Detail routes (lead / order / quotation): breathing room, scroll past last card, clearer hierarchy */
.admin-detail-page {
  gap: 24px;
  padding-bottom: 64px;
}

.admin-detail-page .admin-lead-detail-hero,
.admin-detail-page .admin-order-detail-hero {
  padding: 22px 26px;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06), 0 8px 24px rgba(148, 163, 184, 0.12);
}

.admin-detail-page .admin-lead-detail-grid {
  gap: 20px;
}

.admin-detail-page .admin-form-card {
  padding: 28px 32px 32px;
  border-color: #e2e8f0;
  box-shadow:
    0 14px 44px rgba(100, 116, 139, 0.1),
    0 2px 10px rgba(15, 23, 42, 0.05);
}

.admin-detail-page .admin-form-card h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--admin-border);
  color: var(--admin-ink);
}

.admin-detail-page .admin-stack-form {
  gap: 22px;
}

.admin-detail-page .admin-form-group label {
  margin-bottom: 9px;
}

.admin-detail-page .admin-form-group input,
.admin-detail-page .admin-form-group select,
.admin-detail-page .admin-form-group textarea {
  border-color: #cbd5e1;
  padding: 11px 14px;
}

.admin-detail-page .admin-form-group select {
  min-height: 46px;
  font-weight: 600;
  font-size: 13px;
  color: var(--admin-ink);
  background-color: #f8fafc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

.admin-detail-page .admin-form-group select:focus {
  background-color: #fff;
  border-color: var(--admin-form-focus);
  box-shadow:
    inset 0 1px 2px rgba(15, 23, 42, 0.03),
    0 0 0 2px var(--admin-form-focus-ring),
    0 3px 12px rgba(249, 115, 22, 0.1);
}

.admin-detail-page .admin-submit-btn:not(.admin-submit-btn--icon) {
  min-height: 46px;
  border-radius: 12px;
}

.admin-detail-page .admin-submit-btn--icon-labeled {
  width: 100% !important;
  min-height: 46px;
  padding-left: 18px !important;
  padding-right: 22px !important;
  border-radius: 12px;
}

.admin-detail-page .admin-submit-btn__with-label {
  gap: 10px;
}

.admin-detail-page .admin-btn-icon-inner svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.admin-detail-page .admin-form-spaced-top {
  margin-top: 24px;
  padding-top: 22px;
}

.admin-detail-page .admin-notes-list {
  padding: 14px 16px 14px 36px;
  margin: 0 0 4px;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.admin-detail-page .admin-notes-list li:last-child {
  margin-bottom: 0;
}

.admin-detail-page .admin-form-card .admin-order-form-hint {
  margin: 0 0 8px;
  padding: 12px 14px;
  background: rgba(248, 250, 252, 0.85);
  border-radius: 12px;
  border: 1px dashed var(--admin-border);
}

.admin-form-spaced-top {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--admin-border);
}

.admin-notes-list {
  margin: 0;
  padding-left: 18px;
  color: var(--admin-copy);
  font-size: 13px;
  line-height: 1.6;
}

.admin-notes-list li {
  margin-bottom: 6px;
}

.admin-quotation-link-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-order-detail-hero {
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface, #fff);
}

.admin-quotation-actions {
  margin-top: 0;
}

/* Team: primary header + button alignment; assignments block visually separated */
.admin-team-section > .admin-section-header {
  align-items: flex-start;
  margin-bottom: 18px;
  padding-bottom: 14px;
}

.admin-team-section > .admin-section-header .admin-plus-action {
  flex-shrink: 0;
  margin-top: 4px;
}

.admin-team-section > .admin-management-grid {
  margin-bottom: 20px;
}

.admin-assignments-root {
  margin-top: 4px;
  padding-top: 22px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.admin-assignments-root > .admin-section-header {
  margin-bottom: 18px;
  padding-bottom: 12px;
}

.admin-assignments-root > .admin-section-header h2 {
  font-size: 19px;
  line-height: 1.22;
  letter-spacing: -0.015em;
}

.admin-assignments-root article.admin-workload-card.admin-form-card {
  padding-top: 26px;
  padding-bottom: 30px;
}

.admin-workload-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 21px;
  line-height: 1.15;
}

.admin-workload-card .admin-table-wrap {
  margin-top: 18px;
}

.admin-workload-card .admin-data-table th,
.admin-workload-card .admin-data-table td {
  padding: 14px 16px;
  vertical-align: top;
}

.admin-workload-card .admin-data-table thead th {
  padding-top: 4px;
  padding-bottom: 12px;
}

.admin-assignments-root .admin-segment-tabs {
  margin-top: 26px;
  margin-bottom: 20px;
}

.admin-assignments-root .admin-card-list {
  gap: 18px;
}

.admin-segment-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 16px;
}

.admin-segment-tab {
  border: 1px solid var(--admin-border);
  background: var(--admin-surface, #fff);
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.admin-segment-tab.is-active {
  border-color: var(--admin-accent);
  background: rgba(47, 127, 51, 0.08);
  color: var(--admin-accent);
}

.admin-table-wrap {
  overflow-x: auto;
  margin-top: 12px;
}

.admin-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-data-table th,
.admin-data-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--admin-border);
}

.admin-data-table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--admin-muted, #8391a7);
}

.admin-table-sub {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--admin-muted, #8391a7);
  margin-top: 2px;
}

.admin-assign-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-top: 12px;
}

.admin-assign-inline .admin-submit-btn,
.admin-assign-inline button {
  min-height: 42px;
  width: auto;
  padding-left: 16px;
  padding-right: 16px;
}

.admin-assign-row-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 0;
}

.admin-task-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  align-items: center;
  margin-top: 10px;
}

/* Checkbox + label text on one baseline (fieldset / task queues) */
.admin-task-type-grid .admin-checkbox,
.admin-task-type-grid .admin-checkbox.compact {
  display: inline-grid;
  grid-template-columns: 18px auto;
  align-items: center;
  column-gap: 10px;
  row-gap: 0;
  padding: 2px 0;
  margin: 0;
  align-self: auto;
  cursor: pointer;
}

.admin-task-type-grid .admin-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  min-height: 18px;
  margin: 0;
  justify-self: center;
  align-self: center;
}

.admin-task-type-grid .admin-checkbox span {
  display: block;
  line-height: 1.35;
  font-weight: 600;
}

.admin-checkbox-fieldset {
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 14px 16px 16px;
  min-width: 0;
}

.admin-checkbox-fieldset legend {
  font-size: 12px;
  font-weight: 700;
  padding: 0 6px;
  line-height: 1.4;
  color: var(--admin-ink);
}

.admin-chip-amount {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  color: var(--admin-muted, #8391a7);
}

.admin-nested-route {
  min-height: 0;
}

.admin-nested-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 700;
}

.admin-nested-nav a {
  color: var(--admin-accent);
  text-decoration: none;
}

.admin-nested-nav a:hover {
  text-decoration: underline;
}

.admin-nested-nav-sep {
  color: var(--admin-muted, #8391a7);
  font-weight: 600;
}

.admin-chrome-suspense-fallback .admin-sidebar {
  min-width: 260px;
  background: var(--admin-sidebar-bg, #0f172a);
}

.admin-layout-outlet.is-nav-pending {
  opacity: 0.55;
  pointer-events: none;
  transition: opacity 0.12s ease;
}

.admin-route-loading {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 200px;
  padding-top: 32px;
}

.admin-route-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 36px;
  border-radius: 14px;
  border: 1px solid var(--admin-border);
  background: var(--admin-surface, #fff);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
}

.admin-route-loading-text {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--admin-muted, #8391a7);
}

.admin-route-loading-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--admin-border);
  border-top-color: var(--admin-accent);
  animation: admin-btn-spin 0.7s linear infinite;
}

`;
