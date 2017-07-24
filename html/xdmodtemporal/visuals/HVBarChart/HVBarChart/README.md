# Expected Data Format

### Description
* The visualization aggregates data based on the configuration and renders a stacked/non-stacked bar chart. A unique value may be provided if the user wishes to avoid using a stacked bar chart. 

### Data Format 
```javascript
"records": [{
	"keyone": "[string]",
	"keytwo": "[string]",
	"val": "[number]",
	...
}]

```

### Config Format
```javascript
 {
    "records": {
        "colAggregator": "[string]",
        "rowAggregator": "[string]"
    },
    "bars": {
    	"styleEncoding": {
    		"size": "[string]"
    	}
    },
    "labels": {
        "xAxis": "[string]",
        "yAxis": "[string]"
    }
}
```
