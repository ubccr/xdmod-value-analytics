

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
              'ResourceUnits':'Resource Units Used',
              'GrantSource':'Funding Type',
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
            'ResourceUnits',
            'AuthorID',
            'PublicationTitle',
            'Date',
            'PublicationJournal'
            ]
          }
        }
        dataprep.sankey01 = function(ntwrk) {

         str = JSON.stringify(ntwrk.filteredData.publication_numbers_discipline);
         str = str.replace("Electrical Engineering & Computer Science", "EE & Computer Science");
         ntwrk.filteredData.publication_numbers_discipline = JSON.parse(str);

         ntwrk.filteredData.records.data.forEach(function(d, i) {
          if(d.Discipline=="Electrical Engineering & Computer Science")
            d.Discipline = "EE & Computer Science";

           Object.keys(d).forEach(function(d1, i1) {
             d[d1] = d[d1].toString();

             if (d[d1].indexOf("Unknown") > -1) {
              console.log("ding")
              delete d
            }
          })
         })

         //It Resource remapping to more readily-accessible object
         ntwrk.resource_map = {};
         ntwrk.filteredData.resource_type_map.forEach(function(d,i){
          ntwrk.resource_map[d.ResourceID] = d.ResourceType;
        })

         //double-nesting data based on GrantSource and GrantIDs to count unique grants
         ntwrk.nestedFunding = d3.nest()
         .key(function(d) { return d.GrantSource; })
         .key(function(d) { return d.GrantID; })
         .entries(ntwrk.filteredData.records.data);
         ntwrk.totalGrants = 0;  
         ntwrk.uniqueGrants = {};
         ntwrk.nestedFunding.forEach(function(d,i){
          ntwrk.uniqueGrants[d.key] = d.values.length;
          ntwrk.totalGrants+= ntwrk.uniqueGrants[d.key];

        })

       }
