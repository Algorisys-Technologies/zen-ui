import { Theme } from "./theme/theme";
import { Card, CardContent, CardHeader, CardTitle } from "./card/card";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { Input } from "./form/input/input";
import { CodeExample } from "./demo-helpers";

const PANEL: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };

const Sample = ({ label }: { label: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{label}</CardTitle>
    </CardHeader>
    <CardContent style={PANEL}>
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
        Body copy, a border and a muted line — all read from the tokens in scope.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button size="sm">Primary</Button>
        <Badge>Badge</Badge>
      </div>
    </CardContent>
  </Card>
);

const DensitySample = ({ label }: { label: string }) => (
  <div style={PANEL}>
    <p className="zen-m-0 zen-text-sm zen-font-semibold">{label}</p>
    <div style={{ display: "flex", gap: 8 }}>
      <Input placeholder="Customer" />
      <Button>Save</Button>
    </div>
    <Sample label="A card" />
  </div>
);

const NewThemeDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Theme</h1>
    <p className="lede">
      Themes used to be all-or-nothing: <code>applyTheme()</code> sets{" "}
      <code>data-theme</code> on <code>&lt;html&gt;</code> and the whole document
      moves. <code>&lt;Theme&gt;</code> narrows that to one subtree, so a dark
      panel can sit inside a light page.
    </p>

    <section className="demo-section">
      <h2>1. A theme for part of the page</h2>
      <CodeExample
        title="Three palettes, one document"
        description="Each panel below sets its own theme. Nothing else on the page changes, and no JavaScript runs — tokens.css declares each theme as an unanchored [data-theme] block, and CSS custom properties inherit down the tree."
        code={`<Theme name="dark">
  <Card>…</Card>
</Theme>`}
      >
        <div className="zen-grid zen-grid-cols-1 zen-gap-4 sm:zen-grid-cols-3">
          <Sample label="Inherited" />
          <Theme name="dark">
            <Sample label="dark" />
          </Theme>
          <Theme name="zen-theme">
            <Sample label="zen-theme" />
          </Theme>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Nesting</h2>
      <CodeExample
        title="The nearest themed ancestor wins"
        description="Themes nest without any bookkeeping — no level counting, no provider depth. A themed element inside another themed element simply rebinds the tokens for its own subtree, because that is how CSS custom properties already work."
        code={`<Theme name="dark">
  <Card>…</Card>

  <Theme name="zen-theme">
    <Card>…</Card>   {/* zen-theme, not dark */}
  </Theme>
</Theme>`}
      >
        <Theme name="dark">
          <div style={{ ...PANEL, padding: 16, borderRadius: 8 }} className="zen-bg-zen-background">
            <Sample label="dark" />
            <Theme name="zen-theme">
              <Sample label="zen-theme, inside dark" />
            </Theme>
          </div>
        </Theme>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. transparent — when the wrapper must not be a box</h2>
      <CodeExample
        title="display: contents, for grid and flex children"
        description="Theme renders a div, and a div in the middle of a grid or flex container becomes a layout box that swallows the children's participation in it. transparent renders the wrapper as display: contents so the children lay out as if it were not there. It is off by default because display: contents removes the element from the layout tree, which also drops any border or background set on it."
        code={`<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
  {/* without transparent, both cards land in ONE grid cell */}
  <Theme name="dark" transparent>
    <Card>…</Card>
    <Card>…</Card>
  </Theme>
</div>`}
      >
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
          <Theme name="dark" transparent>
            <Sample label="grid child 1" />
            <Sample label="grid child 2" />
          </Theme>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. What it does not do yet</h2>
      <CodeExample
        title="Portalled content keeps the document theme"
        description="Dialog, AlertDialog, Popover, Sheet, Tooltip and DropdownMenu render their content through a portal into <body> — which is outside the themed element, so they fall back to the document theme. Open the dialog below from inside the dark panel and it comes back light. This is a known limitation rather than a bug in your code; the fix is tracked as Phase 2."
        code={`<Theme name="dark">
  <Dialog>…</Dialog>   {/* the OVERLAY is not dark — it portals to <body> */}
</Theme>`}
      >
        <Theme name="dark">
          <div style={{ ...PANEL, padding: 16, borderRadius: 8 }} className="zen-bg-zen-background">
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              This panel is dark. Anything it portals to <code>&lt;body&gt;</code>{" "}
              — a dialog, a popover, a tooltip — is not.
            </p>
          </div>
        </Theme>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Density</h2>
      <CodeExample
        title="Comfortable, or compact for people working all day"
        description={`Comfortable is the default and is the size every component always had. Set data-density="compact" on any element (usually <html>) and what is inside tightens: inputs, selects and md buttons drop from 40px to 32px, table rows, menu items, cards and object-page sections lose padding. Type does not shrink. Like a theme it is a block of custom properties (tokens.css, "Density"), so it scopes to a subtree and needs no JavaScript; menus and popovers portalled to <body> follow the density on <html>.`}
        code={`<html data-density="compact">  <!-- or any element: a compact panel -->`}
      >
        <div className="zen-grid zen-grid-cols-1 zen-gap-6 sm:zen-grid-cols-2">
          <DensitySample label="comfortable" />
          <div data-density="compact">
            <DensitySample label="compact" />
          </div>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Touch density</h2>
      <CodeExample
        title="48px targets for shop-floor tablets and gloved hands"
        description={`data-density="touch" takes inputs, selects, md buttons, table rows and menu items to 48px. Type does not grow. Checkbox, radio, switch and the sm / xs buttons keep their fixed sizes: on a touch screen, wrap them in a label so the label is the target, or use md.`}
        code={`<html data-density="touch">  <!-- or just the operator panel -->`}
      >
        <div className="zen-grid zen-grid-cols-1 zen-gap-6 sm:zen-grid-cols-2">
          <DensitySample label="comfortable" />
          <div data-density="touch">
            <DensitySample label="touch" />
          </div>
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewThemeDemo;
