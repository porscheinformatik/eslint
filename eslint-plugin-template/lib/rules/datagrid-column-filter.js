/**
 * @fileoverview Enforces a <clr-dg-filter> on <clr-dg-column> elements that bind clrDgField
 * @author Porsche Informatik
 */
"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforces a <clr-dg-filter> on <clr-dg-column> elements that bind clrDgField",
    },
    fixable: "code",
    schema: [],
    messages: {
      missingFilter: `<clr-dg-column> with clrDgField is missing a <clr-dg-filter> child`,
      legacyFilter: `Replace legacy <{{tag}}> with <clr-dg-filter><clr-{{filterType}}-filter>`,
      redundantLegacyFilter: `Remove legacy <{{tag}}>, a <clr-dg-filter> is already present`
    }
  },

  create(context) {
    return {
      [`Element[name="clr-dg-column"]`]: function (node) {
        const fieldInput = getFieldInput(node);

        if (!fieldInput) {
          return;
        }

        const legacyFilter = getLegacyFilterChild(node);

        if (hasFilterChild(node)) {
          // A proper filter is already present; any legacy built-in filter alongside it is redundant.
          if (legacyFilter) {
            context.report({
              node: legacyFilter,
              messageId: 'redundantLegacyFilter',
              data: { tag: legacyFilter.name },
              fix: fixer => fixer.removeRange(getElementRange(legacyFilter))
            });
          }
          return;
        }

        if (legacyFilter) {
          const property = getStaticPropertyName(fieldInput);
          const filterType = getLegacyFilterType(legacyFilter);

          context.report({
            node: legacyFilter,
            messageId: 'legacyFilter',
            data: { tag: legacyFilter.name, filterType },
            fix: fixer => property ? buildReplaceFix(legacyFilter, filterType, property, fixer) : null
          });
          return;
        }

        context.report({
          node: node,
          messageId: 'missingFilter',
          fix: fixer => buildFix(node, fieldInput, fixer)
        });
      }
    };
  },
};

// Clarity's built-in filters that <clr-dg-column> projects directly (without a <clr-dg-filter> wrapper).
// See ClrDatagridColumn's content projection selectors: "clr-dg-filter, clr-dg-string-filter, clr-dg-numeric-filter".
const LEGACY_FILTER_TAGS = {
  'clr-dg-string-filter': 'string',
  'clr-dg-numeric-filter': 'numeric'
};

function getFieldInput(node) {
  return node.inputs.find(input => input.name === 'clrDgField');
}

function hasFilterChild(node) {
  return node.children.some(child => child.name === 'clr-dg-filter');
}

function getLegacyFilterChild(node) {
  return node.children.find(child => Object.prototype.hasOwnProperty.call(LEGACY_FILTER_TAGS, child.name));
}

function getLegacyFilterType(legacyFilter) {
  return LEGACY_FILTER_TAGS[legacyFilter.name];
}

function getElementRange(node) {
  return [node.sourceSpan.start.offset, node.sourceSpan.end.offset];
}

// Replaces an existing legacy filter element (e.g. <clr-dg-numeric-filter>) in place with the new
// <clr-dg-filter><clr-{type}-filter> markup, preserving its original indentation.
function buildReplaceFix(legacyFilter, filterType, property, fixer) {
  const indent = ' '.repeat(legacyFilter.startSourceSpan.start.col);
  const markup =
    `<clr-dg-filter>\n` +
    `${indent}  <clr-${filterType}-filter clrProperty="${property}"></clr-${filterType}-filter>\n` +
    `${indent}</clr-dg-filter>`;

  return fixer.replaceTextRange(getElementRange(legacyFilter), markup);
}

// Only auto-insert a filter when the bound field is a static string literal, e.g. [clrDgField]="'name'",
// and the element is not self-closing, since we need a closing tag to insert the filter before.
function buildFix(node, fieldInput, fixer) {
  if (!node.endSourceSpan) {
    return null;
  }

  const property = getStaticPropertyName(fieldInput);

  if (!property) {
    return null;
  }

  const filterType = getFilterType(node);
  const indent = ' '.repeat(node.startSourceSpan.start.col + 2);
  const closingIndent = ' '.repeat(node.startSourceSpan.start.col);
  const markup =
    `\n${indent}<clr-dg-filter>` +
    `\n${indent}  <clr-${filterType}-filter clrProperty="${property}"></clr-${filterType}-filter>` +
    `\n${indent}</clr-dg-filter>` +
    `\n${closingIndent}`;

  return fixer.insertTextBeforeRange(
    [node.endSourceSpan.start.offset, node.endSourceSpan.end.offset],
    markup
  );
}

function getStaticPropertyName(input) {
  const source = input.value && input.value.source;

  if (!source) {
    return null;
  }

  const match = /^\s*['"]([^'"]+)['"]\s*$/.exec(source);
  return match ? match[1] : null;
}

function getFilterType(node) {
  const colTypeAttr = node.attributes.find(attr => attr.name === 'clrDgColType');
  const colTypeInput = node.inputs.find(input => input.name === 'clrDgColType');
  const value = colTypeAttr ? colTypeAttr.value : colTypeInput && colTypeInput.value && colTypeInput.value.source;

  if (value && /number/i.test(value)) {
    return 'numeric';
  }

  return 'string';
}
