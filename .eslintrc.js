module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
    'node/no-unpublished-require': 'off',
  },
};
