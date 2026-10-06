/**
 * @fileoverview Enforces the *-standard shape and matching status on status icons (<cds-icon>)
 * @author Porsche Informatik
 */
"use strict";

// One entry per status family: canonical shape, required status, banned aliases.
const STATUS_FAMILIES = [
    {shape: "info-standard", status: "info", aliases: ["info-circle", "ca-info"]},
    {shape: "success-standard", status: "success", aliases: []},
    {shape: "warning-standard", status: "warning", aliases: []},
    {shape: "error-standard", status: "danger", aliases: []},
];

const FAMILY_BY_SHAPE = new Map(
    STATUS_FAMILIES.flatMap((family) => {
        return [family.shape, ...family.aliases].map((shape) => [shape, family]);
    })
);

const findAttr = (element, name) => element.attributes.find((a) => a.name === name);
const hasBoundInput = (element, name) => !!element.inputs && element.inputs.some((i) => i.name === name);
const valueRange = (attr) => [attr.valueSpan.start.offset, attr.valueSpan.end.offset];
const attrRange = (attr) => [attr.sourceSpan.start.offset, attr.sourceSpan.end.offset];

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "Enforces the *-standard shape and matching status on status icons (<cds-icon>)",
        },
        fixable: "code",
        schema: [],
        messages: {
            wrongShape: 'Use shape="{{expected}}" instead of "{{actual}}"',
            missingStatus: 'Icon shape="{{shape}}" requires status="{{expected}}"',
            wrongStatus: 'Icon shape="{{shape}}" requires status="{{expected}}" instead of "{{actual}}"',
        },
    },

    create(context) {
        const checkShape = (shapeAttr, shape, family) => {
            if (shape === family.shape) {
                return;
            }
            context.report({
                node: shapeAttr,
                messageId: "wrongShape",
                data: {expected: family.shape, actual: shape},
                fix: (fixer) => fixer.replaceTextRange(valueRange(shapeAttr), family.shape),
            });
        };

        const checkStatus = (element, shapeAttr, family) => {
            // Dynamic [status] bindings can't be checked statically
            if (hasBoundInput(element, "status")) {
                return;
            }

            const statusAttr = findAttr(element, "status");
            const data = {shape: family.shape, expected: family.status};

            if (!statusAttr) {
                context.report({
                    node: shapeAttr,
                    messageId: "missingStatus",
                    data,
                    fix: (fixer) => fixer.insertTextAfterRange(attrRange(shapeAttr), ` status="${family.status}"`),
                });
                return;
            }

            const actual = statusAttr.value == null ? undefined : statusAttr.value.trim();
            if (actual === family.status || !statusAttr.valueSpan) {
                return;
            }

            context.report({
                node: statusAttr,
                messageId: "wrongStatus",
                data: {shape: data.shape, expected: data.expected, actual},
                fix: (fixer) => fixer.replaceTextRange(valueRange(statusAttr), family.status),
            });
        };

        return {
            'Element[name="cds-icon"]'(element) {
                const shapeAttr = findAttr(element, "shape");
                const shape = shapeAttr && shapeAttr.value != null ? shapeAttr.value.trim() : undefined;
                const family = FAMILY_BY_SHAPE.get(shape);

                if (!family || !shapeAttr.valueSpan) {
                    return;
                }

                checkShape(shapeAttr, shape, family);
                checkStatus(element, shapeAttr, family);
            },
        };

    },
};