import js from "@eslint/js";
import globals from "globals";
import solid from "eslint-plugin-solid/configs/typescript";
import tseslint from "typescript-eslint";

/**
 * Mirrors packages/react/eslint.config.js, swapping the React plugins for
 * eslint-plugin-solid (already a dependency, previously unused).
 *
 * This file did not exist, so `bun run lint:solid` failed outright — ESLint 9
 * aborts when it finds no flat config. A grep for error lines then returns
 * nothing, which reads exactly like a clean pass. The Solid binding has
 * therefore never actually been linted.
 *
 * eslint-plugin-solid earns its place here: it catches the destructuring of
 * reactive props, which silently breaks reactivity in Solid and is invisible to
 * both tsc and the build — precisely the class of bug the React/Solid ports keep
 * producing.
 */
export default tseslint.config(
  { ignores: ["dist", "dist-demo"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, solid],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // An underscore prefix is the conventional "I must declare this but do
      // not use it" marker, and Solid's APIs force it: <Show>'s render prop is
      // typed to take the accessor whether or not you read it, and a generic
      // sometimes exists only to satisfy a signature. Without this the only
      // ways to silence it are a disable comment per site or deleting a
      // parameter the type requires — the latter breaks the build, which is how
      // this setting got added.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
