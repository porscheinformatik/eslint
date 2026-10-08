/**
 * @fileoverview Enforces an export button inside a <clr-dg-action-bar> on every <clr-datagrid>
 * @author Porsche Informatik
 */
"use strict";

const path = require("path");

const DATAGRID = "clr-datagrid";
const DATAGRID_REF = "datagrid";
const ACTION_BAR = "clr-dg-action-bar";
const EXPORT_BUTTON = "clr-export-datagrid-button";
const REQUIRED_INPUTS = ["datagrid", "datagridRef"];
const BACKEND_EXPORT_OUTPUT = "backendExport";
const BACKEND_EXPORT_HANDLER = "exportFromBackend";

const DATAGRID_START_PATTERN = /<clr-datagrid[\s>/]/g;
const TEMPLATE_REF_PATTERN = /#([A-Za-z_$][\w$]*)/g;

//------------------------------------------------------------------------------
// Template AST helpers
//------------------------------------------------------------------------------

// Children of elements, templates and control-flow blocks (@if, @switch, @for/@empty, @defer)
const childrenOf = (node) => [
    ...(node.children ?? []),
    ...(node.branches ?? []),
    ...(node.cases ?? []),
    ...[node.empty, node.placeholder, node.loading, node.error].filter(Boolean),
];

const findElement = (node, name) => {
    for (const child of childrenOf(node)) {
        const match = child.name === name ? child : findElement(child, name);
        if (match) {
            return match;
        }
    }
    return null;
};

const hasInput = (element, name) =>
    element.attributes.some((a) => a.name === name) ||
    (element.inputs ?? []).some((i) => i.name === name);

// Server-driven grids only hold the current page, so they need a backend export
const isServerDriven = (datagrid) =>
    (datagrid.outputs ?? []).some((o) => o.name === "clrDgRefresh");

const afterTagName = (element) => element.startSourceSpan.start.offset + 1 + element.name.length;
const afterStartTag = (element) => element.startSourceSpan.end.offset;
const childIndent = (element) => " ".repeat(element.startSourceSpan.start.col + 2);

//------------------------------------------------------------------------------
// Generated markup
//------------------------------------------------------------------------------

const indent = (lines, prefix) => lines.map((line) => prefix + line);
const asInsertion = (lines, prefix) => `\n${indent(lines, prefix).join("\n")}`;

const exportButtonLines = ({id, ref, refProperty, backend}) => [
    `<${EXPORT_BUTTON}`,
    `  data-testid="${EXPORT_BUTTON}-${id}"`,
    `  [datagrid]="${ref}"`,
    `  [datagridRef]="${refProperty}"`,
    `  exportTitlePrefix="${id}"`,
    `  [isBackendExport]="${backend}"`,
    ...(backend ? [`  (${BACKEND_EXPORT_OUTPUT})="${BACKEND_EXPORT_HANDLER}($event)"`] : []),
    `  [exportButtonPosition]="'right'">`,
    `</${EXPORT_BUTTON}>`,
];

const actionBarLines = (names) => [
    `<${ACTION_BAR} data-testid="${ACTION_BAR}-${names.id}">`,
    ...indent(exportButtonLines(names), "  "),
    `</${ACTION_BAR}>`,
];

//------------------------------------------------------------------------------
// Rule
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforces an export button inside a <clr-dg-action-bar> on every <clr-datagrid>",
        },
        fixable: "code",
        schema: [],
        messages: {
            missingTemplateRef:
                "Datagrid needs a template reference. Add #{{ref}} and in the component: " +
                "@ViewChild('{{ref}}', {read: ElementRef}) {{refProperty}}: ElementRef",
            missingActionBar: `Datagrid has no <${ACTION_BAR}> with an export button`,
            missingActionBarTestId: `<${ACTION_BAR}> requires a data-testid`,
            missingExport: `<${ACTION_BAR}> has no <${EXPORT_BUTTON}>`,
            buttonOutsideActionBar: `<${EXPORT_BUTTON}> must be placed inside <${ACTION_BAR}>`,
            missingInput: `<${EXPORT_BUTTON}> requires [{{input}}]`,
        },
    },

    create(context) {
        const filename = context.filename ?? context.getFilename();
        const fileId = path.basename(filename).replace(/(\.component)?\.html$/, "");
        const text = (context.sourceCode ?? context.getSourceCode()).text;

        // Template-wide view, so multiple grids in one file get unique, non-colliding refs
        const gridOffsets = [...text.matchAll(DATAGRID_START_PATTERN)].map((m) => m.index);
        const usedRefs = new Set([...text.matchAll(TEMPLATE_REF_PATTERN)].map((m) => m[1]));
        const isMultiGrid = gridOffsets.length > 1;

        const insertAt = (offset, text) => (fixer) => fixer.insertTextAfterRange([offset, offset], text);

        const allocateRef = (datagrid) => {
            if (!isMultiGrid) {
                return DATAGRID_REF;
            }
            let index = gridOffsets.indexOf(datagrid.startSourceSpan.start.offset) + 1;
            while (usedRefs.has(`${DATAGRID_REF}${index}`)) {
                index++;
            }
            const ref = `${DATAGRID_REF}${index}`;
            usedRefs.add(ref);
            return ref;
        };

        const checkTemplateRef = (datagrid) => {
            const existingRef = datagrid.references?.[0];
            const ref = existingRef?.name ?? allocateRef(datagrid);
            const names = {
                ref,
                refProperty: `${ref}Ref`,
                id: isMultiGrid ? `${fileId}-${ref}` : fileId,
                backend: isServerDriven(datagrid),
            };

            if (!existingRef) {
                context.report({
                    node: datagrid,
                    messageId: "missingTemplateRef",
                    data: {ref, refProperty: names.refProperty},
                    fix: insertAt(afterTagName(datagrid), ` #${ref}`),
                });
            }
            return names;
        };

        const checkExportButton = (datagrid, actionBar, names) => {
            const button = findElement(actionBar, EXPORT_BUTTON);

            if (!button) {
                const misplacedButton = findElement(datagrid, EXPORT_BUTTON);
                context.report(misplacedButton
                    ? {node: misplacedButton, messageId: "buttonOutsideActionBar"}
                    : {
                        node: actionBar,
                        messageId: "missingExport",
                        fix: insertAt(afterStartTag(actionBar), asInsertion(exportButtonLines(names), childIndent(actionBar))),
                    });
                return;
            }

            REQUIRED_INPUTS
                .filter((input) => !hasInput(button, input))
                .forEach((input) => context.report({node: button, messageId: "missingInput", data: {input}}));
        };

        const checkActionBar = (datagrid, names) => {
            const actionBar = findElement(datagrid, ACTION_BAR);

            if (!actionBar) {
                context.report({
                    node: datagrid,
                    messageId: "missingActionBar",
                    fix: insertAt(afterStartTag(datagrid), asInsertion(actionBarLines(names), childIndent(datagrid))),
                });
                return;
            }

            if (!hasInput(actionBar, "data-testid")) {
                context.report({
                    node: actionBar,
                    messageId: "missingActionBarTestId",
                    fix: insertAt(afterTagName(actionBar), ` data-testid="${ACTION_BAR}-${names.id}"`),
                });
            }

            checkExportButton(datagrid, actionBar, names);
        };

        return {
            [`Element[name="${DATAGRID}"]`](datagrid) {
                const names = checkTemplateRef(datagrid);
                checkActionBar(datagrid, names);
            },
        };
    },
};