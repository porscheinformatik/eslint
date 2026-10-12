/**
 * @fileoverview Enforces an export button directly above every <clr-datagrid>
 * @author Porsche Informatik
 */
"use strict";

const path = require("path");

const DATAGRID = "clr-datagrid";
const DATAGRID_REF = "datagrid";
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

const isBlankText = (node) => typeof node.value === "string" && node.value.trim() === "";

// Closest sibling before the given index, ignoring whitespace-only text
const previousSibling = (siblings, index) =>
    siblings.slice(0, index).reverse().find((node) => !isBlankText(node));

// The export button itself, or one wrapped in @if / *ngIf
const exportButtonIn = (node) =>
    node && (node.name === EXPORT_BUTTON ? node : findElement(node, EXPORT_BUTTON));

const hasInput = (element, name) =>
    element.attributes.some((a) => a.name === name) ||
    (element.inputs ?? []).some((i) => i.name === name);

// Server-driven grids only hold the current page, so they need a backend export
const isServerDriven = (datagrid) =>
    (datagrid.outputs ?? []).some((o) => o.name === "clrDgRefresh");

const afterTagName = (element) => element.startSourceSpan.start.offset + 1 + element.name.length;

//------------------------------------------------------------------------------
// Generated markup
//------------------------------------------------------------------------------

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

// Inserted right above the datagrid
const asLeadingInsertion = (lines, element) => {
    const prefix = " ".repeat(element.startSourceSpan.start.col);
    return `${lines.join(`\n${prefix}`)}\n${prefix}`;
};

//------------------------------------------------------------------------------
// Rule
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforces an export button directly above every <clr-datagrid>",
        },
        fixable: "code",
        schema: [],
        messages: {
            missingTemplateRef:
                "Datagrid needs a template reference. Add #{{ref}} and in the component: " +
                "@ViewChild('{{ref}}', {read: ElementRef}) {{refProperty}}: ElementRef",
            missingExport: `Datagrid has no <${EXPORT_BUTTON}> directly above it`,
            exportInsideDatagrid: `<${EXPORT_BUTTON}> must be placed directly above the <${DATAGRID}>, not inside it`,
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

        const insertAt = (offset, content) => (fixer) => fixer.insertTextAfterRange([offset, offset], content);

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

        const checkExportButton = (datagrid, sibling, names) => {
            const button = exportButtonIn(sibling);

            if (!button) {
                const misplacedButton = findElement(datagrid, EXPORT_BUTTON);
                if (misplacedButton) {
                    context.report({node: misplacedButton, messageId: "exportInsideDatagrid"});
                    return;
                }
                context.report({
                    node: datagrid,
                    messageId: "missingExport",
                    fix: insertAt(datagrid.startSourceSpan.start.offset, asLeadingInsertion(exportButtonLines(names), datagrid)),
                });
                return;
            }

            REQUIRED_INPUTS
                .filter((input) => !hasInput(button, input))
                .forEach((input) => context.report({node: button, messageId: "missingInput", data: {input}}));
        };

        // Walks sibling lists, since a grid's export button is its preceding sibling
        const visit = (siblings) => siblings.forEach((node, index) => {
            if (node.name === DATAGRID) {
                const names = checkTemplateRef(node);
                checkExportButton(node, previousSibling(siblings, index), names);
            }
            visit(childrenOf(node));
        });

        return {
            Program: (program) => visit(program.templateNodes ?? []),
        };
    },
};