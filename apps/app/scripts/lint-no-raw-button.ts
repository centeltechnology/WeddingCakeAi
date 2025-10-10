import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { resolve, relative } from 'path';

const ROOT = resolve(process.cwd(), 'apps/app/client/src');
const files = fg.sync(['**/*.{tsx,jsx}'], { cwd: ROOT, absolute: true });
const offenders: string[] = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const usesRaw = /<(button|a)\b[^>]*className=/.test(src) && !src.includes("from '@/components/ui/Button'");
  if (usesRaw) offenders.push(relative(ROOT, f));
}

if (offenders.length) {
  console.error(
    'Found raw <button>/<a> elements styled without using <Button>:\n' +
    offenders.map((x) => ' - ' + x).join('\n')
  );
  process.exit(1);
}

console.log('PASS: no raw buttons detected (or they import <Button>).');
