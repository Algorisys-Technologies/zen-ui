import { Link } from "react-router-dom";

/**
 * Landing page for the demo app.
 * Lists the components shipped in @algorisys/zen-ui with quick-jump links
 * into each demo.
 */

const COMPONENTS = [
  { to: "/button-new", name: "Button", description: "forwardRef, asChild, CVA variants × colors × sizes × shapes" },
  { to: "/tooltip-new", name: "Tooltip", description: "Radix Tooltip — positioning, dismissal, a11y" },
  { to: "/dropdown-menu", name: "DropdownMenu", description: "Radix DropdownMenu — action menus, sub-menus, checkbox/radio items" },
  { to: "/separator", name: "Separator", description: "Radix Separator — horizontal / vertical with decorative semantics" },
  { to: "/switch-new", name: "Switch", description: "Radix Switch — sizes, controlled / uncontrolled, form submission" },
  { to: "/checkbox-new", name: "Checkbox", description: "Radix Checkbox — native tri-state indeterminate, sizes" },
  { to: "/radio-group", name: "RadioGroup", description: "Radix RadioGroup — roving tabindex, arrow nav, form submission" },
  { to: "/progress-new", name: "Progress", description: "Radix Progress — sizes × colors, accessible value" },
  { to: "/avatar-new", name: "Avatar", description: "Radix Avatar — image + initials fallback + stacked group" },
  { to: "/badge-new", name: "Badge", description: "Styled span with variants × colors, asChild for clickable" },
  { to: "/skeleton-new", name: "Skeleton", description: "Animated muted-box placeholder" },
  { to: "/loading-new", name: "Loading", description: "Animated spinner with sr-only label, color=current for buttons" },
  { to: "/select-new", name: "Select", description: "Radix Select — keyboard nav, groups, form submission" },
  { to: "/slider-new", name: "Slider", description: "Radix Slider — single + range, vertical, keyboard control" },
  { to: "/scroll-area-new", name: "ScrollArea", description: "Radix ScrollArea — custom scrollbars, both axes" },
  { to: "/input-new", name: "Input + Textarea", description: "Plain styled <input> / <textarea>, all native attrs" },
  { to: "/number-field-new", name: "NumberField", description: "Number input with −/+ stepper, clamp, decimal step" },
  { to: "/date-picker-new", name: "DatePicker", description: "react-day-picker in a Radix Popover; inline Calendar too" },
  { to: "/otp-new", name: "InputOTP", description: "input-otp library, themed; paste / autocomplete / a11y" },
  { to: "/phone-input-new", name: "PhoneInput", description: "Composition: Select (country) + Input (number)" },
  { to: "/fab-new", name: "FAB", description: "Fixed-position Button wrapper + DropdownMenu for speed-dial" },
  { to: "/stepper", name: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)" },
  { to: "/banner", name: "Banner", description: "Page-top persistent callout — verification reminders, maintenance windows, impersonation" },
];

const Welcome = () => {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "4rem 3rem 6rem",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: "4rem" }}>
        <h1
          style={{
            fontSize: "3.6rem",
            fontWeight: 700,
            color: "var(--zen-color-foreground)",
            margin: "0 0 1rem 0",
            letterSpacing: "-0.02em",
          }}
        >
          Zen UI Component Library
        </h1>
        <p
          style={{
            fontSize: "1.6rem",
            color: "var(--zen-color-muted-fg)",
            margin: 0,
            maxWidth: 70 + "ch",
            lineHeight: 1.6,
          }}
        >
          A React component library shipping shadcn-style primitives on top of
          Radix UI, themed via CSS custom properties. Each component forwards a
          ref, supports <code>asChild</code> where it makes sense, and exposes a
          flat React-idiomatic prop API with no JSON-config layer.
        </p>
      </header>

      <section style={{ marginBottom: "4rem" }}>
        <h2 style={{ fontSize: "2rem", margin: "0 0 1.6rem 0", color: "var(--zen-color-foreground)" }}>
          Components ({COMPONENTS.length})
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(28rem, 1fr))",
            gap: "1.6rem",
          }}
        >
          {COMPONENTS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{
                display: "block",
                padding: "1.8rem",
                background: "var(--zen-color-background)",
                border: "1px solid var(--zen-color-border)",
                borderRadius: 10,
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--zen-color-primary)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--zen-color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h3 style={{ fontSize: "1.7rem", margin: "0 0 0.4rem 0", color: "var(--zen-color-foreground)" }}>
                {c.name}
              </h3>
              <p style={{ fontSize: "1.3rem", color: "var(--zen-color-muted-fg)", margin: 0, lineHeight: 1.5 }}>
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Welcome;
