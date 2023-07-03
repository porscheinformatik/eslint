# @porscheinformatik/eslint-plugin-template

Provides custom eslint template rules for Porsche Informatik

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `@porscheinformatik/eslint-plugin-template`:

```sh
npm install @porscheinformatik/eslint-plugin-template --save-dev
```

## Usage

Add `@porscheinformatik/template` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "@porscheinformatik/template"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@porscheinformatik/template/rule-name": 2
    }
}
```

## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                   | Description                                                    | 💼 | 🔧 |
| :----------------------------------------------------- | :------------------------------------------------------------- | :- | :- |
| [test-automation-id](docs/rules/test-automation-id.md) | Enforces data-testid on various tags for easier testautomation | ✅  | 🔧 |

<!-- end auto-generated rules list -->


