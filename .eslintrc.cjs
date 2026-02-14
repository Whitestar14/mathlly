module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser'
  },
  plugins: ['@typescript-eslint', '@stylistic'],
  rules: {
    'vue/no-unused-refs': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/component-options-name-casing': 'warn',
    'vue/component-tags-order': 'warn',
    'vue/define-macros-order': 'warn',
    'vue/no-dupe-keys': 'warn',
    'vue/no-required-prop-with-default': 'warn',
    'vue/no-undef-components': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/no-unused-properties': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        registeredComponentsOnly: false
      }
    ],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/match-component-file-name': [
      'error',
      {
        extensions: ['vue'],
        shouldMatchCase: true
      }
    ],

    '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@stylistic/array-bracket-spacing': ['error', 'never'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/max-len': ['off'],
    '@stylistic/space-before-function-paren': ['error', 'never'],
    '@stylistic/padded-blocks': ['error', 'never'],
    '@stylistic/operator-linebreak': ['error', 'after'],
    '@stylistic/no-multi-spaces': ['error'],

    'no-trailing-spaces': ['error'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    '@stylistic/eol-last': ['error', 'always'],
    '@stylistic/space-in-parens': ['error', 'never'],
    '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
    '@stylistic/space-infix-ops': ['error'],
    '@stylistic/space-before-blocks': ['error', 'always'],
    '@stylistic/block-spacing': ['error', 'always'],

    'vue/html-indent': ['error', 2],
    'vue/max-attributes-per-line': ['off'],
    'vue/html-closing-bracket-newline': ['error', { multiline: 'never' }],
    'vue/singleline-html-element-content-newline': ['off'],
    'vue/multiline-html-element-content-newline': ['off'],
    'vue/html-self-closing': [
      'error',
      {
        html: { void: 'always', normal: 'never', component: 'always' }
      }
    ],

    'comma-dangle': 'off',
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'never'],
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'arrow-parens': 'off',
    'brace-style': 'off',
    'space-before-function-paren': 'off',
    'padded-blocks': 'off',
    'operator-linebreak': 'off',
    'no-multi-spaces': 'off',
    'eol-last': 'off',
    'space-in-parens': 'off',
    'keyword-spacing': 'off',
    'space-infix-ops': 'off',
    'space-before-blocks': 'off',
    'block-spacing': 'off'
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      rules: {

      }
    },
    {
      files: ['*.config.ts', 'vite.config.ts', '*.config.js'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      }
    },
    {
      files: ['scripts/**/*.js', 'scripts/**/*.cjs', '*.js', '*.cjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off'
      }
    }
  ]
}
