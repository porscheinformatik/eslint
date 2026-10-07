# Enforces the *-standard shape and matching status on status icons (<cds-icon>) (`@porscheinformatik/template/cds-icon-consistency`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule keeps status icons consistent by requiring the standard shape and matching
`status` attribute for each supported status family:

| Shape              | Required status |
|--------------------|-----------------|
| `info-standard`    | `info`          |
| `success-standard` | `success`       |
| `warning-standard` | `warning`       |
| `error-standard`   | `danger`        |

The info shapes `info-circle` and `ca-info` are treated as aliases of
`info-standard`.

The rule applies to static `shape` attributes on `<cds-icon>` elements. It does not
check dynamic `[shape]` bindings or status shapes outside the supported families.
Dynamic `[status]` bindings are left unchanged because their value cannot be checked
statically.

When possible, `--fix` replaces an info alias with `info-standard`, adds a missing
`status` attribute, or replaces a mismatched static status with its required value.

Examples of **incorrect** code:

```html

<cds-icon shape="info-circle" status="success"></cds-icon>
<cds-icon shape="error-standard" status="warning"></cds-icon>
<cds-icon shape="warning-standard"></cds-icon>
```

Examples of **correct** code:

```html

<cds-icon shape="info-standard" status="info"></cds-icon>
<cds-icon shape="error-standard" status="danger"></cds-icon>
<cds-icon shape="warning-standard" status="warning"></cds-icon>
```
