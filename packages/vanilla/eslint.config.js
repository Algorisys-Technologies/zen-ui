import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Mirrors packages/react/eslint.config.js with no framework plugin, because there
 * is no framework: eslint-plugin-react-hooks and eslint-plugin-solid both exist to
 * catch a specific reactive-model mistake, and this binding has no reactive model
 * to get wrong.
 *
 * It exists at all because a missing flat config is not a soft failure: ESLint 9
 * ABORTS, `bun run lint:vanilla` exits 2, and a grep for error lines returns
 * nothing — which reads exactly like a clean pass. That is how the Solid binding
 * went un-linted for months while its script reported "0 issues". Adding a lint
 * script without a config is worse than adding neither.
 */
export default tseslint.config(
  { ignores: ["dist", "dist-demo"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /**
       * Teach ESLint the `_` convention TypeScript already honours.
       *
       * Every component here ends with `const { variant: _v, ...rest } = current`
       * — destructure-to-OMIT, so the interpreted props do not also get spread
       * onto the element as attributes. The binding is a naming convention for a
       * value that must exist and must not be used, and it is the only way to
       * write that in JS.
       *
       * This rule is vanilla-only on purpose rather than hoisted to all three:
       * React's baseline has zero no-unused-vars because JSX never needs the
       * pattern — it spreads `{...props}` after destructuring named props out.
       * Adding it there would be config for a case that does not arise.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
