# Expected Data Format

### Description
* The visualization uses flat nodes and edges. 
* Edges must contain a source and target. Preferabbly a numeric sizing value as well, but this can be created from the number of node-node interations. 

### Data Format 
```javascript
"nodes": {[
	"key": "[string, number, boolean]",
	...
]}, "edges": {[
	"key": "[string, number, boolean]",
	...

]}

```

### Config Format
```javascript
"nodes": {
	"styleEncoding": {
		"size": {
			"attr": "[string]",
			"range": "[array]",
			"scale": "[linear, log]"
		},
		"color": {
			"attr": "",
			"range": ["[string]"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale. 
		}
	},
	"identifier": {
		"attr": "[string]" //Unique identifier
	},
	prettyMap: {
		"attr": "[string]"
	}
},
"edges": {
	"filterAttr": "", //Deprecated?
	"styleEncoding": {
		"strokeWidth": {
			"attr": "[string]",
			"range": "[array]"
		},
		"opacity": {
			"attr": "[string]",
			"range": "[array]"
		},
		"color": {
			"attr": "[string]",
			"range": ["[string]"]
		}
	},
	"identifier": {
		"attr": "[string]" //Unique identifier
	},
	prettyMap: {
		"attr": "[string]"
	}
},
//TODO: This doesn't follow
"labels": {
	"styleEncoding": {
		"attr": "[string]",
		"range": "[array]",
		"displayTolerance": "[number]"
	},
	"identifier": {
		"attr": "[array]" //Unique identifier
	}
},
"visualization": { //optional
	"forceLayout": {
		"linkStrength": "[number]",
		"friction": "[number]",
		"linkDistance": "[number]",
		"charge": "[number]",
		"chargeDistance": "[number]",
		"gravity": "[number]",
		"theta": "[number]",
		"alpha": "[number]"
	}
}
```

