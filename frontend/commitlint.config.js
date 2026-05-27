module.exports = {
  extends: ['@commitlint/config-nx-scopes', '@commitlint/config-angular'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'release'],
    ],
    'header-max-length': [2, 'always', 144],
  },
};
