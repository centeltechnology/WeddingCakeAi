import fg from 'fast-glob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, relative } from 'path';

const ROOT = resolve(process.cwd(), 'apps/app/client/src');
const files = fg.sync(['**/*.{tsx,jsx}'], { cwd: ROOT, absolute: true, dot: false });

const buttonRegexes = [
  // Replace obvious white-on-white patterns or ad-hoc styles with Button
  {
    find: /<button([^>]*)className="([^"]*?)(btn|px-\d|py-\d|rounded|bg-white|text-white|border|hover:[^"]*?)[^"]*"([^>]*)>([\s\S]*?)<\/button>/g,
    variant: 'primary'
  },
  {
    find: /<a([^>]*)className="([^"]*?)(btn|px-\d|py-\d|rounded|bg-white|text-white|border|hover:[^"]*?)[^"]*"([^>]*)>([\s\S]*?)<\/a>/g,
    variant: 'outline'
  },
];

let changed: string[] = [];

for (const f of files) {
  let src = readFileSync(f, 'utf8');
  const before = src;

  // Normalize old button.tsx imports to Button.tsx
  src = src.replace(/from ['"]@\/components\/ui\/button['"]/g, `from '@/components/ui/Button'`);

  // ensure import
  if (!src.includes("from '@/components/ui/Button'")) {
    // Find the last import line
    const importMatch = src.match(/^(\s*import .+\n)+/m);
    if (importMatch) {
      src = src.replace(/^(\s*import .+\n)+/m, (m) => m + `import { Button } from '@/components/ui/Button';\n`);
    } else {
      // No imports yet, add at top
      src = `import { Button } from '@/components/ui/Button';\n` + src;
    }
  }

  for (const rule of buttonRegexes) {
    src = src.replace(rule.find, (match, pre1, cls, marker, post1, inner) => {
      // crude heuristics → choose variant
      const hasDanger = /text-red|bg-red|danger|destructive/i.test(cls);
      const hasSuccess = /text-green|bg-green|success/i.test(cls);
      const variant = hasDanger
        ? 'danger'
        : hasSuccess
        ? 'success'
        : /border|outline/.test(cls)
        ? 'outline'
        : /bg-white|text-white/.test(cls)
        ? 'outline'
        : rule.variant;
      const size = /text-xs|px-2|py-1/.test(cls)
        ? 'xs'
        : /px-5|py-2\.5|text-base/.test(cls)
        ? 'lg'
        : /px-4|py-2/.test(cls)
        ? 'md'
        : 'sm';

      // prefer Button as link when original was <a>
      if (match.startsWith('<a')) {
        // try to preserve href
        const hrefMatch = match.match(/href="([^"]+)"/);
        const href = hrefMatch ? hrefMatch[1] : '#';
        return `<Button href="${href}" variant="${variant}" size="${size}">${inner.trim()}</Button>`;
      }
      return `<Button variant="${variant}" size="${size}">${inner.trim()}</Button>`;
    });
  }

  if (src !== before) {
    writeFileSync(f, src, 'utf8');
    changed.push(relative(ROOT, f));
  }
}

console.log('Button codemod updated files:', changed.length);
changed.forEach((f) => console.log(' -', f));
