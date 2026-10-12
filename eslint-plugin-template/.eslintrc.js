"use strict";

module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:eslint-plugin/recommended",
        "plugin:node/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2022,
    },
    env: {
        node: true,
        es2022: true,
    },
    overrides: [
        {
            files: ["tests/**/*.js"],
            env: {mocha: true},
        },
    ],
};