// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/** Layer boundaries (ADR 009). */
const forbid = (layer, group) => ({
  files: [`src/app/${layer}/**/*.ts`],
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: [{ group, message: `Import interdit dans "${layer}" (ADR 009).` }] },
    ],
  },
});
const frameworks = ['@angular/*', '@capacitor/*', '@capacitor-*', 'rxjs', 'rxjs/*'];

module.exports = defineConfig([
  { ignores: ['dist/**', 'android/**', '.angular/**', 'coverage/**'] },
  {
    files: ['src/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
  forbid('domain', [...frameworks, '**/application/**', '**/infrastructure/**', '**/ui/**']),
  forbid('application', [...frameworks, '**/infrastructure/**', '**/ui/**']),
  forbid('infrastructure', ['**/ui/**']),
  forbid('ui', ['**/infrastructure/**']),
]);
