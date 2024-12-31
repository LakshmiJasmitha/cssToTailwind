"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// import * as postcss from 'postcss';
// import tailwindcss from 'tailwindcss';
var postcss = require('postcss');
var tailwindcss = require('tailwindcss');
var cssFilePath = './src/output.css'; // Make sure this path is correct
var outputFilePath = './src/class-mapping.json'; // Path for output JSON
function generateClassMapping() {
    return __awaiter(this, void 0, void 0, function () {
        var css, result, classMapping_1, sortedArray, sortedObject, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    css = fs.readFileSync(cssFilePath, 'utf8');
                    return [4 /*yield*/, postcss([tailwindcss]).process(css, { from: undefined }).then(function (result) {
                            // console.log('Debug point 1');
                            return result;
                        })
                        // Extract class-to-property mapping
                    ];
                case 1:
                    result = _a.sent();
                    classMapping_1 = {};
                    // console.log('Debug point 2');
                    // console.log(Object.keys(result.root.rule[1]));
                    result.root.walkRules(function (rule) {
                        if (rule.selector.startsWith('.')) {
                            var className = rule.selector.slice(1); // Remove the leading dot
                            // console.log('className --> ', className);
                            classMapping_1[className] = transformCSSRule(rule.toString());
                        }
                    });
                    console.log('classMapping --> ', classMapping_1);
                    sortedArray = Object.entries(classMapping_1).sort(function (a, b) {
                        return b[1].length - a[1].length;
                    });
                    sortedObject = Object.fromEntries(sortedArray);
                    console.log('sorted');
                    console.log(Object.keys(sortedObject)[1]);
                    // Write the mapping to a JSON file
                    fs.writeFileSync(outputFilePath, JSON.stringify(sortedObject, null, 2));
                    console.log("Class mapping has been written to ".concat(outputFilePath));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error generating class mapping:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function transformCSSRule(cssRuleString) {
    // Clean up the CSS rule string
    var cleanedCss = cssRuleString.trim().replace(/\s+/g, ' ');
    // Use a regular expression without the `s` flag
    var selectorMatch = cleanedCss.match(/(.+?)\s*\{([^}]*)\}/);
    if (!selectorMatch)
        return [];
    var propertiesString = selectorMatch[2].trim();
    // Split properties into an array and remove extra spaces
    return propertiesString.split(';')
        .filter(function (property) { return property.trim() !== ''; })
        .map(function (property) { return property.trim() + ';'; });
}
// Run the function
generateClassMapping();
