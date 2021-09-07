module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['standard-with-typescript', 'plugin:jest/recommended'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'jest'],
  root: true
}
