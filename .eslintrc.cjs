module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'react',
    'react-hooks',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-redeclare': 'off',
    'no-undef': 'off',
    'no-useless-escape': 'off',
    'no-case-declarations': 'off',
    'no-prototype-builtins': 'off',
    'no-constant-condition': 'off',
    'no-useless-catch': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
