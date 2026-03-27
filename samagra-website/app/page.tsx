import { readFileSync } from 'fs';
import path from 'path';

import { SiteInteractions } from './site-interactions';

function getLegacyMarkup() {
  const filePath = path.join(process.cwd(), 'legacy', 'index.html');
  const html = readFileSync(filePath, 'utf8');
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

  return bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s(src|href)=["']assets\//gi, ' $1="/assets/')
    .trim();
}

export default function HomePage() {
  const markup = getLegacyMarkup();

  return (
    <div className="site-root">
      <main dangerouslySetInnerHTML={{ __html: markup }} />
      <SiteInteractions />
    </div>
  );
}
