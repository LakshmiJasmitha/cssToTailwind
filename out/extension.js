"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const class_mapping_json_1 = __importDefault(require("./class-mapping.json"));
let cssToTailwindMapper = class_mapping_json_1.default;
function activate(context) {
    console.log('Extension "semicolon-blame" is now active!');
    // Resolve the path to the CSS file
    const cssPath = path.join(context.extensionPath, 'src', 'style.css');
    // Read the file content
    fs.readFile(cssPath, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showErrorMessage('Failed to read CSS file');
            // console.error('Error reading CSS file:', err);
            return;
        }
        // Print the file content to the console
        // console.log('CSS File Content:\n', data);
    });
    const blameDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0 0 1em',
            color: '#888',
            fontStyle: 'italic'
        }
    });
    const updateBlameDecorations = (editor) => {
        if (!editor) {
            return;
        }
        const document = editor.document;
        const decorations = [];
        const content = document.getText();
        // console.log('Document');
        // console.log(content);
        const output = findMatchingProperties(content, cssToTailwindMapper);
        // console.log(output);
        for (let line = 0; line < document.lineCount; line++) {
            const textLine = document.lineAt(line);
            const text = textLine.text;
            const semicolonIndex = text.indexOf(';');
            if (semicolonIndex !== -1) {
                // Extract the CSS property being used
                const [cssProperty, cssValue] = extractCssPropertyAndValue(text);
                if (cssProperty && cssValue) {
                    const tailwindClass = findKeyForProperty(text);
                    const blameMessage = `${tailwindClass ? `${tailwindClass}` : ''}`;
                    const markdownString = new vscode.MarkdownString();
                    markdownString.supportHtml = true;
                    markdownString.appendMarkdown('Replace `' + text + '` with `' + tailwindClass + '` in your html element reference.');
                    markdownString.appendText('\n');
                    markdownString.appendText('Example - <span class="' + tailwindClass + '">');
                    markdownString.appendMarkdown('<hr>');
                    markdownString.appendText('\n');
                    markdownString.appendMarkdown('[Tailwind Reference](https://tailwindcss.com/docs/installation)');
                    const decoration = {
                        range: new vscode.Range(line, semicolonIndex + 1, line, semicolonIndex + 1),
                        renderOptions: {
                            after: {
                                contentText: blameMessage
                            }
                        },
                        hoverMessage: markdownString,
                    };
                    decorations.push(decoration);
                }
            }
        }
        // console.log('Document Properties');
        // console.log(extractCssProperties(content));
        const cssEntries = extractCssProperties(content);
        Object.entries(cssEntries).forEach(([key, properties]) => {
            const str = findMatchingKey(properties.data);
            const strArray = str.split(" ");
            console.log('---------- find macthing key ------------', strArray);
            let elementStr = {};
            strArray.forEach((item) => {
                cssToTailwindMapper[item] ? elementStr[item] = cssToTailwindMapper[item].join(' ') : elementStr;
                // console.log('item --> ', item);
                // console.log('cssToTailwindMapper[item] --> ', cssToTailwindMapper[item]);
            });
            console.log('elementStr --> ', elementStr);
            const markdownString = new vscode.MarkdownString();
            markdownString.supportHtml = true;
            markdownString.appendMarkdown('Replace this class with `' + str + '` in your html element reference. \n');
            markdownString.appendText('The tailwind classes are as given below - \n ');
            markdownString.appendText(JSON.stringify(elementStr, null, 4));
            markdownString.appendText('\n');
            markdownString.appendText('Example - <span class="' + str + '">');
            markdownString.appendText('\n');
            markdownString.appendMarkdown('[Tailwind Reference](https://tailwindcss.com/docs/installation)');
            const decoration = {
                range: new vscode.Range(properties.line_number - 1, key.length + 5, properties.line_number - 1, key.length + 5),
                renderOptions: {
                    after: {
                        contentText: str
                    }
                },
                hoverMessage: markdownString,
            };
            decorations.push(decoration);
            console.log('decorations --> ', decoration);
        });
        editor.setDecorations(blameDecorationType, decorations);
    };
    function findMatchingKey(array) {
        // sort the class-mapping json based on array length
        // loop through json mapping
        // if all elements of the main_array is present in second array,
        // return concat(string) + remove the matched elements and call findMatchingKey with the new set of elements
        // else 
        // if none are matching return empty string
        let keys = Object.keys(cssToTailwindMapper);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if (checkForMatch(cssToTailwindMapper[key], array)) {
                return key + ' ' + findMatchingKey(lodash_1.default.pullAll(array, cssToTailwindMapper[key]));
            }
        }
        console.log(' Returned String ', array);
        return '';
    }
    function checkForMatch(cssArray, userArray) {
        for (let i = 0; i < cssArray.length; i++) {
            if (!(userArray.includes(cssArray[i]))) {
                return false;
            }
        }
        console.log("match found", cssArray, userArray);
        return true;
    }
    function extractCssProperties(cssText) {
        // Regular expression to match CSS rules
        const ruleRegex = /\.([^ \{]+)\s*\{([^}]*)\}/g;
        const result = {};
        let match;
        // Split the CSS text into lines to track line numbers
        const lines = cssText.split('\n');
        // Iterate over each match
        while ((match = ruleRegex.exec(cssText)) !== null) {
            const selector = `.${match[1].trim()}`; // Extract selector
            const properties = match[2].trim(); // Extract properties
            const propertiesArray = properties
                .split(';')
                .map(prop => prop.trim() + ';')
                .filter(prop => prop !== ';'); // Remove empty strings
            // Find the line number where the selector starts
            const selectorStartIndex = cssText.indexOf(match[0]);
            const line_number = cssText.slice(0, selectorStartIndex).split('\n').length;
            // Add to result object
            result[selector] = {
                data: propertiesArray,
                line_number: line_number
            };
        }
        return result;
    }
    // Function to extract the CSS property and value
    const extractCssPropertyAndValue = (text) => {
        // Match the pattern for a CSS property and value
        const match = text.match(/([a-zA-Z-]+)\s*:\s*([^;]+)/);
        return match ? [match[1], match[2]] : ['', ''];
    };
    function findKeyForProperty(property) {
        // Remove leading and trailing spaces and add a semicolon if not present
        property = property.trim();
        if (!property.endsWith(';')) {
            property += ';';
        }
        // Iterate through the JSON object
        for (const [key, values] of Object.entries(cssToTailwindMapper)) {
            if (values.length == 1 && values.includes(property)) {
                return key;
            }
        }
        return null;
    }
    function findMatchingProperties(cssText, mappingJson) {
        const lines = cssText.split('\n');
        const results = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // console.log('line -> ', line);
            for (const key in mappingJson) {
                const properties = mappingJson[key];
                const matchingProperties = [];
                for (const prop of properties) {
                    if (lines.some((line) => line.trim() === prop)) {
                        matchingProperties.push(prop);
                    }
                }
                if (matchingProperties.length === properties.length) {
                    results.push({
                        line: i + 1,
                        property: key,
                        fullLine: matchingProperties
                    });
                    break;
                }
            }
        }
        return results;
    }
    // Apply decorations when the editor is opened or text changes
    vscode.window.onDidChangeActiveTextEditor(editor => updateBlameDecorations(editor), null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(event => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            updateBlameDecorations(activeEditor);
        }
    }, null, context.subscriptions);
    // Initial run
    if (vscode.window.activeTextEditor) {
        updateBlameDecorations(vscode.window.activeTextEditor);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map