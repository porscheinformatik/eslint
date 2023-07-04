/**
 * @fileoverview Enforces data-testid on various tags for easier testautomation
 * @author Marcel Ring
 */
"use strict";

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforces data-testid on various tags for easier testautomation",
    },
    fixable: "code",
    schema: [],
    messages: {
      missingAttribute: `Attribute data-testid is missing on "{{tag}}" tag`
    }
  },

  create(context) {
    return {
      [`Element$1`]: function (node) {
        if (shouldHaveTestId(node)) {
          const hasTestIdAttribute = node.attributes.some(
            attr => attr.name === 'data-testid'
          );

          if (!hasTestIdAttribute) {
            context.report({
              node: node,
              messageId: 'missingAttribute',
              data: {
                tag: node.name
              },
              fix: (fixer) => {
                return fixer.insertTextAfterRange(
                  [0, getLocationToInsert(node)],
                  ` data-testid="${determineTestId(node)}"`
                );
              }
            });
          }
        }
      }
    };
  },
};

const TAGS = new Set(['a', 'button', 'input', 'textarea', 'select', 'option']);
const TAGS_START_WITH = ['clr-'];

function shouldHaveTestId(node) {
  return TAGS.has(node.name.toLowerCase())
      || TAGS_START_WITH.some(tag => node.name.startsWith(tag));
}

function getLocationToInsert(node) {
  const startSpan = node.startSourceSpan.start.file.content.substring(node.startSourceSpan.start.offset, node.startSourceSpan.end.offset);
  if (startSpan.endsWith('/>')) {
    return node.startSourceSpan.end.offset - 2;
  }

  return node.startSourceSpan.end.offset - 1;
}

function determineTestId(node) {
  return getBaseTestId(node) + "-" + getUUID(node);
}

function getBaseTestId(node) {
  if (node.name === 'a') {
    return 'link';
  } else {
    return node.name;
  }
}

function getUUID(node) {
  return hash(node.sourceSpan.start.file.url
      + node.sourceSpan.start.offset
      + node.sourceSpan.end.offset
      + node.name);
}

/*
 Fast hash function taken from https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
function hash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}