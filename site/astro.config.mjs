import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, ORIGIN, REPOSITORY } from './src/lib/urls.mjs';

const site = fileURLToPath(new URL('./', import.meta.url));
const file = new URL('./src/content/docs/docs/manifest.json', import.meta.url);
if (!fs.existsSync(file)) throw new Error('Run npm run prepare:docs before starting Astro.');
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
function packNavigation(pack) {
  const root = { label: pack.name, collapsed: false, items: [] };
  const groups = new Map([['', root]]);
  for (const doc of manifest.documents.filter(doc => doc.pack === pack.name)) {
    const source = doc.sourcePath.split('/').slice(2);
    const folders = source.slice(0, -1);
    let parent = root;
    for (let i = 0; i < folders.length; i++) {
      const key = folders.slice(0, i + 1).join('/');
      if (!groups.has(key)) { const group = { label: folders[i], collapsed: false, items: [] }; groups.set(key, group); parent.items.push(group); }
      parent = groups.get(key);
    }
    parent.items.push({ label: doc.title, slug: doc.route.replace(/^\//, '').replace(/\/$/, '') });
  }
  return root;
}
let outDir = path.join(site, 'dist');
if (process.env.RIGORKIT_SITE_OUT_DIR) {
  const output = path.resolve(process.env.RIGORKIT_SITE_OUT_DIR);
  const artifacts = path.join(site, '.test-artifacts') + path.sep;
  if (!output.startsWith(artifacts)) throw new Error('Test output must stay inside site/.test-artifacts/.');
  outDir = output;
}
export default defineConfig({
  site: ORIGIN,
  base: BASE.replace(/\/$/, ''),
  trailingSlash: 'always',
  output: 'static',
  outDir,
  integrations: [starlight({
    title: 'rigorkit',
    description: 'Rigorous workflows for AI-assisted development. Clear specs, human approval and evidence before claims.',
    social: [{ icon: 'github', label: 'GitHub', href: REPOSITORY }],
    locales: { root: { label: 'English', lang: 'en' } },
    expressiveCode: false,
    disable404Route: true,
    customCss: ['./src/styles/global.css'],
    components: { Search: './src/components/Search.astro', PageTitle: './src/components/PageTitle.astro' },
    sidebar: [
      { label: 'Start here', items: [{ label: 'Overview & installation', slug: 'docs/overview' }, { label: 'Pack catalog', slug: 'packs' }] },
      ...manifest.packs.map(packNavigation),
    ],
  })],
});
