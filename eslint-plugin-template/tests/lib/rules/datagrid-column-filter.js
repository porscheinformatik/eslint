/**
 * @fileoverview Enforces a <clr-dg-filter> on <clr-dg-column> elements that bind clrDgField
 * @author Porsche Informatik
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/datagrid-column-filter"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  // eslint-disable-next-line node/no-unpublished-require
  parser: require.resolve("@angular-eslint/template-parser")
});

ruleTester.run("datagrid-column-filter", rule, {
  valid: [
    `<clr-dg-column [clrDgField]="'name'">
      Name
      <clr-dg-filter>
        <clr-string-filter clrProperty="name"></clr-string-filter>
      </clr-dg-filter>
    </clr-dg-column>`,
    `<clr-dg-column [clrDgField]="'amount'">
      Amount
      <clr-dg-filter>
        <clr-numeric-filter clrProperty="amount"></clr-numeric-filter>
      </clr-dg-filter>
    </clr-dg-column>`,
    // no clrDgField bound, no filter required
    `<clr-dg-column>Description</clr-dg-column>`,
    // sorting only, no filter required since clrDgField is not set
    `<clr-dg-column [clrDgSortBy]="'name'">Name</clr-dg-column>`,
  ],

  invalid: [
    {
      code: `<clr-dg-column [clrDgField]="'name'">Name</clr-dg-column>`,
      errors: [{ messageId: 'missingFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'name'">Name\n` +
        `  <clr-dg-filter>\n` +
        `    <clr-string-filter clrProperty="name"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
    {
      code: `<clr-dg-column [clrDgField]="'amount'" clrDgColType="number">Amount</clr-dg-column>`,
      errors: [{ messageId: 'missingFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'amount'" clrDgColType="number">Amount\n` +
        `  <clr-dg-filter>\n` +
        `    <clr-numeric-filter clrProperty="amount"></clr-numeric-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
    // clrDgField is a dynamic expression (not a static string literal), can't derive clrProperty automatically
    {
      code: `<clr-dg-column [clrDgField]="col.name">{{col.title}}</clr-dg-column>`,
      errors: [{ messageId: 'missingFilter' }],
      output: null
    },
    // legacy <clr-dg-numeric-filter> with no <clr-dg-filter> present: replace it in place
    {
      code:
        `<clr-dg-column [clrDgField]="'amount'">Amount\n` +
        `  <clr-dg-numeric-filter [clrDgNumericFilter]="filters['amount']"></clr-dg-numeric-filter>\n` +
        `</clr-dg-column>`,
      errors: [{ messageId: 'legacyFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'amount'">Amount\n` +
        `  <clr-dg-filter>\n` +
        `    <clr-numeric-filter clrProperty="amount"></clr-numeric-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
    // legacy <clr-dg-string-filter> with no <clr-dg-filter> present: replace it in place
    {
      code:
        `<clr-dg-column [clrDgField]="'name'">Name\n` +
        `  <clr-dg-string-filter [clrDgStringFilter]="nameFilter"></clr-dg-string-filter>\n` +
        `</clr-dg-column>`,
      errors: [{ messageId: 'legacyFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'name'">Name\n` +
        `  <clr-dg-filter>\n` +
        `    <clr-string-filter clrProperty="name"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
    // legacy <clr-dg-numeric-filter> alongside an already-present <clr-dg-filter>: remove the redundant legacy filter
    {
      code:
        `<clr-dg-column [clrDgField]="'amount'">Amount\n` +
        `  <clr-dg-numeric-filter [clrDgNumericFilter]="filters['amount']"></clr-dg-numeric-filter>\n` +
        `  <clr-dg-filter>\n` +
        `    <clr-string-filter clrProperty="amount"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`,
      errors: [{ messageId: 'redundantLegacyFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'amount'">Amount\n` +
        `  \n` +
        `  <clr-dg-filter>\n` +
        `    <clr-string-filter clrProperty="amount"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
    // legacy <clr-dg-string-filter> alongside an already-present <clr-dg-filter>: remove the redundant legacy filter
    {
      code:
        `<clr-dg-column [clrDgField]="'userGroups'" [clrDgSortBy]="userGroupsComparator"\n` +
        `  data-testid="clr-dg-column-1">\n` +
        `  <ng-template clrDgHideableColumn>{{'user.assigned.units.groups' | translate}}</ng-template>\n` +
        `  <clr-dg-string-filter [clrDgStringFilter]="userGroupsFilter"\n` +
        `  data-testid="clr-dg-string-filter-1"></clr-dg-string-filter>\n` +
        `\n` +
        `  <clr-dg-filter data-testid="clr-dg-filter-1">\n` +
        `    <clr-string-filter clrProperty="userGroups" data-testid="clr-string-filter-1"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`,
      errors: [{ messageId: 'redundantLegacyFilter' }],
      output:
        `<clr-dg-column [clrDgField]="'userGroups'" [clrDgSortBy]="userGroupsComparator"\n` +
        `  data-testid="clr-dg-column-1">\n` +
        `  <ng-template clrDgHideableColumn>{{'user.assigned.units.groups' | translate}}</ng-template>\n` +
        `  \n` +
        `\n` +
        `  <clr-dg-filter data-testid="clr-dg-filter-1">\n` +
        `    <clr-string-filter clrProperty="userGroups" data-testid="clr-string-filter-1"></clr-string-filter>\n` +
        `  </clr-dg-filter>\n` +
        `</clr-dg-column>`
    },
  ],
});
