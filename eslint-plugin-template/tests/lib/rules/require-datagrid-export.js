/**
 * @fileoverview Enforces an export button inside a <clr-dg-action-bar> on every <clr-datagrid>
 * @author Porsche Informatik
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/require-datagrid-export"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    // eslint-disable-next-line node/no-unpublished-require
    parser: require.resolve("@angular-eslint/template-parser")
});

const filename = "database-demands.component.html";

ruleTester.run("datagrid-export", rule, {
    valid: [
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="datagrid"\n` +
                `      [datagridRef]="datagridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // server-driven datagrid with backend export
        {
            filename,
            code:
                `<clr-datagrid #datagrid (clrDgRefresh)="refresh($event)">\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="datagrid"\n` +
                `      [datagridRef]="datagridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="true"\n` +
                `      (backendExport)="exportFromBackend($event)"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // custom template ref name is accepted as long as the button is wired up
        {
            filename,
            code:
                `<clr-datagrid #grid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button [datagrid]="grid" [datagridRef]="gridRef"></clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // export button inside a control-flow block within the action bar
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    @if (canExport) {\n` +
                `      <clr-export-datagrid-button [datagrid]="datagrid" [datagridRef]="datagridRef"></clr-export-datagrid-button>\n` +
                `    }\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // export button inside a structural directive within the action bar
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <ng-container *ngIf="canExport">\n` +
                `      <clr-export-datagrid-button [datagrid]="datagrid" [datagridRef]="datagridRef"></clr-export-datagrid-button>\n` +
                `    </ng-container>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
    ],

    invalid: [
        // bare datagrid: adds template ref, action bar and export button
        {
            filename,
            code:
                `<clr-datagrid>\n` +
                `</clr-datagrid>`,
            errors: [
                {messageId: 'missingTemplateRef', data: {ref: 'datagrid', refProperty: 'datagridRef'}},
                {messageId: 'missingActionBar'}
            ],
            output:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="datagrid"\n` +
                `      [datagridRef]="datagridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // server-driven datagrid: generates a backend export with a placeholder handler
        {
            filename,
            code:
                `<clr-datagrid #datagrid (clrDgRefresh)="refresh($event)">\n` +
                `</clr-datagrid>`,
            errors: [{messageId: 'missingActionBar'}],
            output:
                `<clr-datagrid #datagrid (clrDgRefresh)="refresh($event)">\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="datagrid"\n` +
                `      [datagridRef]="datagridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="true"\n` +
                `      (backendExport)="exportFromBackend($event)"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // nested datagrid: generated markup follows the datagrid's indentation
        {
            filename,
            code:
                `<div>\n` +
                `  <clr-datagrid #datagrid>\n` +
                `  </clr-datagrid>\n` +
                `</div>`,
            errors: [{messageId: 'missingActionBar'}],
            output:
                `<div>\n` +
                `  <clr-datagrid #datagrid>\n` +
                `    <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `      <clr-export-datagrid-button\n` +
                `        data-testid="clr-export-datagrid-button-database-demands"\n` +
                `        [datagrid]="datagrid"\n` +
                `        [datagridRef]="datagridRef"\n` +
                `        exportTitlePrefix="database-demands"\n` +
                `        [isBackendExport]="false"\n` +
                `        [exportButtonPosition]="'right'">\n` +
                `      </clr-export-datagrid-button>\n` +
                `    </clr-dg-action-bar>\n` +
                `  </clr-datagrid>\n` +
                `</div>`
        },
        // existing template ref is reused for the export button wiring
        {
            filename,
            code:
                `<clr-datagrid #grid>\n` +
                `</clr-datagrid>`,
            errors: [{messageId: 'missingActionBar'}],
            output:
                `<clr-datagrid #grid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="grid"\n` +
                `      [datagridRef]="gridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // action bar without data-testid and without export button: adds both
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`,
            errors: [
                {messageId: 'missingActionBarTestId'},
                {messageId: 'missingExport'}
            ],
            output:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands"\n` +
                `      [datagrid]="datagrid"\n` +
                `      [datagridRef]="datagridRef"\n` +
                `      exportTitlePrefix="database-demands"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // export button placed outside the action bar: reported, no autofix
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands"></clr-dg-action-bar>\n` +
                `  <clr-export-datagrid-button [datagrid]="datagrid" [datagridRef]="datagridRef"></clr-export-datagrid-button>\n` +
                `</clr-datagrid>`,
            errors: [{messageId: 'buttonOutsideActionBar'}],
            output: null
        },
        // export button missing [datagridRef]: reported, no autofix
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button [datagrid]="datagrid"></clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`,
            errors: [{messageId: 'missingInput', data: {input: 'datagridRef'}}],
            output: null
        },
        // export button missing both inputs: one error per input
        {
            filename,
            code:
                `<clr-datagrid #datagrid>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands">\n` +
                `    <clr-export-datagrid-button></clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`,
            errors: [
                {messageId: 'missingInput', data: {input: 'datagrid'}},
                {messageId: 'missingInput', data: {input: 'datagridRef'}}
            ],
            output: null
        },
        // multiple datagrids: each gets a unique numbered ref and suffixed ids
        {
            filename,
            code:
                `<clr-datagrid #datagrid1>\n` +
                `</clr-datagrid>\n` +
                `<clr-datagrid>\n` +
                `</clr-datagrid>`,
            errors: [
                {messageId: 'missingActionBar'},
                {messageId: 'missingTemplateRef', data: {ref: 'datagrid2', refProperty: 'datagrid2Ref'}},
                {messageId: 'missingActionBar'}
            ],
            output:
                `<clr-datagrid #datagrid1>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands-datagrid1">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands-datagrid1"\n` +
                `      [datagrid]="datagrid1"\n` +
                `      [datagridRef]="datagrid1Ref"\n` +
                `      exportTitlePrefix="database-demands-datagrid1"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>\n` +
                `<clr-datagrid #datagrid2>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands-datagrid2">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands-datagrid2"\n` +
                `      [datagrid]="datagrid2"\n` +
                `      [datagridRef]="datagrid2Ref"\n` +
                `      exportTitlePrefix="database-demands-datagrid2"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>`
        },
        // multiple datagrids with a ref name already taken elsewhere: taken names are skipped
        {
            filename,
            code:
                `<clr-datagrid>\n` +
                `</clr-datagrid>\n` +
                `<clr-datagrid>\n` +
                `</clr-datagrid>\n` +
                `<input #datagrid1>`,
            errors: [
                {messageId: 'missingTemplateRef', data: {ref: 'datagrid2', refProperty: 'datagrid2Ref'}},
                {messageId: 'missingActionBar'},
                {messageId: 'missingTemplateRef', data: {ref: 'datagrid3', refProperty: 'datagrid3Ref'}},
                {messageId: 'missingActionBar'}
            ],
            output:
                `<clr-datagrid #datagrid2>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands-datagrid2">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands-datagrid2"\n` +
                `      [datagrid]="datagrid2"\n` +
                `      [datagridRef]="datagrid2Ref"\n` +
                `      exportTitlePrefix="database-demands-datagrid2"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>\n` +
                `<clr-datagrid #datagrid3>\n` +
                `  <clr-dg-action-bar data-testid="clr-dg-action-bar-database-demands-datagrid3">\n` +
                `    <clr-export-datagrid-button\n` +
                `      data-testid="clr-export-datagrid-button-database-demands-datagrid3"\n` +
                `      [datagrid]="datagrid3"\n` +
                `      [datagridRef]="datagrid3Ref"\n` +
                `      exportTitlePrefix="database-demands-datagrid3"\n` +
                `      [isBackendExport]="false"\n` +
                `      [exportButtonPosition]="'right'">\n` +
                `    </clr-export-datagrid-button>\n` +
                `  </clr-dg-action-bar>\n` +
                `</clr-datagrid>\n` +
                `<input #datagrid1>`
        },
    ],
});