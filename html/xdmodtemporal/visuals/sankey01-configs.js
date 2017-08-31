

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
                "attr": "PublicationTitle",
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
                'ResourceUnitsUsed':'Resource Units Used',
                'GrantSource':'Funding',
                'GrantID':'Grant ID',
                'GrantSize':'Grant Size',
                'Discipline':'Scientific Disciplines'
            }
        },
        "other": {
            "categories": [
                'ResourceID',
                'GrantSource',
                'Discipline'
                ],
            "allcategories": [
                'GrantSize',
                'ResourceID',
                'PubID',
                'GrantSource',
                'GrantID',
                'ResourceUnitsUsed',
                'AuthorID',
                'PublicationTitle',
                'Date',
                'PublicationJournal'
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
