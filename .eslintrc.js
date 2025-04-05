module.exports = {
    extends: ['@nestjs/eslint-config', 'prettier'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
        },
      ],
    },
  };
  