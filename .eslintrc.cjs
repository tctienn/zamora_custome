/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: { node: true },
  'extends': [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:i18n-json/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser'
  },
  'plugins': [
    'simple-import-sort',
    'vue',
    '@typescript-eslint'
  ],
  root: true,
  'ignorePatterns': ['package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.vitest.json', 'localeEn.json', 'localeVi.json'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'indent': ['error', 2],
    'semi': ['error', 'always'],
    'max-len': ['error', { 'code': 180 }],
    'vue/html-indent': ['error', 2, {
      'attribute': 1,
      'baseIndent': 1,
      'closeBracket': 0,
      'alignAttributesVertically': true,
      'ignores': []
    }],
    'brace-style': ['error', '1tbs'],
    'curly': ['error', 'all'],
    'object-curly-newline': ['error', { 'multiline': true }],
    'object-curly-spacing': ['error', 'always'],
    'vue/no-multi-spaces': ['error'],
    'no-multi-spaces': ['error'],
    'quotes': ['error', 'single'],
    'vue/html-quotes': ['error', 'single', { 'avoidEscape': true }],
    'lines-between-class-members': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': 'error',
    'key-spacing': 'off',
    '@typescript-eslint/key-spacing': 'error',
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': 'error',
    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': 'error',
    'comma-style': ['error', 'last'],
    'operator-linebreak': ['error', 'before', {
      'overrides': {
        '?': 'before',
        ':': 'before',
        '=': 'after'
      }
    }],
    'object-property-newline': 'error',
    'vue/max-attributes-per-line': ['error', {
      'singleline': { 'max': 1 },
      'multiline': { 'max': 1 }
    }],
    'vue/attribute-hyphenation': ['error', 'always'],
    'vue/define-macros-order': ['error', { 'order': ['defineProps', 'defineEmits'] }],
    'vue/static-class-names-order': 'error',
    'vue/attributes-order': ['error', {
      'alphabetical': true,
      'order': [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        ['UNIQUE', 'SLOT'],
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ]
    }],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/multi-word-component-names': ['error', { 'ignores': ['Login', 'Captcha', '403', '404'] }],
    'vue/new-line-between-multi-line-property': ['error', { 'minLineOfMultilineProperty': 2 }],
    'vue/html-closing-bracket-newline': ['error', {
      'singleline': 'never',
      'multiline': 'never'
    }],
    'vue/component-tags-order': ['error', { 'order': ['template', 'script[setup]', 'script:not([setup])'] }],
    'vue/order-in-components': ['error', {
      'order': [
        'el',
        'name',
        'key',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        ['components', 'directives', 'filters'],
        'extends',
        'mixins',
        ['provide', 'inject'],
        'ROUTER_GUARDS',
        'layout',
        'middleware',
        'validate',
        'scrollToTop',
        'transition',
        'loading',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'emits',
        'setup',
        'asyncData',
        'data',
        'fetch',
        'head',
        'computed',
        'watch',
        'watchQuery',
        'LIFECYCLE_HOOKS',
        'methods',
        ['template', 'render'],
        'renderError'
      ]
    }],
    'vue/padding-line-between-blocks': ['error', 'always'],
    'vue/padding-lines-in-component-definition': ['error', {
      'betweenOptions': 'always',
      'groupSingleLineProperties': true
    }]
  }
};
