# Website maintenance

The Astro/Starlight application is isolated in site/. Installing rigorkit packs does not require Node, npm or this website.

## Local setup

Use Node 24 (also recorded in .nvmrc). Run these commands from the repository root:

```bash
npm --prefix site install
npm --prefix site exec -- playwright install chromium
npm --prefix site run dev
```

Commit the npm-generated site/package-lock.json with the website. CI uses npm ci; do not handwrite the lockfile. The browser search index is generated during production builds, so use build/preview for search verification:

```bash
npm --prefix site run check
npm --prefix site run test:unit
npm --prefix site run test:browser
npm --prefix site run check:site
npm --prefix site run preview
```

Open the printed local URL under /rigorkit/. The browser suite builds real and fixture sites; its final normal build restores production documentation even after an assertion failure. No fixture output is uploaded.

## Edit the source

- Edit the main README or Markdown under packs/ for public documentation. Original frontmatter is displayed as metadata, never treated as Starlight config.
- Original landing/catalog UI lives under site/src/; catalog summaries come from the existing README pack table. Add the pack's README and table row when adding a pack.
- For workflow changes, update the root README, the affected pack documentation and any matching landing copy in site/src/components/HeroPanel.astro or site/src/content/docs/. Catalog cards inherit the README table summary; do not duplicate it in generated files.
- CI regenerates docs before checking/building, then rebuilds the production search index. Commit source changes only; there is no separate manual documentation export.
- site/src/content/docs/docs/ and its manifest are generated. Do not edit or commit them. The importer only cleans its owned subtree.
- specs/, tools/, site/ development documents and other repository files are not a published/searchable corpus. Public docs may link to their existing GitHub source without copying their contents. This does not make a public repository private.
- Markdown examples are displayed, never executed. Source-relative links to public docs become website links; existing non-public targets remain source links. Missing targets or headings block a build check.

## Publication

The intended public address is https://harrypotter48.github.io/rigorkit/. A local build or configured workflow does not mean it is live.

1. Confirm GitHub's default branch is main (the workflow's production gate).
2. In repository Settings → Pages, choose GitHub Actions as the source and permit the main branch in the github-pages environment.
3. Publish accepted source changes to main yourself. Every push triggers the workflow; only main can upload/deploy the checked site. Feature branches and PRs run checks but cannot deploy. README/pack edits therefore refresh docs, catalog summaries and search automatically after successful checks; no generated files or dist commit is needed.
4. Check the Actions deployment result, open the public home and a nested document directly, and exercise search.

Build/tests/validation must succeed before the checked site/dist artifact is uploaded. Only the deployment job has Pages/OIDC write authority. Failed checks do not run deploy; a failed provider attempt is not reported as successful publication. Verify the previous public version after a safe failed attempt before crediting that manual scenario. Never delete the current site to force a test.

Do not push, merge or change repository settings on the user's behalf without explicit authorization. The implementation agent does not run install/build/tests/deploy commands.
