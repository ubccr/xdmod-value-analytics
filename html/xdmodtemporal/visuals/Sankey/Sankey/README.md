# Expected data format

### Description
* The visualization plugin handles most of the data aggregation since it is a fairly simple and standard procedure. 
* **Note:** The Sankey plugin uses strings as identifiers and selectors. This causes a few issues. One being that node values **cannot** be duplicated across multiple columns. This can be worked around by adding characters to each attribute of a data object. The other issue is that jQuery selectors are used to identify nodes. For this reason, all characters that are not valid in a jQuery selector will cause interactivity issues. 

### Data Format 
```javascript
{
	"records": [{
		"key": "[string, number, boolean]",
		...
	}]
}

```

### Config Format 
```javascript
{
	"records": {
		"styleEncoding": {
			"size": {
				"attr": "[string]",
				"value": "[number]"
			},
		},
		"identifier": {
			"attr": "[string]"
		}
	},
	"labels": {
		"styleEncoding": {
			"attr": "[string]",
			"displayTolerance": "[number]"
		},
		"identifier": {
			"attr": "[string]"
		},
		"prettyMap": {
			"key": "[string]"
			...
		}
	},
	"other": {
		"categories": ["[string]"]
	}
}

```
