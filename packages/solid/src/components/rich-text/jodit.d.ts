/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Minimal ambient types for `jodit`, an OPTIONAL peer dependency.
 *
 * The React binding uses `jodit-pro-react`; Jodit's own package is vanilla JS
 * and framework-agnostic, so the Solid binding drives it directly and the
 * `config` prop keeps meaning the same thing in both bindings.
 *
 * Declared here rather than depended on: nothing should force consumers who
 * never render <RichText> to install an editor. Build-time only — tsc does not
 * re-emit .d.ts inputs, so this never reaches `dist/`.
 */
declare module "jodit" {
  export interface JoditInstance {
    value: string;
    events: {
      on(event: string, handler: () => void): void;
    };
    destruct(): void;
  }
  export const Jodit: {
    make(el: HTMLElement, options?: Record<string, any>): JoditInstance;
  };
}
