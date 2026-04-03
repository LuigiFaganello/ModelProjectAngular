/* eslint-env node */
module.exports = {
  root: true,
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '*.config.js',
    '*.config.cjs'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: false,
      },
      extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:@typescript-eslint/recommended',
        'prettier'
      ],
      plugins: ['@typescript-eslint', '@angular-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'error'
      }
    },
    {
      files: ['*.html'],
      extends: ['plugin:@angular-eslint/template/recommended'],
      rules: {
        '@angular-eslint/template/eqeqeq': 'error'
      }
    }
  ]
};
