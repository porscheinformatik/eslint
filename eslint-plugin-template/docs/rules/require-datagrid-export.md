# Enforces an export button inside a <clr-dg-action-bar> on every <clr-datagrid> (`@porscheinformatik/template/require-datagrid-export`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to enforce that every `<clr-datagrid>` offers an export of the currently displayed data, by
requiring a `<clr-export-datagrid-button>` inside a `<clr-dg-action-bar>`.

The rule checks that:

- the `<clr-datagrid>` has a template reference (e.g. `#datagrid`),
- the datagrid contains a `<clr-dg-action-bar>` with a `data-testid`,
- the action bar contains a `<clr-export-datagrid-button>`,
- the export button binds both `[datagrid]` and `[datagridRef]`.

With `--fix`, the rule adds a missing template reference, a missing action bar, a missing `data-testid` on the
action bar and a missing export button. The test IDs and the `exportTitlePrefix` are derived from the file
name, e.g. `database-demands.component.html` results in `clr-dg-action-bar-database-demands`. The generated
markup follows the indentation of the surrounding element. If the datagrid already has a template reference,
it is reused for the export button wiring instead of adding a new one.

If a template contains multiple datagrids, each one gets a unique numbered reference (`#datagrid1`,
`#datagrid2`, ...) with a matching `datagrid1Ref`, `datagrid2Ref`, ... property and suffixed test IDs.
Reference names that are already used elsewhere in the template are skipped, so the fix never produces a
duplicate template reference.

### Backend export for server-driven datagrids

Server-driven datagrids (those binding `(clrDgRefresh)`) only hold the current page on the client, so a
client-side export would only contain that page. For these datagrids the fix generates a backend export
instead: `[isBackendExport]="true"` plus a `(backendExport)` binding to an `exportFromBackend($event)` handler.
The button then emits the selected `ExportTypeEnum` (`ALL`, `FILTERED` or `SELECTED`) instead of writing the
file itself.

The handler is a deliberate placeholder. The build fails until it is implemented in the component:

```ts
exportFromBackend(type
:
ExportTypeEnum
):
void {
    // call the backend export endpoint with the current filters and sort for the given type
}
```

### What is not auto-fixed

The following cases are reported but cannot be auto-fixed:

- an export button placed outside the `<clr-dg-action-bar>`,
- an export button missing `[datagrid]` or `[datagridRef]`.

The rule only touches the template. The component class still needs the matching `ElementRef`, and the module
needs the `ExportDatagridButtonComponent` import. The `missingTemplateRef` message names the exact
`@ViewChild` to add. A missing property is also caught by Angular's template type checking at build time.

```ts
@ViewChild('datagrid', {read: ElementRef, static: true})
datagridRef
:
ElementRef;
```

Use `static: false` if the datagrid is rendered inside `@if` or `*ngIf`, otherwise `datagridRef` stays
`undefined`.

Examples of **incorrect** code for this rule:

```html

<clr-datagrid>
    <clr-dg-column [clrDgField]="'name'">Name</clr-dg-column>
</clr-datagrid>

```

```html

<clr-datagrid #datagrid>
    <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands"></clr-dg-action-bar>
    <clr-export-datagrid-button [datagrid]="datagrid" [datagridRef]="datagridRef"></clr-export-datagrid-button>
</clr-datagrid>

```

Examples of **correct** code for this rule:

```html

<clr-datagrid #datagrid>
    <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">
        <clr-export-datagrid-button
                data-testid="clr-export-datagrid-button-database-demands"
                [datagrid]="datagrid"
                [datagridRef]="datagridRef"
                exportTitlePrefix="database-demands"
                [isBackendExport]="false"
                [exportButtonPosition]="'right'">
        </clr-export-datagrid-button>
    </clr-dg-action-bar>
    <clr-dg-column [clrDgField]="'name'">Name</clr-dg-column>
</clr-datagrid>

```

A server-driven datagrid with a backend export:

```html

<clr-datagrid #datagrid (clrDgRefresh)="refresh($event)">
    <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">
        <clr-export-datagrid-button
                data-testid="clr-export-datagrid-button-database-demands"
                [datagrid]="datagrid"
                [datagridRef]="datagridRef"
                exportTitlePrefix="database-demands"
                [isBackendExport]="true"
                (backendExport)="exportFromBackend($event)"
                [exportButtonPosition]="'right'">
        </clr-export-datagrid-button>
    </clr-dg-action-bar>
</clr-datagrid>

```

The export button may also be rendered conditionally inside the action bar:

```html

<clr-datagrid #datagrid>
    <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">
        @if (canExport) {
        <clr-export-datagrid-button [datagrid]="datagrid" [datagridRef]="datagridRef"></clr-export-datagrid-button>
        }
    </clr-dg-action-bar>
</clr-datagrid>

```