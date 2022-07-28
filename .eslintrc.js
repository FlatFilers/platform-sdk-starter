module.exports = {
    env: {
        "browser": true,
        "es2021": true,
        "node": true,
        "jest": true
    },
    extends: [
        "eslint:recommended",
        "prettier",
    ],
    parserOptions: {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    rules: {
        "no-unused-vars": [0, {}],
        "no-case-declarations": [0, {}],
        "no-redeclare": [0, {}],
    },
    overrides: [
        {
            files: ['**/*.ts?(x)'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
    ],
};
