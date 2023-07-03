# Enforces data-testid on various tags for easier testautomation (`@porscheinformatik/template/test-automation-id`)

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to enforce the attribute data-testid on various HTML tags

Examples of **incorrect** code for this rule:

```html

<a href='...'>link</a>

```

Examples of **correct** code for this rule:

```html

<a href='...' data-testid='link'>link</a>

```
