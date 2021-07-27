module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    'jest/globals': true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    env: { es6: true },
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
      experimentalObjectRestSpread: true
    }
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'vue',
    'jest'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:vue/recommended',
    'plugin:jest/recommended'
  ],
  rules: {
    quotes: [ 1, 'single' ],
    semi: [ 2, 'never' ],
    'prefer-const': ['off'],
    'vue/html-quotes': ['off'],
    'vue/html-self-closing': [1, {
      'html': {
        'void': 'always',
        'normal': 'always',
        'component': 'always'
      },
      'svg': 'always',
      'math': 'always'
    }]
  }
}
