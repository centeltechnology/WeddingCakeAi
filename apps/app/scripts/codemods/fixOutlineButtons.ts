import fg from 'fast-glob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd(), 'apps/app/client/src');
const files = fg.sync(['**/*.{tsx,jsx}'], { cwd: ROOT, absolute: true });

let changed = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  const before = src;

  // Ensure Button import exists if using Button already
  if (src.includes('<Button') && !src.includes("from '@/components/ui/Button'")) {
    src = src.replace(/^(\s*import .+\n)+/s, (m) => m + `import { Button } from '@/components/ui/Button';\n`);
  }

  // Fix common anti-patterns:
  // 1) outline-like class with white text → convert to safe outline variant
  src = src.replace(/<Button([^>]*?)className="[^"]*(?:text-white)[^"]*"([^>]*)>/g, (m, pre, post) => {
    // If it's inside a dark header we might want outline-light; we can't detect here, so default to 'outline'
    if (/variant="/.test(m)) return m.replace(/variant="[^"]*"/, 'variant="outline"').replace(/className="[^"]*"/, 'className=""');
    return `<Button variant="outline"${pre}${post}>`;
  });

  // 2) ghost with white text on white → enforce brand text
  src = src.replace(/<Button([^>]*?)variant="ghost"([^>]*?)className="[^"]*text-white[^"]*"([^>]*)>/g, '<Button$1variant="ghost"$2$3>');

  if (src !== before) {
    writeFileSync(f, src, 'utf8');
    changed++;
  }
}
console.log('Updated files:', changed);
