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
  },
);
