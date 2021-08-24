module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': 'error',
        'class-methods-use-this': 'off',
        camelcase: 'off',
        'no-console': 'off',
        'no-param-reassign': 'of',
        'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
        'no-plusplus': 'off',
    },
};