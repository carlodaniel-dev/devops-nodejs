import js from '@eslint/js'
import globals from 'globals'

export default [
    { ignores: ['coverage/**', 'node_modules/**'] },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.node }
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_|^req$|^next$' }],
            eqeqeq: ['error', 'smart'],
            'no-var': 'error',
            'prefer-const': 'error'
        }
    },
    {
        files: ['**/*.test.js'],
        languageOptions: { globals: { ...globals.jest } }
    }
]
