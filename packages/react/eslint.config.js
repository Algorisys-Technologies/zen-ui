import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },
  {
    // Fast Refresh is an APP concern: the rule exists so Vite can hot-swap a
    // module without losing state. Library components are not hot-swapped by
    // the consumer, and they legitimately export a `cva()` variants object or a
    // hook beside the component they belong to — shadcn/ui, which this library
    // follows, does exactly that throughout.
    //
    // `allowConstantExport` does not cover it: the rule only recognises literal
    // initialisers, so `export const buttonVariants = cva(...)` still trips it.
    // The alternative was splitting 17 component files so their variants and
    // hooks live elsewhere — churn against a public API surface, for an HMR
    // heuristic, with no runtime effect.
    //
    // Scoped to library source only. The demo app is a real Vite app and its
    // files sit DIRECTLY in src/components (NewButtonDemo.tsx and friends), so
    // the pattern below — at least one directory deep — leaves the rule on
    // exactly where Fast Refresh matters.
    files: ['src/components/*/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' }
  }
)
