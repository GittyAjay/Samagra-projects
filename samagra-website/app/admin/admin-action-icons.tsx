const stroke = {
  width: 1.75 as const,
  cap: 'round' as const,
  join: 'round' as const,
};

export function IconSave(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
      <path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth={stroke.width} strokeLinecap={stroke.cap} strokeLinejoin={stroke.join} />
      <path d="M7 3v5h8" stroke="currentColor" strokeWidth={stroke.width} strokeLinecap={stroke.cap} strokeLinejoin={stroke.join} />
    </svg>
  );
}

export function IconTrash(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconUserPlus(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconRefreshCw(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconCheckCircle(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={stroke.width} />
      <path
        d="M8.5 12.5l2.5 2.5 5-6"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconSend(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconBell(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconLogIn(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconLogOut(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth={stroke.width}
        strokeLinecap={stroke.cap}
        strokeLinejoin={stroke.join}
      />
    </svg>
  );
}

export function IconPlus(props: { className?: string }) {
  return (
    <svg className={props.className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={stroke.width} strokeLinecap={stroke.cap} strokeLinejoin={stroke.join} />
    </svg>
  );
}
