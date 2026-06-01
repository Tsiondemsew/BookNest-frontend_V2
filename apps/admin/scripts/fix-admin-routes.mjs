import fs from 'fs';
import path from 'path';

const root = path.resolve('app/api/admin');
const skip = new Set([
  path.normalize(path.join(root, 'login/route.ts')),
  path.normalize(path.join(root, 'me/route.ts')),
]);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name === 'route.ts') files.push(p);
  }
  return files;
}

function transform(src) {
  if (!src.includes('Bearer ${token}')) return null;
  if (
    src.includes('fetchAdminBackend') ||
    src.includes('proxyAdminRequest') ||
    src.includes('jsonAdminBackend')
  ) {
    return null;
  }

  const methodMatches = [...src.matchAll(/export async function (GET|POST|PATCH|PUT|DELETE)\b/g)];
  if (!methodMatches.length) return null;

  const blocks = [];
  for (const match of methodMatches) {
    const method = match[1];
    const start = match.index;
    const next = src.slice(start + match[0].length);
    const open = next.indexOf('{');
    if (open === -1) continue;

    let depth = 0;
    let end = -1;
    for (let i = open; i < next.length; i++) {
      if (next[i] === '{') depth++;
      if (next[i] === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) continue;

    const signature = next.slice(0, open).trim();
    const body = next.slice(open + 1, end);

    const urlMatch =
      body.match(/backendUrl\(`([^`]+)`\)/) ||
      body.match(/backendUrl\('([^']+)'\)/) ||
      body.match(/backendUrl\("([^"]+)"\)/);

    if (!urlMatch) return null;

    blocks.push({
      method,
      signature,
      backendPath: urlMatch[1],
      hasQuery: body.includes('searchParams') && body.includes('query'),
      hasBody: body.includes('await request.text()') || body.includes('await request.json()'),
      hasParams: signature.includes('params'),
    });
  }

  if (!blocks.length) return null;

  const lines = [
    "import { jsonAdminBackend } from '@/lib/admin-api-route';",
    '',
    "export const dynamic = 'force-dynamic';",
    '',
  ];

  for (const block of blocks) {
    const args = [];
    if (block.hasQuery || block.hasBody) args.push('request: Request');
    if (block.hasParams) args.push("{ params }: { params: Promise<{ id: string }> }");

    lines.push(`export async function ${block.method}(${args.join(', ')}) {`);

    if (block.hasParams) {
      lines.push('  const { id } = await params;');
    }
    if (block.hasQuery) {
      lines.push('  const { searchParams } = new URL(request.url);');
      lines.push('  const query = searchParams.toString();');
      lines.push(`  const apiPath = \`${block.backendPath}\${query ? \`?\${query}\` : ''}\`;`);
    } else if (block.hasParams) {
      lines.push(`  const apiPath = \`${block.backendPath}\`;`);
    } else {
      lines.push(`  const apiPath = '${block.backendPath}';`);
    }

    if (block.hasBody) {
      lines.push('  const body = await request.text();');
      lines.push(`  return jsonAdminBackend(apiPath, { method: '${block.method}', body });`);
    } else if (block.method === 'GET') {
      lines.push('  return jsonAdminBackend(apiPath);');
    } else {
      lines.push(`  return jsonAdminBackend(apiPath, { method: '${block.method}' });`);
    }

    lines.push('}');
    lines.push('');
  }

  return `${lines.join('\n').trim()}\n`;
}

let updated = 0;
const skipped = [];

for (const file of walk(root)) {
  if (skip.has(path.normalize(file))) continue;
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes('Bearer ${token}')) continue;
  const out = transform(src);
  if (!out) {
    skipped.push(path.relative(root, file));
    continue;
  }
  fs.writeFileSync(file, out);
  updated++;
  console.log('updated:', path.relative(root, file));
}

console.log(`\nUpdated ${updated} files`);
if (skipped.length) console.log('Skipped (manual):', skipped.join(', '));
