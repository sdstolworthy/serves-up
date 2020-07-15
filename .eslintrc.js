module.exports = {
  'plugins': ['chai-expect', 'mocha'],
  'env': {
    'browser': true,
    'es2020': true,
    'mocha': true,
    'node':true,
  },
  'extends': ['eslint:recommended', 'plugin:chai-expect/recommended', 'plugin:mocha/recommended'],
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module'
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
