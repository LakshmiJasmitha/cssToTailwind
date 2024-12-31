import { log } from 'console';
import * as fs from 'fs';
// import * as postcss from 'postcss';
// import tailwindcss from 'tailwindcss';
let postcss = require('postcss')
const tailwindcss = require('tailwindcss');

const cssFilePath = './src/output.css'; // Make sure this path is correct
const outputFilePath = './src/class-mapping.json'; // Path for output JSON

async function generateClassMapping() {
    try {
        // Read the CSS file
        const css = fs.readFileSync(cssFilePath, 'utf8');

        // Process the CSS with PostCSS and Tailwind CSS

        const result = await postcss([tailwindcss]).process(css, { from: undefined }).then((result: any) => {
            // console.log('Debug point 1');
            return result
        })

        // Extract class-to-property mapping
        const classMapping: { [key: string]: string[] } = {};

        // console.log('Debug point 2');
        // console.log(Object.keys(result.root.rule[1]));

        result.root.walkRules((rule: any) => {
            if (rule.selector.startsWith('.')) {
                const className = rule.selector.slice(1); // Remove the leading dot
                // console.log('className --> ', className);
                classMapping[className] = transformCSSRule(rule.toString());
            }
        });

        console.log('classMapping --> ', classMapping);

        //Sorting the file - 

        const sortedArray = Object.entries(classMapping).sort((a, b) => {
			return b[1].length - a[1].length;
		});
		// Convert the sorted array back into an object
		const sortedObject = Object.fromEntries(sortedArray);
		console.log('sorted')
		console.log(Object.keys(sortedObject)[1]);

        // Write the mapping to a JSON file
        fs.writeFileSync(outputFilePath, JSON.stringify(sortedObject, null, 2));
        console.log(`Class mapping has been written to ${outputFilePath}`);
    } catch (error) {
        console.error('Error generating class mapping:', error);
    }
}

function transformCSSRule(cssRuleString: string): string[] {
    // Clean up the CSS rule string
    const cleanedCss = cssRuleString.trim().replace(/\s+/g, ' ');

    // Use a regular expression without the `s` flag
    const selectorMatch = cleanedCss.match(/(.+?)\s*\{([^}]*)\}/);

    if (!selectorMatch) return [];

    const propertiesString: string = selectorMatch[2].trim();

    // Split properties into an array and remove extra spaces
    return propertiesString.split(';')
        .filter(property => property.trim() !== '')
        .map(property => property.trim() + ';');
}


// Run the function
generateClassMapping();
