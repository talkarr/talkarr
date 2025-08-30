import {fixupConfigRules, fixupPluginRules} from "@eslint/compat";
import js from "@eslint/js";

import tseslint from "typescript-eslint";

import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettier from "eslint-plugin-prettier";
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

import _import from "eslint-plugin-import";
import muiPathImports from "eslint-plugin-mui-path-imports";

import {FlatCompat} from "@eslint/eslintrc";

import path from "node:path";
import {fileURLToPath} from "node:url";

import playwright from 'eslint-plugin-playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default tseslint.config(
    {
        ...playwright.configs['flat/recommended'],
        files: ['e2e/**'],
        rules: {
            ...playwright.configs['flat/recommended'].rules,
        }
    },
    eslintPluginUnicorn.configs.recommended,
    {
        ignores: [
            "**/node_modules/",
            "**/dist",
            "**/public",
            "**/generated",
            "**/next.config.mjs",
        ],
    }, ...fixupConfigRules(compat.extends(
        "next",
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
        "airbnb-base",
        "airbnb-typescript/base",
        "plugin:deprecation/recommended",
    )), {
        plugins: {
            "no-relative-import-paths": noRelativeImportPaths,
            prettier,
            import: fixupPluginRules(_import),
            "simple-import-sort": simpleImportSort,
            "mui-path-imports": muiPathImports,
        },

        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "linebreak-style": ["error", "unix"],
            "no-nested-ternary": "off",
            "no-confusing-arrow": "off",
            "mui-path-imports/mui-path-imports": "error",
            "import/prefer-default-export": "off",

            "prettier/prettier": ["error", {
                singleQuote: true,
                trailingComma: "all",
                printWidth: 80,
                tabWidth: 4,
                useTabs: false,
                semi: true,
                jsxSingleQuote: false,
                bracketSpacing: true,
                arrowParens: "avoid",
                importOrderSeparation: true,
            }],

            "function-paren-newline": "off",
            "implicit-arrow-linebreak": "off",
            "object-curly-newline": "off",
            "operator-linebreak": "off",
            "import/no-named-as-default-member": "off",
            "import/no-named-as-default": "off",
            "import/first": "error",
            "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
            "import/newline-after-import": "error",
            "import/no-duplicates": "error",

            "import/extensions": ["error", "never", {
                json: "always",
                svg: "always",
                jpg: "always",
                png: "always",
            }],

            "no-relative-import-paths/no-relative-import-paths": ["warn", {
                allowSameFolder: true,
                rootDir: "src",
            }],

            "@typescript-eslint/consistent-type-imports": ["error", {
                prefer: "type-imports",
                fixStyle: "separate-type-imports",
                disallowTypeAnnotations: true,
            }],

            "simple-import-sort/imports": ["error", {
                groups: [
                    ["@backend/init-server", "^@backend/init-server$"],
                    ["\\u0000$"],
                    ["^next"],
                    ["^react"],
                    ['^@mui/material$', '^@mui/material/'],
                    ['^@mui/icons-material'],
                    ['^@mui/'],
                    ["^\\w"],
                    [
                        "^\\u0000@backend/workers/",
                        "^@backend/workers/"
                    ],
                    ["^@backend"],
                    ["^@/app"],
                    ["^@/types"],
                    ["^@/hooks"],
                    ["^@/utils"],
                    ["^@/"],
                    ["^.+\\.module\\.css$"],
                    ["^[./]"],
                ],
            }],

            "import/order": "off",

            "simple-import-sort/exports": "error",
            indent: "off",
            "@typescript-eslint/indent": "off",
            "no-console": "off",
            "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
            "max-len": "off",
            "no-useless-return": "off",

            "import/no-extraneous-dependencies": ["error", {
                devDependencies: true,
            }],

            // disable because now it is in @stylistic/eslint-plugin-ts
            "@typescript-eslint/quotes": "off",
            "@typescript-eslint/brace-style": "off",
            "@typescript-eslint/comma-dangle": "off",
            "@typescript-eslint/comma-spacing": "off",
            "@typescript-eslint/func-call-spacing": "off",
            "@typescript-eslint/keyword-spacing": "off",
            "@typescript-eslint/no-extra-semi": "off",
            "@typescript-eslint/object-curly-spacing": "off",
            "@typescript-eslint/semi": "off",
            "@typescript-eslint/space-before-function-paren": "off",
            "@typescript-eslint/space-before-blocks": "off",
            "@typescript-eslint/space-infix-ops": "off",
            "@typescript-eslint/switch-colon-spacing": "off",
            "@typescript-eslint/type-annotation-spacing": "off",
            "@typescript-eslint/no-throw-literal": "off",

            "@typescript-eslint/lines-between-class-members": "off",

            "@typescript-eslint/explicit-function-return-type": ["error", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
            }],

            "no-continue": "off",
            "arrow-parens": ["error", "as-needed"],

            "react/jsx-no-leaked-render": ["warn", {
                validStrategies: ["ternary"],
            }],

            "react/jsx-closing-bracket-location": ["warn", "tag-aligned"],
            "react/jsx-closing-tag-location": ["warn", "tag-aligned"],

            "react/jsx-curly-brace-presence": ["warn", {
                props: "never",
                children: "never",
            }],

            "react/jsx-curly-newline": ["off", {
                multiline: "consistent",
                singleline: "consistent",
            }],

            "react/jsx-first-prop-new-line": ["error", "multiline"],
            "react/jsx-key": ["error"],
            "react/jsx-props-no-multi-spaces": ["warn"],

            "react/jsx-tag-spacing": ["warn", {
                closingSlash: "never",
                beforeSelfClosing: "always",
                afterOpening: "never",
                beforeClosing: "allow",
            }],

            "react/jsx-wrap-multilines": ["warn", {
                declaration: "parens",
                assignment: "parens",
                return: "parens",
                arrow: "parens",
                condition: "ignore",
                logical: "ignore",
                prop: "ignore",
            }],

            /*"unicorn/filename-case": ["error", {
                cases: {
                    camelCase: true,
                    pascalCase: true,
                    kebabCase: true,
                    snakeCase: true,
                },
            }],*/
            "unicorn/no-null": "off",
            "unicorn/prevent-abbreviations": "off",
            "unicorn/prefer-global-this": "off",
            "unicorn/no-typeof-undefined": "off",
            "unicorn/prefer-add-event-listener": "off",
            "unicorn/no-process-exit": "off",
            "unicorn/prefer-module": "off",
            "unicorn/prefer-top-level-await": "off",
        },
    },
    {
        // disable type-aware linting on JS files
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    }
);
