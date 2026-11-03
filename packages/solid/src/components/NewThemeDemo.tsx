import { type JSX } from "solid-js";
import { Theme } from "./theme/theme";
import { Card, CardContent, CardHeader, CardTitle } from "./card/card";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { Input } from "./form/input/input";
import { DemoPage, DemoSection } from "./demo-helpers";

const PANEL: JSX.CSSProperties = {
  display: "flex",
  "flex-direction": "column",
  gap: "12px",
};

const Sample = (props: { label: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{props.label}</CardTitle>
    </CardHeader>
    <CardContent style={PANEL}>
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        Body copy, a border and a muted line — all read from the tokens in scope.
      </p>
      <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
        <Button size="sm">Primary</Button>
        <Badge>Badge</Badge>
      </div>
    </CardContent>
  </Card>
);

const DensitySample = (props: { label: string }) => (
  <div style={PANEL}>
    <p class="zen-m-0 zen-text-sm zen-font-semibold">{props.label}</p>
    <div style={{ display: "flex", gap: "8px" }}>
      <Input placeholder="Customer" />
      <Button>Save</Button>
    </div>
    <Sample label="A card" />
  </div>
);

const NewThemeDemo = () => (
  <DemoPage
    title="Theme"
    description={
      <>
        Themes used to be all-or-nothing: <code>applyTheme()</code> sets{" "}
        <code>data-theme</code> on <code>&lt;html&gt;</code> and the whole
        document moves. <code>&lt;Theme&gt;</code> narrows that to one subtree, so
        a dark panel can sit inside a light page.
      </>
    }
  >
    <DemoSection
      title="1. A theme for part of the page"
      codeTitle="Three palettes, one document"
      codeDescription="Each panel below sets its own theme. Nothing else on the page changes, and no JavaScript runs — tokens.css declares each theme as an unanchored [data-theme] block, and CSS custom properties inherit down the tree."
      code={`<Theme name="dark">
  <Card>…</Card>
</Theme>`}
    >
      <div class="zen-grid zen-grid-cols-1 zen-gap-4 sm:zen-grid-cols-3">
        <Sample label="Inherited" />
        <Theme name="dark">
          <Sample label="dark" />
        </Theme>
        <Theme name="zen-theme">
          <Sample label="zen-theme" />
        </Theme>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Nesting"
      codeTitle="The nearest themed ancestor wins"
      codeDescription="Themes nest without any bookkeeping — no level counting, no provider depth. A themed element inside another themed element simply rebinds the tokens for its own subtree, because that is how CSS custom properties already work."
      code={`<Theme name="dark">
  <Card>…</Card>

  <Theme name="zen-theme">
    <Card>…</Card>   {/* zen-theme, not dark */}
  </Theme>
</Theme>`}
    >
      <Theme name="dark">
        <div
          class="zen-bg-zen-background"
          style={{ ...PANEL, padding: "16px", "border-radius": "8px" }}
        >
          <Sample label="dark" />
          <Theme name="zen-theme">
            <Sample label="zen-theme, inside dark" />
          </Theme>
        </div>
      </Theme>
    </DemoSection>

    <DemoSection
      title="3. transparent — when the wrapper must not be a box"
      codeTitle="display: contents, for grid and flex children"
      codeDescription="Theme renders a div, and a div in the middle of a grid or flex container becomes a layout box that swallows the children's participation in it. transparent renders the wrapper as display: contents so the children lay out as if it were not there. It is off by default because display: contents removes the element from the layout tree, which also drops any border or background set on it."
      code={`<div style={{ display: "grid", "grid-template-columns": "1fr 1fr" }}>
  {/* without transparent, both cards land in ONE grid cell */}
  <Theme name="dark" transparent>
    <Card>…</Card>
    <Card>…</Card>
  </Theme>
</div>`}
    >
      <div style={{ display: "grid", gap: "16px", "grid-template-columns": "1fr 1fr" }}>
        <Theme name="dark" transparent>
          <Sample label="grid child 1" />
          <Sample label="grid child 2" />
        </Theme>
      </div>
    </DemoSection>

    <DemoSection
      title="4. What it does not do yet"
      codeTitle="Portalled content keeps the document theme"
      codeDescription="Dialog, AlertDialog, Popover, Sheet, Tooltip, DropdownMenu, Combobox and MultiCombobox render their content through a portal into <body> — which is outside the themed element, so they fall back to the document theme. This is a known limitation rather than a bug in your code; the fix is tracked as Phase 2."
      code={`<Theme name="dark">
  <Dialog>…</Dialog>   {/* the OVERLAY is not dark — it portals to <body> */}
</Theme>`}
    >
      <Theme name="dark">
        <div
          class="zen-bg-zen-background"
          style={{ ...PANEL, padding: "16px", "border-radius": "8px" }}
        >
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            This panel is dark. Anything it portals to <code>&lt;body&gt;</code> —
            a dialog, a popover, a tooltip — is not.
          </p>
        </div>
      </Theme>
    </DemoSection>

    <DemoSection
      title="5. Density"
      codeTitle="Comfortable, or compact for people working all day"
      codeDescription={`Comfortable is the default and is the size every component always had. Set data-density="compact" on any element (usually <html>) and what is inside tightens: inputs, selects and md buttons drop from 40px to 32px, table rows, menu items, cards and object-page sections lose padding. Type does not shrink. Like a theme it is a block of custom properties (tokens.css, "Density"), so it scopes to a subtree and needs no JavaScript; menus and popovers portalled to <body> follow the density on <html>.`}
      code={`<html data-density="compact">  <!-- or any element: a compact panel -->`}
    >
      <div class="zen-grid zen-grid-cols-1 zen-gap-6 sm:zen-grid-cols-2">
        <DensitySample label="comfortable" />
        <div data-density="compact">
          <DensitySample label="compact" />
        </div>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewThemeDemo;
