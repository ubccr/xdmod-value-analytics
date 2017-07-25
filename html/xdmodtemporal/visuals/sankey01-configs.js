

configs.sankey01 = {
    "type": "org.cishell.json.vis.metadata",
    //This is "nodes" instead of "records" because the parent is a ntwrk.
    "nodes": {
        "styleEncoding": {
            "size": {
                "attr": "GrantSize",
                "value": 25
            },

            "color": {
                "attr": "PubID",
                "range": ["#dfebf7 ","#023958"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale.
            }
        },
            "identifier": {
                "attr": "ResourceID"
            }
        },
        "labels": {
            "styleEncoding": {
                "attr": "label",
                "displayTolerance": 0
            },
            "identifier": {
                "attr": "GrantID"
            },
            "prettyMap": { 
                'ResourceID':'IT Resources',
                'ResourceUnitsUsed':'ResourceUnitsUsed',
                'GrantSource':'Funding',
                'GrantID':'GrantID',
                'GrantSize':'GrantSize',
                'PubID':'Publications'
            }
        },
        "other": {
            "categories": [
            'ResourceID',
            'GrantSource',
            'PubID', // 'GrantID', // 'PubID',
            
            ],
            "allcategories": [
            'GrantSource',
            'GrantID',
            'PubID',
            'ResourceID'
            ]
        }
    }
    dataprep.sankey01 = function(ntwrk) {
       ntwrk.filteredData.records.data.forEach(function(d, i) {
           Object.keys(d).forEach(function(d1, i1) {
               d[d1] = d[d1].toString();
               if (d[d1].indexOf("Unknown") > -1) {
                  console.log("ding")
                  delete d
              }
          })
       })
   }
