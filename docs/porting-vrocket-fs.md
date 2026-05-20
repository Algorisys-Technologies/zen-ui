# Porting vrocket-fs to zen-ui (React)

This doc captures the plan for replacing vrocket-fs's hand-rolled Solid UI
layer with zen-ui React, while keeping vrocket-fs's JSON-metadata-driven
renderer/registry architecture intact.

Source repo: `/home/rajesh/work/algo/vrocket-fs` (SolidJS, JSON-driven low-code).
Target: `packages/react` in this repo.

## What we keep, what we replace

vrocket-fs has two layers:

1. **A renderer/framework layer** — `App.jsx`, `DynamicPage.jsx`,
   `ComponentFactory.jsx`, `ProtectedRoute.jsx`, the three contexts
   (`ToastContext`, `TranslationContext`, `UserContext`), the route table
   built from `metadata/*.json`.
2. **A component layer** — the atoms (`Button`, `InputText`, `Label`,
   `LoadingSpinner`) and widgets (`DataForm`, `DataTable`, `SearchForm`,
   `MultiStep`, `ConfirmModal`, `AboutUs`, `ContactUs`, `ViewJson`).

The plan is: **keep layer 1's shape, replace layer 2's leaves with zen-ui
React.** Metadata JSON files (`metadata/app_meta_*.json`,
`metadata/todo_app/*.json`) are not touched.

## Component mapping

### Atoms

| vrocket-fs                                  | zen-ui React                                     |
| ------------------------------------------- | ------------------------------------------------ |
| `components/atoms/Button.jsx`               | `button/`                                        |
| `components/atoms/InputText.jsx`            | `form/input/`                                    |
| `components/atoms/Label.jsx`                | `FormLabel` from `form-builder/form.tsx`         |
| `components/atoms/LoadingSpinner.jsx`       | `loading/loading.tsx`                            |

### Widgets

| vrocket-fs widget                          | zen-ui React replacement                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `widgets/DataForm.jsx`                     | `form-builder/` (`Form` + `Bound*` driven by `config.fields`)            |
| `widgets/DataTable.jsx`                    | `data-table/` (richer than vrocket's — filters + edit-cell included)     |
| `widgets/SearchForm.jsx`                   | Composition: `Form` + `BoundInput`/`Combobox` row → `DataTable`          |
| `widgets/MultiStep.jsx` (a.k.a. WizardForm)| `stepper/stepper.tsx`                                                    |
| `widgets/ConfirmModal.jsx`                 | `dialog/alert-dialog.tsx`                                                |
| `widgets/AboutUs.jsx`, `widgets/ContactUs.jsx` | Static JSX assembled from `card`, `banner`, `empty-state`, `button` |
| `widgets/ViewJson.jsx`                     | **Missing** — needs a thin Monaco (or CodeMirror) wrapper                |

### Field-type table (the contract inside DataForm)

This is the `switch(field.type)` that the new React `DataForm` will walk
when stamping fields from `config.fields`:

| Metadata `type`            | zen-ui React component                              |
| -------------------------- | --------------------------------------------------- |
| `text`, `email`, `password`| `BoundInput` (with appropriate `type`)              |
| `number`                   | `form/number-field/` (wrap as `BoundNumberField`)   |
| `textarea`, `long`         | `BoundTextarea`                                     |
| `select`                   | `BoundSelect`                                       |
| `lov` (server-fed list)    | `combobox/` (wrap as `BoundCombobox`)               |
| `file`                     | `file-upload/` (wrap as `BoundFileUpload`)          |

Note: `BoundInput`, `BoundTextarea`, `BoundSelect`, `BoundCheckbox`,
`BoundSwitch`, `BoundRadioGroup`, `BoundSlider` already exist in
`form-builder/bound-fields.tsx`. Combobox / NumberField / FileUpload need
small Bound* wrappers — same shape: read `useFormContext()`, render the
underlying component via `Controller`.

## Structural shift you can't avoid

vrocket-fs's `DataForm` manages its own state with Solid signals
(`createSignal({})` for formData/errors). zen-ui's `Bound*` components
expect a **react-hook-form** context: `useForm()` at the top, `<Form>`
provider around the children. So in the React port:

```tsx
function DataForm({ config, initialData, onSubmit }) {
  const form = useForm({ defaultValues: initialData ?? {} });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {config.fields.map(f => renderField(f))}  // ← the type switch
        {(config.actions ?? []).map(a => <Button key={a.name} {...a} />)}
      </form>
    </Form>
  );
}
```

You get validation/resolvers for free (zod, yup, etc.) — replacing the
hand-rolled `errors()` signal in the Solid version.

## Framework layer (your code, not zen-ui's)

These pieces are framework-shaped, not component-shaped — zen-ui does not
provide them and shouldn't. Port them straight from Solid to React:

| vrocket-fs file                          | React equivalent                                        |
| ---------------------------------------- | ------------------------------------------------------- |
| `App.jsx` (Router + Layout)              | React Router v6 + a `<Layout>` component                |
| `components/DynamicPage.jsx` (tabbed page)| zen-ui `tabs/` as the primitive; loop + state stay yours|
| `components/ComponentFactory.jsx`        | Same registry pattern, importing zen-ui-backed widgets  |
| `components/ProtectedRoute.jsx`          | React Router guard + `UserContext`                      |
| `context/ToastContext.jsx`               | Wrap zen-ui's `toast/`                                  |
| `context/TranslationContext.jsx`         | Keep as-is in React (or swap to `react-i18next`)        |
| `context/UserContext.jsx`                | Port to React context verbatim                          |
| `pages/Login.jsx`                        | **Missing** — build with `Form` + `BoundInput` + `Button`|

## Net "missing pieces" to build before vrocket-fs is fully ported

1. **`Bound*` wrappers** for `Combobox`, `NumberField`, `FileUpload` (small).
2. **`SearchForm` composite** — filter form (driven by `model[]`) on top of
   `DataTable`. Trivial composition; lives in the porting app, not in zen-ui.
3. **Login screen** — `Form` + two `BoundInput`s + submit `Button`. Lives in
   the porting app.
4. **Monaco wrapper** for `ViewJson`. Either add it to zen-ui (one new
   component) or keep it local to the porting app. The vrocket-fs version
   is ~40 lines around `monaco.editor.create`.

Everything else (atoms, all widgets except `ViewJson`, all metadata field
types) is already covered by zen-ui React.

## Suggested porting order

1. Stand up the React shell: Router, `<Layout>`, the three contexts
   (`User`, `Toast`, `Translation`), and `ProtectedRoute`. No widgets yet.
2. Port `ComponentFactory` with stubs returning `null`. Confirm
   `DynamicPage` renders the right routes/widgets-by-name from metadata.
3. Implement `DataForm` against zen-ui `form-builder` — this unlocks the
   field-type table. Pick one route (`/create`) to validate end-to-end.
4. Implement `DataTable` against zen-ui `data-table/` — pick `/rationkit`
   listing route to validate server fetch + pagination + delete confirm
   (use `AlertDialog`).
5. Compose `SearchForm` from the two above.
6. Drop in `Stepper` for `MultiStep`, `AlertDialog` for `ConfirmModal`,
   static composes for `AboutUs`/`ContactUs`. Build the `Login` page.
7. Last: decide on `ViewJson` — Monaco wrapper or drop the feature.

At each step the contract is: **the same `app_meta_*.json` files render
the same routes, with zen-ui components on the leaves.**
