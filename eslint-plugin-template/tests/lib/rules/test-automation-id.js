/**
 * @fileoverview Enforces data-testid on various tags for easier testautomation
 * @author Marcel Ring
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/test-automation-id"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  // eslint-disable-next-line node/no-unpublished-require
  parser: require.resolve("@angular-eslint/template-parser")
});

ruleTester.run("test-automation-id", rule, {
  valid: [
    '<a href="..." data-testid="id">link</a>',
    '<button data-testid="id">link</button>',
    '<input data-testid="id"/>',
    '<textarea data-testid="id">link</textarea>',
    '<select data-testid="id"><option data-testid="id"></option></select>',
    '<clr-datagrid data-testid="id">link</clr-datagrid>',
    '<div></div>'
  ],

  invalid: [
    {
      code: '<a href="...">link</a>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<a href="..." data-testid="link-2237143440045836">link</a>'
    },
    {
      code: '<button>text</button>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<button data-testid="button-3099912099491019">text</button>'
    },
    {
      code: '<input type="text"/>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<input type="text" data-testid="input-8386839438878572"/>'
    },
    {
      code: '<input/>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<input data-testid="input-8606476617944665"/>'
    },
    {
      code: '<input>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<input data-testid="input-1457294834261236">'
    },
    {
      code: '<textarea></textarea>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<textarea data-testid="textarea-4392805660483690"></textarea>'
    },
    {
      code: '<select><option></option></select>',
      errors: [{messageId: 'missingAttribute'}, {messageId: 'missingAttribute'}],
      output: '<select data-testid="select-7998320597493312"><option data-testid="option-3883481082787931"></option></select>'
    },
    {
      code: '<select data-testid="id"><option></option></select>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<select data-testid="id"><option data-testid="option-2318820883629306"></option></select>'
    },
    {
      code: '<select><option data-testid="id"></option></select>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<select data-testid="select-6398033252145001"><option data-testid="id"></option></select>'
    },
    {
      code: '<clr-datagrid>text</clr-datagrid>',
      errors: [{messageId: 'missingAttribute'}],
      output: '<clr-datagrid data-testid="clr-datagrid-3037853201439386">text</clr-datagrid>'
    },
  ],
});
