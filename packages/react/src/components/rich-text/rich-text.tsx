/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

/**
 * RichText — WYSIWYG editor wrapping `jodit-pro-react` (an OPTIONAL peer
 * dependency). Lazy-loaded so it never weighs on consumers who don't edit rich
 * text. Install `jodit-pro-react` to use it.
 *
 *   <RichText value={html} onChange={setHtml} placeholder="Write…" />
 *
 * `onChange` fires on blur (Jodit's recommended commit point — its per-keystroke
 * event is noisy and can fight controlled state).
 */

export interface RichTextProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** raw Jodit config, merged over the defaults */
  config?: Record<string, any>;
  className?: string;
}

const JoditEditor = React.lazy(() => import("jodit-pro-react"));

/**
 * `jodit-pro-react` is an OPTIONAL peer dep, so `import()` rejects whenever a
 * consumer renders RichText without installing it. Suspense does NOT catch a
 * rejected lazy import — only an error boundary does — so without this the whole
 * React tree unmounts with a module-resolution stack trace, and the one thing it
 * never says is "install jodit-pro-react". The Solid binding degrades rather
 * than crashing; this brings React level.
 *
 * Deliberately narrow: anything that is not the missing dependency is re-thrown,
 * so real editor bugs still surface instead of hiding behind an install hint.
 */
class RichTextBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    // Vite, webpack and Node each phrase a missing module differently; match on
    // the package name, which all of them include.
    if (!/jodit-pro-react|Failed to fetch dynamically imported module/i.test(error.message)) {
      throw error;
    }
    return this.props.fallback;
  }
}

export const RichText = ({
  value = "",
  onChange,
  placeholder,
  config,
  className,
}: RichTextProps) => {
  const editorConfig = React.useMemo(
    () => ({ readonly: false, placeholder: placeholder ?? "", ...config }),
    [placeholder, config],
  );

  return (
    <div className={className}>
      <RichTextBoundary
        fallback={
          <div className="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4 zen-text-sm zen-text-zen-muted-fg">
            <strong className="zen-font-medium zen-text-zen-foreground">
              RichText needs an optional peer dependency.
            </strong>{" "}
            Install <code>jodit-pro-react</code> to use this component.
          </div>
        }
      >
        <React.Suspense
          fallback={<div className="zen-text-sm zen-text-zen-muted-fg">Loading editor…</div>}
        >
        <JoditEditor
          value={value}
          config={editorConfig}
          onBlur={(html: string) => onChange?.(html)}
        />
        </React.Suspense>
      </RichTextBoundary>
    </div>
  );
};
RichText.displayName = "RichText";
