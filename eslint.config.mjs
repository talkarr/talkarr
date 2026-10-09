import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import muiPathImports from 'eslint-plugin-mui-path-imports';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        ...playwright.configs['flat/recommended'],
        files: ['e2e/**'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
        },
    },
    ...nextVitals,
    ...nextTs,
    eslintPluginUnicorn.configs.recommended,
    globalIgnores([
        '**/node_modules/',
        '**/dist',
        '**/public',
        '**/generated',
        '**/next.config.mjs',
    ]),
    {
        settings: {
            react: {
                version: '19',
            },
        },
        plugins: {
            'no-relative-import-paths': noRelativeImportPaths,
            prettier,
            'simple-import-sort': simpleImportSort,
            'mui-path-imports': muiPathImports,
        },
        rules: {
            'linebreak-style': ['error', 'unix'],
            'no-nested-ternary': 'off',
            'no-confusing-arrow': 'off',
            'mui-path-imports/mui-path-imports': 'error',
            'import/prefer-default-export': 'off',

            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    trailingComma: 'all',
                    printWidth: 80,
                    tabWidth: 4,
                    useTabs: false,
                    semi: true,
                    jsxSingleQuote: false,
                    bracketSpacing: true,
                    arrowParens: 'avoid',
                    importOrderSeparation: true,
                },
            ],

            'function-paren-newline': 'off',
            'implicit-arrow-linebreak': 'off',
            'object-curly-newline': 'off',
            'operator-linebreak': 'off',
            'import/no-named-as-default-member': 'off',
            'import/no-named-as-default': 'off',
            'import/first': 'error',
            'import/consistent-type-specifier-style': [
                'error',
                'prefer-top-level',
            ],
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',

            'import/extensions': [
                'error',
                'never',
                {
                    json: 'always',
                    svg: 'always',
                    jpg: 'always',
                    png: 'always',
                },
            ],

            'no-relative-import-paths/no-relative-import-paths': [
                'warn',
                {
                    allowSameFolder: true,
                    rootDir: 'src',
                },
            ],

            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                    disallowTypeAnnotations: true,
                },
            ],

            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['@backend/init-server', '^@backend/init-server$'],
                        [String.raw`\u0000$`],
                        ['^next'],
                        ['^react'],
                        ['^@mui/material$', '^@mui/material/'],
                        ['^@mui/icons-material'],
                        ['^@mui/'],
                        [String.raw`^\w`],
                        [
                            String.raw`^\u0000@backend/workers/`,
                            '^@backend/workers/',
                        ],
                        ['^@backend'],
                        ['^@/app'],
                        ['^@/types'],
                        ['^@/hooks'],
                        ['^@/utils'],
                        ['^@/'],
                        [String.raw`^.+\.module\.css$`],
                        ['^[./]'],
                    ],
                },
            ],

            'import/order': 'off',

            'simple-import-sort/exports': 'error',
            indent: 'off',
            '@typescript-eslint/indent': 'off',
            'no-console': 'off',
            'no-restricted-syntax': [
                'error',
                'ForInStatement',
                'LabeledStatement',
                'WithStatement',
            ],
            'max-len': 'off',
            'no-useless-return': 'off',
            'no-unused-var': 'off',

            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                },
            ],

            // disable because now it is in @stylistic/eslint-plugin-ts
            '@typescript-eslint/quotes': 'off',
            '@typescript-eslint/brace-style': 'off',
            '@typescript-eslint/comma-dangle': 'off',
            '@typescript-eslint/comma-spacing': 'off',
            '@typescript-eslint/func-call-spacing': 'off',
            '@typescript-eslint/keyword-spacing': 'off',
            '@typescript-eslint/no-extra-semi': 'off',
            '@typescript-eslint/object-curly-spacing': 'off',
            '@typescript-eslint/semi': 'off',
            '@typescript-eslint/space-before-function-paren': 'off',
            '@typescript-eslint/space-before-blocks': 'off',
            '@typescript-eslint/space-infix-ops': 'off',
            '@typescript-eslint/switch-colon-spacing': 'off',
            '@typescript-eslint/type-annotation-spacing': 'off',
            '@typescript-eslint/no-throw-literal': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',

            '@typescript-eslint/lines-between-class-members': 'off',

            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                },
            ],

            'no-continue': 'off',
            'arrow-parens': ['error', 'as-needed'],

            'react/jsx-no-leaked-render': [
                'warn',
                {
                    validStrategies: ['ternary'],
                },
            ],

            'react/jsx-closing-bracket-location': ['warn', 'tag-aligned'],
            'react/jsx-closing-tag-location': ['warn', 'tag-aligned'],

            'react/jsx-curly-brace-presence': [
                'warn',
                {
                    props: 'never',
                    children: 'never',
                },
            ],

            'react/jsx-curly-newline': [
                'off',
                {
                    multiline: 'consistent',
                    singleline: 'consistent',
                },
            ],

            'react/jsx-first-prop-new-line': ['error', 'multiline'],
            'react/jsx-key': ['error'],
            'react/jsx-props-no-multi-spaces': ['warn'],

            'react/jsx-tag-spacing': [
                'warn',
                {
                    closingSlash: 'never',
                    beforeSelfClosing: 'always',
                    afterOpening: 'never',
                    beforeClosing: 'allow',
                },
            ],

            'react/jsx-wrap-multilines': [
                'warn',
                {
                    declaration: 'parens',
                    assignment: 'parens',
                    return: 'parens',
                    arrow: 'parens',
                    condition: 'ignore',
                    logical: 'ignore',
                    prop: 'ignore',
                },
            ],

            /*"unicorn/filename-case": ["error", {
                cases: {
                    camelCase: true,
                    pascalCase: true,
                    kebabCase: true,
                    snakeCase: true,
                },
            }],*/
            'unicorn/no-null': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/prefer-global-this': 'off',
            'unicorn/no-typeof-undefined': 'off',
            'unicorn/prefer-add-event-listener': 'off',
            'unicorn/no-process-exit': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-top-level-await': 'off',
            'unicorn/no-nested-ternary': 'off',
        },
    },
    {
        // disable type-aware linting on JS files
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        extends: [tseslint.configs.disableTypeChecked],
    },
]);
