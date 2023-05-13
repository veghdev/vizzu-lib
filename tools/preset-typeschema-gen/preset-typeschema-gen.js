const fs = require('fs');
const YAML = require('yaml');

function capitalize(str)
{
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function collectUniqueValues(obj)
{
	let values = [];
	for (let key in obj)
	{
		let value = obj[key].set;
		if (typeof value === "string")
		{
			values.push(value);
		}
		else if (Array.isArray(value))
		{
			values = values.concat(value);
		}
	}
	return [...new Set(values)];
}

function genPreset(preset)
{
	let properties = collectUniqueValues(preset.channels);

	let definition = {
		type: 'object',
		"$extends": "Preset",
		properties: {}
	}

	for (let i = 0; i < properties.length; i++)
	{
		let propertyName = properties[i];
		definition.properties[propertyName] = {
			oneOf: [
				{ type: 'array', items: { type: 'string' } },
				{ type: 'string' }
			]
		};
		definition.required = definition.required || [];
		definition.required.push(propertyName);
	}

	return definition;
}

function genPresetClass(presets)
{
	let definition = {
		type: 'object',
		description: 'Collection of factory functions for creating preset chart configs.',
		properties: {}
	};
	for (let name in presets)
	{
		let methodName = name;
		let parameterType = capitalize(name);
		definition.properties[methodName] = {
			type: 'function',
			arguments: {
				config: {
					"$ref": parameterType
				}
			},
			return: {
				"$ref": "config/Chart"
			},
			required: [ 'config' ]
		};
	}
	return definition;
}

function genSchema(presets)
{
	let schema = {
		definitions: {
			Preset: {
				type: 'object',
				properties: {
					legend: {
						type: 'string',
						enum: [ 'color', 'lightness', 'size' ],
						nullable: true
					},
					title: {
						type: 'string',
						nullable: true	
					},
					reverse: {
						type: 'boolean'
					},
					sort: {
						type: 'string',
						enum: [ 'none', 'byValue' ]
					}
				}
			}
		}
	};

	for (let presetName in presets)
	{
		schema.definitions[capitalize(presetName)] = genPreset(presets[presetName]);
	}
	schema.definitions.Presets = genPresetClass(presets);

	return schema;
}

function writeSchema(schema, outputPath)
{
	console.log("Writing to " + outputPath);

	let warningText = `
# This file is auto-generated by preset-typeschema-gen.js
# Do not edit this file directly.
# Instead, edit the presets in src/apps/weblib/js-api/presets.js
# and run tools/preset-typeschema-gen to regenerate this file.
`;

	let content = warningText + YAML.stringify(schema, null, 2);

	fs.writeFileSync(outputPath, content);
}

let presetPath = process.argv[2];
let outputPath = process.argv[3];

if (!presetPath) presetPath = '../../src/apps/weblib/js-api/presets.js';
if (!outputPath) outputPath = '../../src/apps/weblib/typeschema-api/presets.yaml';

import(presetPath)
.then(Presets => {
	let presets = new Presets.default()._presetConfigs;
	let schema = genSchema(presets);
	writeSchema(schema, outputPath);
}).catch(err => {
	console.error(err);
});
