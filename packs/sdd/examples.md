# Factory examples — from an intent to an accepted slice

These are illustrative examples for an adopting project, not runtime modules shipped by rigorkit. Keep that project's architecture and test setup; use existing adapters instead of adding these names as mandatory abstractions.

## 1. Turn a feature into useful slices
Intent: "Let editors configure the clear button on each use of a reusable form."

| ID | Title | Why (value) | Feature | Size | Depends on | Status | Change |
|---|---|---|---|---|---|---|---|
| HU-1 | Configure the clear button per widget instance | Two widgets can use one form with different visibility | Instance form options | S | none | next | — |
| HU-2 | Configure the clear button per CMS section instance | Section editors control their own use of the form | Instance form options | S | Shared contract from HU-1 if actually needed | backlog | — |

The owner chooses priority and approves the proposal. Each slice includes configuration, the necessary data path, rendering behavior and evidence. A backend field, an endpoint or a UI control alone is an internal task. If a shared contract creates a dependency, record it rather than claiming the slices can deploy independently.

## 2. Agree on a short behavior contract
```text
Origin: HU-1
RF-1: WHEN an editor sets clear-button visibility on a widget instance,
      THE SYSTEM SHALL apply that choice to that instance only.
Acceptance: widget A shows the button and widget B hides it,
            while both reference the same form definition.
Invariant INV-1: changing one instance does not modify the shared definition
                 or another instance.
Out of scope: a form-wide switch, CMS editing in this slice, unrelated styling.
Open question: what should happen to older instances without a stored option?
```

The owner answers the migration/default question before the affected implementation. No hidden default or speculative fallback is implied. The form definition is shared structure; widget/section configuration is instance state. A global switch cannot satisfy this acceptance criterion.

## 3. Report decisions before applying them
```text
Reused decision: instance options belong to the consuming widget/section.
Source: <actual repo or vault note and section>.
Applicability: this option varies between uses of one shared form.
New decision: <only if the existing architecture leaves a choice unresolved>.
Status: awaiting owner approval before applying the new decision.
```

Use real sources. If no applicable agreement exists, propose the decision rather than inventing a note or silently choosing. The repository governs conflicts with the vault.

## 4. Keep the implementation small
Illustrative `form-view.cjs` uses an explicit boolean on every example instance. It assumes existing persistence/validation has supplied that approved shape. It neither defines old-instance defaults nor adds an editor or persistence layer.

```javascript
function createFormView(definition, instance) {
  return {
    formId: definition.id,
    fields: definition.fields,
    instanceId: instance.id,
    showClearButton: instance.showClearButton,
  };
}

module.exports = { createFormView };
```

```javascript
const { createFormView } = require('./form-view.cjs');
const definition = { id: 'contact', fields: ['email'] };
const widgetA = { id: 'widget-a', formId: 'contact', showClearButton: true };
const widgetB = { id: 'widget-b', formId: 'contact', showClearButton: false };

const visible = createFormView(definition, widgetA);
const hidden = createFormView(definition, widgetB);
// visible.showClearButton === true
// hidden.showClearButton === false
// Both keep the same formId; no global setting is mutated.
```

This pure function is only one internal task. The slice also requires wiring the actual instance editor, persisted/read configuration and renderer in the adopting application.

## 5. Write a check that rejects the wrong scope
Illustrative `form-view.test.cjs`, using an existing Jest setup:

```javascript
const { createFormView } = require('./form-view.cjs');

test('RF-1.H1: two instances of one form keep independent clear buttons', () => {
  const definition = { id: 'contact', fields: ['email'] };
  const before = JSON.stringify(definition);
  const widgetA = { id: 'widget-a', showClearButton: true };
  const widgetB = { id: 'widget-b', showClearButton: false };

  const first = createFormView(definition, widgetA);
  const second = createFormView(definition, widgetB);
  expect(first.formId).toBe(second.formId);
  expect(first.showClearButton).toBe(true);
  expect(second.showClearButton).toBe(false);
  expect(JSON.stringify(definition)).toBe(before);

  const updatedA = createFormView(definition, { ...widgetA, showClearButton: false });
  expect(updatedA.showClearButton).toBe(false);
  expect(createFormView(definition, widgetB).showClearButton).toBe(false);
});
```

The opposite settings expose a plausible global-setting mistake. This is a unit test, not proof that widget/CMS persistence or rendering is correctly wired. The minimal example is CommonJS; adapt imports to the existing project instead of changing its module system. Matchers: [Jest documentation](https://jestjs.io/docs/using-matchers).

## 6. Check the real integration and the handoff
An in-process integration test must traverse the adopting application's existing configuration writer/reader and renderer/model path, using its real adapters where feasible. Assert that saving A's choice does not change B, reading both preserves opposite choices, and the renderer receives the instance option. If historical instance defaults were approved, cover that behavior too. Do not replace those interactions with mocks that merely repeat the desired result. If this needs Docker or unavailable services, leave it pending and ask; never start that infrastructure automatically.

```text
Requirement  Applies to             Implementation       Evidence
RF-1         Widget instances A/B   <real file:line>       <unit + integration result>
INV-1        Shared form + A/B      <real consumers>       <non-interference result>
Architecture Existing project rules <decision/source>     <review result>
Pending      Browser interaction    Not executed          Owner request required
```

Every station receives scope, approved decisions/sources, consumer references, evidence and pending items. The reviewer checks the spec AND actual affected consumers, including instances outside the edited files; a compliant folder layout does not prove correct behavior. Owner acceptance applies to this slice only. Commit, next-slice selection and deployment remain separate decisions.

## 7. Feed the brain without duplicating project documentation
After acceptance, record repo-specific facts in that repo; propose a generic lesson in `specs/learnings/`, for example: "For an instance-scoped option, check opposite values on two uses of one shared definition." Propose cross-project promotion to the vault and write there only with approval. Future spec, design, build and review stations can consult the lesson selectively.

## Example validation status
The JavaScript/Jest blocks explain an approved behavior contract; they are not executed integration evidence for an adopting application. No additional Jest dependency is installed by this documentation change. Remaining Factory v2 automation must not be inferred from these examples.
