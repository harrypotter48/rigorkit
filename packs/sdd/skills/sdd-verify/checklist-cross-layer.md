# Cross-layer checklist
Added/renamed/retyped cross-layer fields; one layer => n/a. Compilation misses runtime drift. Fix now or record mismatch in spec/baseline; NEVER silently defer.
1. Entity/model field/type/nullability; DB decimal may arrive string.
2. Migration exists/idempotent; honest down(); comment irreversibility/data loss.
3. DTO validator; optionality matches entity BOTH ways.
4. Shared model/request/response back↔front ONCE in shared package, not duplicates.
5. EVERY writer: public checkout/admin/webhook/job/import…
6. Readers' old assumptions (e.g. ×100 for expected cents).
7. Seeds/fixtures: clean reseed reflects new state.
Typechecks prove compatible types, not data flow. Critical => local dod-critical.md.
