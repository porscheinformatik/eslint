# Enforces a <clr-dg-filter> on <clr-dg-column> elements that bind clrDgField (`@porscheinformatik/template/datagrid-column-filter`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to enforce that every `<clr-dg-column>` which binds `clrDgField` also has a matching
`<clr-dg-filter>` child, so the column is always filterable.

When the bound field is a static string literal (e.g. `[clrDgField]="'name'"`), the rule can automatically
insert a matching filter with `--fix`. It inserts a `<clr-numeric-filter>` when `clrDgColType="number"` is
set, otherwise a `<clr-string-filter>`. When the bound field is a dynamic expression (e.g.
`[clrDgField]="col.name"`), the rule reports the issue but cannot auto-fix it, since it cannot statically
determine the property to filter on.

If the column already contains a legacy Clarity built-in filter — `<clr-dg-string-filter>` or
`<clr-dg-numeric-filter>` (used directly on `<clr-dg-column>` without a `<clr-dg-filter>` wrapper) — the
rule migrates it instead of adding a duplicate:

- If no `<clr-dg-filter>` is present yet, the legacy filter is replaced in place with the matching
  `<clr-dg-filter><clr-string-filter clrProperty="..."></clr-string-filter></clr-dg-filter>` or
  `<clr-dg-filter><clr-numeric-filter clrProperty="..."></clr-numeric-filter></clr-dg-filter>`.
- If a `<clr-dg-filter>` is already present, the redundant legacy filter is simply removed.

Examples of **incorrect** code for this rule:

```html

<clr-dg-column [clrDgField]="'name'">Name</clr-dg-column>

```

Examples of **correct** code for this rule:

```html

<clr-dg-column [clrDgField]="'name'">
  Name
  <clr-dg-filter>
    <clr-string-filter clrProperty="name"></clr-string-filter>
  </clr-dg-filter>
</clr-dg-column>

```

A `<clr-dg-column>` without a bound `clrDgField` is not affected by this rule:

```html

<clr-dg-column>Description</clr-dg-column>

```
