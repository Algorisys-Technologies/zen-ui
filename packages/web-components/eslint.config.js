import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Mirrors packages/vanilla/eslint.config.js. No framework plugin — the elements
 * are plain custom-element classes with no reactive model to get wrong.
 *
 * A missing flat config is not a soft failure: ESLint 9 ABORTS and the lint
 * script exits 2, which greps identical to a clean pass. See the vanilla config's
 * note. Adding a lint script without a config is worse than adding neither.
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
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
