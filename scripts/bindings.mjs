/**
 * The binding registry — the single source of truth for what a zen-ui binding IS.
 *
 * CLAUDE.md says "adding a framework is one entry in scripts/demos.mjs". That was
 * true for `dev:all` and nothing else: deploy.sh, check-release, check-parity,
 * check-nav, check-package-artifacts, check-bundle-size, check-site and
 * visual-check each hardcoded exactly two bindings, so a third one was eight
 * silent edits away from being checked at all. Adding vanilla is what proved it.
 *
 * `demos.mjs` builds its proxy table from this plus the landing page, so the two
 * cannot drift.
 *
 * REACT IS THE REFERENCE. Where bindings disagree, it wins, and checks that
 * compare bindings compare each one against it rather than pairwise.
 */
/**
 * The divergent set shared by every data-driven, no-framework-primitive binding.
 *
 * vanilla and web-components have the SAME public surface (web-components
 * re-exports vanilla's exports verbatim and adds only a declarative custom-element
 * layer over the same factories), so they diverge from React in exactly the same
 * way. Kept as one const so the two cannot drift: update it once when the surface
 * moves. See the note on the vanilla entry for what each name is and why.
 */
const DATA_DRIVEN_DIVERGENT = [
  "AccordionContent", "AccordionItem", "AccordionItemSpec", "AccordionTrigger", "AlertClose", "AlertDialogAction",
  "AlertDialogCancel", "AlertDialogContent", "AlertDialogDescription", "AlertDialogFooter", "AlertDialogHandle", "AlertDialogHeader",
  "AlertDialogOverlay", "AlertDialogPortal", "AlertDialogTitle", "AlertDialogTrigger", "BAR_DESIGN", "BannerClose",
  "BannerDescription", "BannerTitle", "CalendarMode", "CalendarSelected", "CameraHandle", "CheckboxHandle",
  "CheckedState", "Child", "Command", "CommandEmpty", "CommandGroup", "CommandInput",
  "CommandItem", "CommandList", "CommandLoading", "CommandSeparator", "DEFAULT_EMAIL_DOMAINS", "DataTableCellContext",
  "DataTableColumn", "DateTimePickerHandle", "DialogClose", "DialogContent", "DialogDescription", "DialogFooter",
  "DialogHandle", "DialogHeader", "DialogOverlay", "DialogPortal", "DialogTitle", "DialogTrigger",
  "DropdownMenuActionItem", "DropdownMenuAlign", "DropdownMenuCheckboxItem", "DropdownMenuCheckboxItemSpec", "DropdownMenuContent", "DropdownMenuGroup",
  "DropdownMenuHandle", "DropdownMenuItem", "DropdownMenuItemSpec", "DropdownMenuLabel", "DropdownMenuLabelItem", "DropdownMenuPortal",
  "DropdownMenuRadioGroup", "DropdownMenuRadioGroupSpec", "DropdownMenuRadioItem", "DropdownMenuRadioOption", "DropdownMenuSeparator", "DropdownMenuSeparatorItem",
  "DropdownMenuShortcut", "DropdownMenuSide", "DropdownMenuSub", "DropdownMenuSubContent", "DropdownMenuSubSpec", "DropdownMenuSubTrigger",
  "DropdownMenuTrigger", "FieldApi", "FieldState", "Form", "FormControl", "FormController",
  "FormErrors", "FormFieldConfig", "FormOptions", "FormSchema", "INPUT_CLASS", "IconHandle",
  "InputHandle", "InputOTPGroup", "InputOTPSeparator", "InputOTPSlot", "MaskInputHandle", "NotificationsInboxHandle",
  "NumberFieldHandle", "PasswordInputHandle", "PopoverAlign", "PopoverAnchor", "PopoverContent", "PopoverHandle", "PopoverSide",
  "PopoverTrigger", "RatingSize", "SearchHandle", "SelectDialogHandle", "SelectableCard", "SelectableCardItemSpec", "SheetClose",
  "SheetContent", "SheetDescription", "SheetFooter", "SheetHandle", "SheetHeader", "SheetOverlay",
  "SheetPortal", "SheetSide", "SheetTitle", "SheetTrigger", "SidebarContextValue", "SidebarProviderHandle",
  "SkipToContentHandle",
  "SortingColumn", "SortingState", "SplitButtonMenuItem", "StepperApi", "StepperHandle", "StepperList",
  "StepperNavigation", "StepperNavigationOptions", "StepperPanel", "TEXTAREA_CLASS", "TabSpec", "TabsContent",
  "TabsList", "TabsTrigger", "TextareaHandle", "TimePickerHandle", "ToastVariant", "TooltipContent",
  "TooltipHandle", "TooltipPortal", "TooltipSide", "TooltipTrigger", "ValidationMode", "Validator",
  "ValueHelpItem", "ViewSettingsDialogHandle", "ZenComponent",
];

export const BINDINGS = [
  {
    id: "react",
    label: "React",
    pkg: "@algorisys/zen-ui-react",
    dir: "packages/react",
    base: "/builder",
    /** The reference implementation of the API. Exactly one binding may say true. */
    reference: true,
    /** Where the router lives, and how its routes are spelled. check-nav re-derives
     *  route -> component -> file from this rather than trusting nav.ts. */
    router: "packages/react/src/App.tsx",
    routeRe: /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s*\/>\}/g,
    navKey: "to",
    navRe: /\{[^{}\n]*to:\s*"([^"]+)"[^{}\n]*\}/g,
    importRe: /import\s+(\w+)\s+from\s+"\.\/components\/([^"]+)"/g,
    /** The demo title, asserted by check-site against the built tree. */
    title: "Zen UI Component Library",
  },
  {
    id: "solid",
    label: "Solid",
    pkg: "@algorisys/zen-ui-solid",
    dir: "packages/solid",
    base: "/builder-solid",
    router: "packages/solid/src/main.tsx",
    routeRe: /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}/g,
    navKey: "path",
    navRe: /\{[^{}\n]*path:\s*"([^"]+)"[^{}\n]*\}/g,
    importRe: /import\s+(\w+)\s+from\s+"\.\/components\/([^"]+)"/g,
    title: "Zen UI · Solid",
  },
  {
    id: "vanilla",
    label: "Vanilla",
    pkg: "@algorisys/zen-ui-vanilla",
    dir: "packages/vanilla",
    base: "/builder-vanilla",
    // A full binding now — every public React component has a vanilla port, so it
    // is held to the same parity rule as Solid: a component that exists only in
    // React (or only in vanilla) is a bug, not a roadmap item. It was `partial`
    // while it was an 8-component slice; that flag is gone.
    router: "packages/vanilla/src/main.ts",
    // No JSX: the routes are an object literal, so the "route -> component" pair
    // is a property rather than an element.
    routeRe: /"([^"]+)":\s*(\w+),/g,
    navKey: "to",
    navRe: /\{[^{}\n]*to:\s*"([^"]+)"[^{}\n]*\}/g,
    importRe: /import\s+(\w+)\s+from\s+"\.\/components\/([^"]+)"/g,
    title: "Zen UI · Vanilla",
    /**
     * vanilla's OWN divergences from React, unioned with check-parity's global
     * DIVERGENT set. Every family is ported — these are the two structural
     * consequences of being data-driven with no framework, not missing work:
     *
     *  1. React's compound sub-parts have no twin. `AccordionContent`,
     *     `DialogContent`, `TabsList`, the cmdk `Command*` primitives behind
     *     Combobox — vanilla exposes each family as ONE factory taking data, so
     *     there is nothing to name the parts. Same class as Solid's `options`
     *     Select, already in DIVERGENT.
     *  2. vanilla's handle/spec vocabulary has no twin the other way. `*Handle`
     *     is the object every factory returns (PORTING.md's ZenComponent); `*Spec`
     *     is a row of data a factory renders; the rest are the config/enum types a
     *     data-driven API needs where React defers to a child element.
     *
     * Enumerated, not suffix-matched: a real missing component must FAIL here, and
     * a wildcard on `*Handle` would hide one that was genuinely dropped. Shared
     * with web-components (identical surface) via DATA_DRIVEN_DIVERGENT above;
     * regenerate with check-parity's own logic if the surface moves.
     */
    divergent: DATA_DRIVEN_DIVERGENT,
  },
  {
    id: "web-components",
    label: "Web Components",
    pkg: "@algorisys/zen-ui-web-components",
    dir: "packages/web-components",
    base: "/builder-wc",
    // A declarative custom-element layer OVER the vanilla factories: each <zen-*>
    // element wraps the matching factory and renders it in the light DOM. It
    // re-exports vanilla's entire public surface verbatim, so its export names —
    // and therefore its divergence from React — are identical to vanilla's.
    router: "packages/web-components/src/main.ts",
    // No JSX: the routes are an object literal, same shape as vanilla.
    routeRe: /"([^"]+)":\s*(\w+),/g,
    navKey: "to",
    navRe: /\{[^{}\n]*to:\s*"([^"]+)"[^{}\n]*\}/g,
    importRe: /import\s+(\w+)\s+from\s+"\.\/components\/([^"]+)"/g,
    title: "Zen UI · Web Components",
    // vanilla's divergences, plus the two public types unique to this binding's
    // custom-element layer (the descriptor shape a consumer uses to define their
    // own <zen-*> element). Both are capitalised non-Props types, so check-parity
    // reads them as "a component only Web Components has" without this.
    divergent: [...DATA_DRIVEN_DIVERGENT, "ElementDef", "AttrType"],
  },
];

/** The reference binding. Throws rather than guess if the registry is malformed. */
export const REFERENCE = (() => {
  const refs = BINDINGS.filter((b) => b.reference);
  if (refs.length !== 1) {
    throw new Error(`exactly one binding must be the reference; found ${refs.length}`);
  }
  return refs[0];
})();

export const byId = (id) => BINDINGS.find((b) => b.id === id);
