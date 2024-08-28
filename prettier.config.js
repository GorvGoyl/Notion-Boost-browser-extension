// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/** @type {import("prettier").Config} */
const config = {
    printWidth: 120,
    trailingComma: 'all',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: true,
    arrowParens: 'always',
    endOfLine: 'lf',
    singleAttributePerLine: true,
    overrides: [
        {
            files: ['*.md'],
            options: {
                tabWidth: 2,
            },
        },
        {
            files: ['*.yml'],
            options: {
                tabWidth: 2,
            },
        },
        {
            files: ['.hintrc'],
            options: {
                trailingComma: 'none',
            },
        },
    ],
    plugins: [
        'prettier-plugin-tailwindcss', //must be last
    ],
};

module.exports = config;
