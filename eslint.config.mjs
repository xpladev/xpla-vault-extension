import eslintJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierPluginRecommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      import: importPlugin,
    },
    rules: {
      // React
      'react/self-closing-comp': 'error',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'error',
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // Import 정렬
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',

      // 일반
      'no-console': ['warn', { allow: ['debug', 'info', 'warn', 'error'] }],
      'no-case-declarations': 'off',
      'no-empty': 'off',
      'no-useless-catch': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'build/',
      'scripts/',
      'patches/',
      'eslint.config.mjs',
    ],
  },
];

export default eslintConfig;
