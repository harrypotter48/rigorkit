import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { base, current, fixtureSource, fixtureState, guide, nested, noResults, normalize, obsolete, overview, repo, resultLinks, search, waitForResult, website } from './helpers.mjs';

const browserOptions = { timeout: 30_000 };
describe('002-website: real production renderer, navigation and Pagefind', () => {
  it('RF-1.H1: the production landing identifies the product, four tools and destinations', browserOptions, async t => {
    const { page } = await website(t, { production: true });
    const body = await page.locator('main').innerText();
    assert.match(body, /rigorkit/i);
    assert.match(body, /AI|rigor|spec|verif/i);
    for (const name of ['Claude Code', 'Codex', 'Cursor', 'OpenCode']) assert.ok(body.includes(name));
    assert.ok(await page.locator(`main a[href="${base}packs/"]`).count() > 0);
    assert.ok(await page.locator(`main a[href="${base}docs/overview/#install"]`).count() > 0);
    assert.ok(await page.locator(`main a[href="${base}docs/overview/"]`).count() > 0);
    assert.ok(await page.locator('a[href="https://github.com/harrypotter48/rigorkit"]').count() > 0);
    assert.equal(await page.locator('h1#_top').count(), 1, 'Landing skip link must target the hero heading');
  });
  it('RF-2.H1: the production catalog uses all four source summaries and working targets', browserOptions, async t => {
    const { page, go } = await website(t, { production: true }); await go('/packs/');
    const body = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
    const source = readFileSync(path.join(repo, 'README.md'), 'utf8');
    const rows = [...source.matchAll(/^\| \[(core|sdd|architecture|frontend)\]\([^\n]+?\) \| (.+?) \|$/gm)];
    assert.equal(rows.length, 4);
    for (const [, pack, summary] of rows) {
      assert.ok(body.includes(summary), `Missing source summary: ${pack}`);
      assert.ok(await page.locator(`main a[href="${base}docs/packs/${pack}/"]`).count() > 0);
    }
  });
  it('RF-3.H1: real rendered installation commands and options match Markdown', browserOptions, async t => {
    const { page, go } = await website(t, { production: true }); await go(overview);
    const source = readFileSync(path.join(repo, 'README.md'), 'utf8');
    const expected = source.match(/```bash\r?\n([\s\S]*?)```/)[1];
    const codes = await page.locator('pre code').allTextContents();
    assert.ok(codes.map(normalize).includes(normalize(expected)), 'Complete installation command block differs');
    assert.match(await page.locator('main').innerText(), /--force/);
    assert.match(await page.locator('main').innerText(), /--global/);
  });
  it('RF-3.E1: quotes, angle brackets and multiline commands survive rendering', browserOptions, async t => {
    const { page, go } = await website(t); await go(overview);
    const source = readFileSync(path.join(fixtureSource, 'README.md'), 'utf8');
    const expected = source.match(/```bash\n([\s\S]*?)```/)[1];
    assert.ok((await page.locator('pre code').allTextContents()).map(normalize).includes(normalize(expected)));
  });
  it('RF-3.S1: displayed commands and code examples are never executed on page load', browserOptions, async t => {
    const { page, go } = await website(t); await go(overview);
    assert.match(await page.locator('main').innerText(), /__rigorkitProbe = 919/);
    assert.equal(await page.evaluate(() => globalThis.__rigorkitProbe), 0);
  });
  it('RF-4.H1: a source edit reaches the rebuilt page and actual search index', browserOptions, async t => {
    const state = fixtureState();
    assert.equal(state.beforeCurrentContainsOldText, true);
    const { page, go } = await website(t); await go(current);
    assert.match(await page.locator('main').innerText(), /orbitquartz/);
    assert.doesNotMatch(await page.locator('main').innerText(), /outdatedquartz/);
    await search(page, 'orbitquartz'); await waitForResult(page, current);
    assert.ok((await resultLinks(page).allTextContents()).length > 0);
  });
  it('RF-4.E1: a new nested template is reachable through documentation navigation', browserOptions, async t => {
    const { page, go } = await website(t); await go(overview);
    const link = page.locator(`nav a[href="${base.slice(0, -1)}${nested}"]`).first();
    await link.click();
    assert.ok(page.url().endsWith(base.slice(0, -1) + nested));
    assert.match(await page.locator('main').innerText(), /nestedquartz/);
  });
  it('RF-4.F1: a formerly built document disappears from page, navigation and search', browserOptions, async t => {
    const state = fixtureState(); assert.equal(state.beforeObsoletePageExisted, true);
    const { page, go } = await website(t); const response = await go(obsolete);
    assert.equal(response.status(), 404);
    assert.doesNotMatch(await page.locator('body').innerText(), /vanishedquartz/);
    await go(overview);
    assert.equal(await page.locator(`nav a[href="${base.slice(0, -1)}${obsolete}"]`).count(), 0);
    await search(page, 'vanishedquartz'); await noResults(page);
    assert.equal(await resultLinks(page).count(), 0);
  });
  it('RF-5.E1: a matching internal spec does not enter real search results', browserOptions, async t => {
    const { page } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    const hrefs = await resultLinks(page).evaluateAll(links => links.map(a => a.href));
    assert.ok(hrefs.length > 0);
    assert.ok(hrefs.every(href => !/specs|999-internal/.test(href)));
    assert.doesNotMatch(await page.locator('dialog').innerText(), /privatequartzsentinel|Internal orbitquartz/);
  });
  it('RF-6.H1: headings, lists, tables, code and relative links work through the renderer', browserOptions, async t => {
    const { page, go } = await website(t); await go(guide);
    assert.ok(await page.getByRole('heading', { name: 'Details', exact: true }).count() > 0);
    assert.match(await page.locator('main ul').first().innerText(), /readable list item/);
    assert.match(await page.locator('main table').innerText(), /readable cell/);
    assert.match((await page.locator('pre code').allTextContents()).join('\n'), /<script>/);
    await page.locator(`main a[href="${base}docs/packs/core/"]`).click();
    assert.ok(page.url().endsWith(`${base}docs/packs/core/`));
  });
  it('RF-6.E1: notices, attribution destinations and Spanish aliases remain intact', browserOptions, async t => {
    const { page, go } = await website(t); await go(guide);
    assert.match(await page.locator('main').innerText(), /Veredicto: listo para plan/);
    assert.equal(await page.locator('main a[href="https://github.com/mouredev/hello-sdd"]').count(), 1);
    await go('/docs/packs/sdd/notice/');
    assert.match(await page.locator('main').innerText(), /hello-sdd by Brais Moure/);
  });
  it('RF-6.S1: fenced HTML is displayed without executing an embedded script', browserOptions, async t => {
    const { page, go } = await website(t); await go(guide);
    assert.match((await page.locator('pre code').allTextContents()).join('\n'), /<script>globalThis\.__rigorkitProbe = 919;<\/script>/);
    assert.equal(await page.evaluate(() => globalThis.__rigorkitProbe), 0);
  });
  it('RF-7.H1: document navigation and heading fragments reach the intended target', browserOptions, async t => {
    const { page, go } = await website(t); await go(overview);
    await page.locator(`main a[href="${base.slice(0, -1)}${guide}#details"]`).click();
    assert.ok(page.url().endsWith(guide + '#details'));
    assert.equal(await page.locator('#details').count(), 1);
    assert.equal(await page.locator('h1#_top').count(), 1, 'Starlight top-of-page target must exist');
    const skip = page.getByRole('link', { name: 'Skip to content', exact: true });
    await skip.focus();
    await skip.press('Enter');
    assert.ok(page.url().endsWith('#_top'));
  });
  it('RF-7.E1: a nested document directly loads and reloads under the project prefix', browserOptions, async t => {
    const { page, go } = await website(t);
    const failed = [];
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    const first = await go(guide); assert.equal(first.status(), 200);
    const second = await page.reload({ waitUntil: 'networkidle' }); assert.equal(second.status(), 200);
    assert.match(await page.locator('main').innerText(), /Fixture guide/);
    assert.deepEqual(failed, [], `Resources failed: ${failed.join(', ')}`);
    assert.ok(await page.locator('nav a').count() > 0);
  });
  it('RF-8.H1: an unknown URL displays not-found with a working recovery link', browserOptions, async t => {
    const { page, go } = await website(t); const response = await go('/missing-document/');
    assert.equal(response.status(), 404);
    assert.match(await page.locator('body').innerText(), /not found|404/i);
    await page.locator(`a[href="${base}"], a[href="${base}docs/overview/"]`).first().click();
    assert.doesNotMatch(await page.locator('main').innerText(), /page not found/i);
  });
  it('RF-8.E1: a removed URL does not retain old content and can recover', browserOptions, async t => {
    assert.equal(fixtureState().beforeObsoletePageExisted, true);
    const { page, go } = await website(t); const response = await go(obsolete);
    assert.equal(response.status(), 404);
    assert.doesNotMatch(await page.locator('body').innerText(), /vanishedquartz/);
    await page.locator(`a[href="${base}"], a[href="${base}docs/overview/"]`).first().click();
    assert.ok(!page.url().includes('/obsolete/'));
  });
  it('RF-9.H1: title or body matches return a working document link', browserOptions, async t => {
    const { page } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    await page.locator(`dialog a[href*="${current}"]`).first().click();
    assert.match(await page.locator('main').innerText(), /orbitquartz/);
  });
  it('RF-9.E1: case and surrounding whitespace preserve the matching documents', browserOptions, async t => {
    const { page } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    const before = await resultLinks(page).evaluateAll(links => [...new Set(links.map(a => new URL(a.href).pathname))].sort());
    const field = await search(page, '  ORBITQUARTZ  '); await waitForResult(page, current);
    assert.equal(await field.inputValue(), '  ORBITQUARTZ  ');
    const after = await resultLinks(page).evaluateAll(links => [...new Set(links.map(a => new URL(a.href).pathname))].sort());
    assert.deepEqual(after, before);
  });
  it('RF-9.F1: an unmatched query shows no-results without stale hits', browserOptions, async t => {
    const { page } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    await search(page, 'nomatchingquartzanywhere'); await noResults(page);
    assert.equal(await resultLinks(page).count(), 0);
  });
  it('RF-9.S1: script-like search input is text and never executes', browserOptions, async t => {
    const { page } = await website(t);
    const query = '<img src=x onerror="globalThis.__rigorkitProbe=919">';
    const field = await search(page, query); await noResults(page);
    assert.equal(await field.inputValue(), query);
    assert.equal(await page.evaluate(() => globalThis.__rigorkitProbe), 0);
  });
  it('RF-10.H1: clearing a query clears results and leaves documentation usable', browserOptions, async t => {
    const { page, go } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    await search(page, ''); await resultLinks(page).first().waitFor({ state: 'hidden' });
    assert.equal(await resultLinks(page).count(), 0);
    await page.keyboard.press('Escape'); await go(guide);
    assert.match(await page.locator('main').innerText(), /Fixture guide/);
  });
  it('RF-10.E1: whitespace-only input behaves like an empty query', browserOptions, async t => {
    const { page } = await website(t); await search(page, 'orbitquartz'); await waitForResult(page, current);
    await search(page, '   '); await resultLinks(page).first().waitFor({ state: 'hidden' });
    assert.equal(await resultLinks(page).count(), 0);
  });
  it('RF-10.F1: failed search assets show unavailable while docs still navigate', browserOptions, async t => {
    const { page, go } = await website(t, { blockSearch: true }); await search(page, 'orbitquartz');
    await page.locator('dialog').getByText(/search.*unavailable|unable to.*search|search.*could not/i).waitFor({ state: 'visible' });
    assert.equal(await resultLinks(page).count(), 0);
    await page.keyboard.press('Escape'); await go(guide);
    assert.match(await page.locator('main').innerText(), /Fixture guide/);
  });
});
