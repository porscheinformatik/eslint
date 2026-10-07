/**
 * @fileoverview Enforces the *-standard shape and matching status on status icons (<cds-icon>)
 * @author Porsche Informatik
 */
"use strict";

const rule = require("../../../lib/rules/cds-icon-consistency"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    // eslint-disable-next-line node/no-unpublished-require
    parser: require.resolve("@angular-eslint/template-parser")
});

ruleTester.run("cds-icon-consistency", rule, {
    valid: [
        '<cds-icon shape="info-standard" status="info"></cds-icon>',
        '<cds-icon shape="success-standard" status="success"></cds-icon>',
        '<cds-icon shape="warning-standard" status="warning"></cds-icon>',
        '<cds-icon shape="error-standard" status="danger"></cds-icon>',
        '<cds-icon shape="info-standard" [status]="dynamicStatus"></cds-icon>',
        '<cds-icon shape="user"></cds-icon>',
        '<cds-icon></cds-icon>',
        '<cds-icon [shape]="iconShape"></cds-icon>',
        '<div shape="info-circle"></div>',
    ],

    invalid: [
        // Status only
        {
            code: '<cds-icon shape="info-standard"></cds-icon>',
            output: '<cds-icon shape="info-standard" status="info"></cds-icon>',
            errors: [{messageId: "missingStatus"}],
        },
        {
            code: '<cds-icon shape="error-standard" status="warning"></cds-icon>',
            output: '<cds-icon shape="error-standard" status="danger"></cds-icon>',
            errors: [{messageId: "wrongStatus"}],
        },
        // Shape only
        {
            code: '<cds-icon shape="info-circle" status="info"></cds-icon>',
            output: '<cds-icon shape="info-standard" status="info"></cds-icon>',
            errors: [{messageId: "wrongShape"}],
        },
        {
            code: '<cds-icon shape="info-circle" [status]="dynamicStatus"></cds-icon>',
            output: '<cds-icon shape="info-standard" [status]="dynamicStatus"></cds-icon>',
            errors: [{messageId: "wrongShape"}],
        },
        // Both, fixed in a single pass
        {
            code: '<cds-icon shape="ca-info"></cds-icon>',
            output: '<cds-icon shape="info-standard" status="info"></cds-icon>',
            errors: [{messageId: "wrongShape"}, {messageId: "missingStatus"}],
        },
        {
            code: '<cds-icon class="alert-icon" shape="info-circle" size="md"></cds-icon>',
            output: '<cds-icon class="alert-icon" shape="info-standard" status="info" size="md"></cds-icon>',
            errors: [{messageId: "wrongShape"}, {messageId: "missingStatus"}],
        },
    ],
});