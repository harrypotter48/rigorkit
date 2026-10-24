// User-run visual evidence against the already running production preview.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../.test-artifacts/visual/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const observations = [];
try {
  for (const width of [360, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const [name, route] of [
      ['home', ''],
      ['workflow', 'docs/overview/#sdd-and-packs'],
      ['document', 'docs/packs/sdd/skills/sdd-init/templates/baseline/'],
    ]) {
      const response = await page.goto(`http://localhost:4321/rigorkit/${route}`, { waitUntil: 'networkidle' });
      if (!response?.ok()) throw new Error(`Preview failed: ${response?.status()} ${route}`);
      await page.screenshot({ path: fileURLToPath(new URL(`${width}-${name}.png`, output)), fullPage: name !== 'workflow' });
      observations.push(await page.evaluate(({ name, width }) => ({
        name, width, url: location.href, documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth, pageOverflow: document.documentElement.scrollWidth > innerWidth,
      }), { name, width }));
    }
    await page.goto('http://localhost:4321/rigorkit/', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    await page.screenshot({ path: fileURLToPath(new URL(`${width}-keyboard.png`, output)) });
    await page.getByRole('button', { name: 'Search documentation', exact: true }).click();
    await page.getByRole('searchbox').fill('baseline');
    await page.locator('dialog [role="status"]').filter({ hasText: /matching document/ }).waitFor();
    await page.screenshot({ path: fileURLToPath(new URL(`${width}-search.png`, output)) });
    await page.close();
  }
  await writeFile(new URL('observations.json', output), JSON.stringify(observations, null, 2) + '\n');
  console.log(`Visual evidence saved: ${fileURLToPath(output)}`);
} finally {
  await browser.close();
}
