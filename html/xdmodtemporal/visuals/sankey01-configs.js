

configs.sankey01 = {
    "type": "org.cishell.json.vis.metadata",
    //This is "nodes" instead of "records" because the parent is a ntwrk.
    "nodes": {
        "styleEncoding": {
            "size": {
                "attr": "GrantSize",
                "value": 25
            },        },
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
                'ResourceID':'ResourceID',
                'ResourceUnitsUsed':'ResourceUnitsUsed',
                'GrantSource':'GrantSource',
                'GrantID':'GrantID',
                'GrantSize':'GrantSize',
                'PubID':'PubID'
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

   function dropdownfunc(){
    //ALL THE MAGIC, FFS!
    var itemd1 = document.getElementById("Dropdown1")
    var itemd1value = itemd1.options[itemd1.selectedIndex].value;
    var itemd2 = document.getElementById("Dropdown2")
    var itemd2value = itemd2.options[itemd2.selectedIndex].value;
    var itemd3 = document.getElementById("Dropdown3")
    var itemd3value = itemd3.options[itemd3.selectedIndex].value;
    cat1 = itemd1value
    cat2 = itemd2value
    cat3 = itemd3value
    configs.sankey01.other.categories = [cat1,cat2,cat3] 
    sankey01.ResetVis();
}
    // var itemd1 = document.getElementById("Dropdown1")
    // var itemd1value = itemd1.options[itemd1.selectedIndex].value;
    // var itemd2 = document.getElementById("Dropdown2")
    // var itemd2value = itemd2.options[itemd2.selectedIndex].value;
    // var itemd3 = document.getElementById("Dropdown3")
    // var itemd3value = itemd3.options[itemd3.selectedIndex].value;
    // var itemd4 = document.getElementById("Dropdown4")
    // var itemd4value = itemd4.options[itemd4.selectedIndex].value;
    // var itemd5 = document.getElementById("Dropdown5")
    // var itemd5value = itemd5.options[itemd5.selectedIndex].value;
    // var catarray = [itemd1value,itemd2value,itemd3value,itemd4value,itemd5value]
    // // console.log(catarray,inputdata)

    // count=0
    // resultarray = []
    // // console.log(clickstick,clickstick.length)

    // // check for an empty selection
    // emptyflag = 0
    // if (clickstick.length == 1){
    //     emptyitem = clickstick[0];
    //     for(j=0;j<emptyitem.length;j++){
    //         if(emptyitem[j]!=''){
    //             emptyflag = 1;
    //         }
    //     }
    // }
    // else {
    //     emptyflag = 1
    // }

    // // console.log('eflag:',emptyflag)

    // if(emptyflag == 1 && clickstick.length != 0){

    //     for(i=0;i<clickstick.length;i++){
    //         // save the item to be compared
    //         item = clickstick[i];
    //         // compare all lines with hte saved item
    //         for(j=0;j<inputdata.length;j++){
    //             flag = 0
    //             // compare every items with the line
    //             for(curitem=0;curitem<item.length;curitem++){
    //                 if(item[curitem]!=""){
    //                     if(item[curitem].trim() != inputdata[j][catarray[curitem]].trim()){
    //                         flag = 1
    //                     }
    //                 }
    //             }
    //             if(flag==0){
    //                 count = count+1
    //                 resultarray.push(inputdata[j])
    //             }
    //         }
    //     }
    //     // console.log("count is:",count)
    //     // console.log(resultarray)

    //     // To prepare the csv file from the object array
    //     coldel = ','
    //     linedel = '\n'
    //     // var keys = Object.keys(resultarray[0])
    //     keys = configs.sankey01.other.allcategories
    //     if(keys[0]!='Code'){
    //         keys.unshift('Code')
    //     }
    //     // console.log(resultarray,resultarray[0],keys)
    //     resultfile = '';
    //     resultfile +=keys.join(coldel)
    //     resultfile += linedel

    //     totaledges = 0
    //     resultarray.forEach(function(item){
    //         totaledges = totaledges+1
    //         counter = 0;
    //         keys.forEach(function(key){
    //             if(counter>0) resultfile += coldel;
    //             if (configs.sankey01.labels.prettyMap[item[key].trim().replaceAll('_',"")]) {
    //                 resultfile+= configs.sankey01.labels.prettyMap[item[key].trim().replaceAll('_',"")];
    //             }
    //             else{
    //                 resultfile+= item[key].trim().replaceAll('_',"");
    //             }
    //             counter++;
    //         });
    //         resultfile += linedel;
    //     });
    //     // console.log(totaledges)

    //     // Generate the csv file
    //     csvfile = resultfile
    //     filename = 'export.csv';
    //     csvfile = 'data:text/csv;charset=utf-8,' + csvfile;

    //     data = encodeURI(csvfile);

    //     link = document.createElement('a');
    //     link.setAttribute('href', data);
    //     link.setAttribute('download', filename);
    //     link.click();
    // }
    function exportbtnfunc(){
    //ALL THE MAGIC, FFS!
    var itemd1 = document.getElementById("Dropdown1")
    var itemd1value = itemd1.options[itemd1.selectedIndex].value;
    var itemd2 = document.getElementById("Dropdown2")
    var itemd2value = itemd2.options[itemd2.selectedIndex].value;
    var itemd3 = document.getElementById("Dropdown3")
    var itemd3value = itemd3.options[itemd3.selectedIndex].value;
    var catarray = [itemd1value,itemd2value,itemd3value] 


    count=0
    resultarray = []


    // check for an empty selection
    emptyflag = 0
    if (clickstick.length == 1){
        emptyitem = clickstick[0];
        for(j=0;j<emptyitem.length;j++){
            if(emptyitem[j]!=''){
                emptyflag = 1;
            }
        }
    }
    else {
        emptyflag = 1
    }

    newdata = inputdata
    newdata.forEach(function(d,i){
        d['selected'] = '0'
    })


    if(emptyflag == 1 && clickstick.length != 0){

        for(i=0;i<clickstick.length;i++){
            // save the item to be compared
            item = clickstick[i];
            // compare all lines with the saved item
            for(j=0;j<inputdata.length;j++){
                flag = 0;
                // compare every items with the line
                for(curitem=0;curitem<item.length;curitem++){
                    if(item[curitem]!=""){
                        if(item[curitem].trim() != inputdata[j][catarray[curitem]].trim()){
                            flag = 1;
                        }
                    }
                }
                if(flag==0){
                    count = count+1;
                    newdata[j]['selected'] = '1';
                }
            }
        }



        // To prepare the csv file from the object array
        coldel = ','
        linedel = '\n'
        keys = Object.keys(newdata[0])

        if(keys[0]!='Code'){
            keys.unshift('Code')
        }
        keys.shift()

        resultfile = '';
        resultfile +=keys.join(coldel)
        resultfile += linedel

        totaledges = 0

        newdata.forEach(function(item){
            totaledges = totaledges+1
            counter = 0;
            keys.forEach(function(key){
                if(counter>0) resultfile += coldel;

                if (configs.sankey01.labels.prettyMap[item[key].trim().replaceAll('_',"")]) {
                    resultfile+= configs.sankey01.labels.prettyMap[item[key].trim().replaceAll('_',"")];
                }
                else{
                    resultfile+= item[key].trim().replaceAll('_',"");
                }
                counter++;
            });
            resultfile += linedel;
        });
        
        
        // Generate the csv file
        csvfile = resultfile
        filename = 'export.csv';
        csvfile = 'data:text/csv;charset=utf-8,' + csvfile;
        
        data = encodeURI(csvfile);
        
        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
    else {
        console.log("No edges selected");
    }
}