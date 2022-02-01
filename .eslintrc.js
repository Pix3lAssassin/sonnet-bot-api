module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'comma-dangle': ['error', {
      arrays: 'never',
      objects: 'never',
      imports: 'never',
      exports: 'never',
      functions: 'never'
    }],
    'import/extensions': ['error', { jsx: 'always' }],
    'no-console': ['off']
  },
  ignorePatterns: [
    'generator/pronouncing',
    'generator/prng.js'
  ]
};
