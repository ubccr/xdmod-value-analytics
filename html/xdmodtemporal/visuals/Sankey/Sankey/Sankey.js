head.js('visuals/Sankey/Sankey/sankey-plugin.js')
var stringSizeLimit  = 25;
Array.prototype.getUnique = function() {
    var u = {},
    a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {
        return a.indexOf(i) < 0;
    });
};

visualizationFunctions.Sankey = function(element, data, opts) {
    var context = this
    this.config = this.CreateBaseConfig();
    this.SVGBase = this.config.easySVG(element[0])
    .attr('background', 'white')
    .attr('class', 'canvas ' + opts.ngIdentifier)
    .style("overflow", "scroll")
    this.SVG = this.SVGBase.append("g")
    .attr('transform', 'translate(' + (this.config.margins.left) + ',' + ((this.config.margins.top) - 50) + ')')
    this.VisFunc = function() {
        if (!context.config.meta.labels.prettyMap) {
            context.config.meta.labels.prettyMap = {};
        }

        context.SVG.background = context.SVG.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white")
        .attr("opacity", .00000001)

        var defaultEdgeColor = "";

        var offsetW = 4;
        var offsetH = 300;
        var sankeyCategories = context.config.meta.other.categories
        var graph = formatData();
        var sankey = d3.sankey()
        .nodeWidth(context.config.meta.nodes.styleEncoding.size.value)
        .nodePadding(5)
        .size([context.config.dims.fixedWidth - offsetW, context.config.dims.fixedHeight - offsetH]);
        var path = sankey.link();
        sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(0);
        context.SVG.group = createVisGroup();
        context.SVG.edges = createEdges();
        context.SVG.nodes = createNodes();
        context.SVG.columnLabels = createColumnLabels();
        context.SVG.tooltips = createToolTips();


        applySVGEvents();
        function createColumnLabels() {
         context.SVG.columnLabels = context.SVG.group.append("g");
         context.config.meta.other.categories.forEach(function(d, i) {
            var currNode = context.SVG.selectAll(".col-" + i)[0][0];
            var currNodeData = d3.select(currNode).data()[0];
            var textNode = context.SVG.columnLabels.append("text")
            textNode.attr("class", "columnlabel l")
            .attr("x", function() {
                if (i == 0) {
                    return currNodeData.x
                }
                if (i == context.config.meta.other.categories.length - 1) {
                    return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value
                }
                return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value / 2
            })
            .attr("y", -30)
            .style("text-anchor", function() {
                if (i == 0) {
                    return "start";
                }
                if (i == context.config.meta.other.categories.length - 1) {
                    return "end";
                }
                return "middle";
            })
            .text(function() {
                if (context.config.meta.labels.prettyMap[d]) {
                    return context.config.meta.labels.prettyMap[d]
                }
                return d;
            })
            if(textNode.text()=="Funding"){
                textNode
                .append("tspan")
                .attr("x", function() {
                    if (i == 0) {
                        return currNodeData.x
                    }
                    if (i == context.config.meta.other.categories.length - 1) {
                        return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value
                    }
                    return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value / 2
                })
                .attr("y", -12)
                .text("Total Funding: "+Utilities.formatValue["currency"](context.filteredData.grant_total,'$'))
                .style("text-anchor","mid")
                .style("font-size",14)
            }

            if(textNode.text()=="IT Resources"){
                textNode
                .append("tspan")
                .attr("x", function() {
                    if (i == 0) {
                        return currNodeData.x
                    }
                    if (i == context.config.meta.other.categories.length - 1) {
                        return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value
                    }
                    return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value / 2
                })
                .attr("y", -12)

                .text("Total # Times Used: "+Utilities.formatValue["number"](context.filteredData.resource_users.total))

                .style("text-anchor","mid")
                .style("font-size",14)
            }

            if(textNode.text()=="Scientific Disciplines"){
                textNode
                .append("tspan")
                .attr("x", function() {
                    if (i == 0) {
                        return currNodeData.x
                    }
                    if (i == context.config.meta.other.categories.length - 1) {
                        return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value
                    }
                    return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value / 2
                })
                .attr("y", -12)

                .text("Total Publications: "+context.filteredData.publication_disciplines.total)

                .style("text-anchor","mid")
                .style("font-size",14)
            }    
        })


         return d3.selectAll(".columnlabel")
     }



     function applySVGEvents() {

        function customEdgeFilter(node, edge){
            switch(node.i){
                case 0: if(node.name == edge.uid.split("|")[1])
                return edge; 
                else break;    
                case 1: if(node.name == edge.uid.split("|")[2])
                return edge;
                else break;     
                case 2: if((node.name.indexOf(edge.uid.split("|")[3]))!=-1)
                return edge;
                else break;   

            }
        } 

        function customNodeFilter(node, edge){
            switch(node.i){
                case 0: if(node.name == edge.uid.split("|")[1])
                return node; 
                else break;    
                case 1: if(node.name == edge.uid.split("|")[2])
                return node;
                else break;     
                case 2: if((node.name.indexOf(edge.uid.split("|")[3]))!=-1)
                return node;
                else break;   

            }
        } 
        context.SVG.nodes.selectAll("rect")

        .on("mouseout", function(d, i) {

            context.SVG.nodes.selectAll("rect").filter(function(d7,i7){
                if(d7.click==0)
                    return d7;
            }).classed("selected",false);
            context.SVG.edges.filter(function(d5){
               return customEdgeFilter(d,d5);
           }).each(function(d2, i2) {
            if (d2.click==0)
                d3.select(this).classed("selected", false).classed("deselected", false).style("stroke", defaultEdgeColor);

        });  
           context.SVG.edges.filter(function(d){
            if(d.click == 1)
            {
                d3.select(this).moveToFront();
                context.SVG.nodes.selectAll("rect").filter(function(d5){
                  return customEdgeFilter(d,d5);
              }).classed("selected",true);
            }
        }); 

       })
        .on("mouseover", function(d) {
            d.color = d3.select(this).style("fill");
            d3.select(this).classed("selected", true);
            context.SVG.edges.filter(function(d2){
             return customEdgeFilter(d,d2);
         }
         ).each(function(d1, i1) {
            if(d1.click == 0)
                {   d1.selected = true;
                    d3.select(this).style("stroke", d.color).classed("selected", true).moveToFront();
                    context.SVG.nodes.selectAll("rect").filter(function(d5){
                     return customNodeFilter(d5,d1);
                 }).classed("selected",true);
                }
            })

     })
        .on("click", function(d) {

            d.click=1;
            d.color = d3.select(this).style("fill");
            d3.select(this).classed("selected", true);

            context.SVG.edges.filter(function(d5){
                return customEdgeFilter(d,d5);
                
            }).each(function(d1, i1) {
                if (d1.click==0)
                    {   d1.click = 1;
                        d1.selected = true;
                        d3.select(this).style("stroke", d.color).classed("selected", true).moveToFront();
                        context.SVG.nodes.selectAll("rect").filter(function(d8){
                         return customNodeFilter(d8,d1);
                     }).classed("selected",true); 
                    }
                })


        })
        .on("dblclick", function(d) {

            d.click=0; 
            d3.select(this).classed("selected", false);
            context.SVG.edges.filter(function(d5){
                return customEdgeFilter(d,d5);
            }).each(function(d2) {

                if(d2.click==1)
                {
                    d2.click = 0;
                    d3.select(this).classed("selected", false).classed("deselected", false).style("stroke", defaultEdgeColor);
                    
                }

            }); 
            context.SVG.nodes.filter(function(d1){
                if ((d1.name != d.name) && (d1.click==1))
                    return d1;
            })
            .each(function(d2,i2){


             context.SVG.edges.filter(function(d5){
                return customEdgeFilter(d2,d5);
            }).each(function(d4) {
                if(d4.click==0)
                {
                    d4.click=1;
                    d3.select(this).style("stroke", d2.color).classed("selected", true).moveToFront();
                    context.SVG.nodes.selectAll("rect").filter(function(d9,i9){
                       return customNodeFilter(d9,d4);
                   }).classed("selected",true);                

                }
            });   
        })
            
        })


        context.SVG.edges
        .on("mouseover", function(d, i) {
            context.SVG.nodes.filter(function(d1){
                if(d1.click==0)
                    return d1;
            }).classed("selected", false);
            var color;
            var className;
            var clickedLocal=false;
            d3.select(this).data().forEach(function(d1, i1) {      

                className = d1.uid;

                if (d1.click != 0)
                    clickedLocal = true;
                else clickedLocal = false;

            })
            if (!clickedLocal)
            {
                context.SVG.edges.filter("[class*='" + className + "']").each(function(d2, i2) {

                    d2.selected = true;
                    var uidTokens = d2.uid.split("|");

                    context.SVG.nodes.selectAll("rect").filter(function(d4,i4){

                       if (d2.source.i == 0){
                         if(d4.name == uidTokens[1])
                         {
                            color = d3.select(this).style("fill");
                            return d4;
                        }
                    }
                    if (d2.source.i == 1){
                     if(d4.name == uidTokens[2])
                     {
                        color = d3.select(this).style("fill");
                        return d4;
                    }
                }


            })
                    .classed("selected",true)
                    context.SVG.nodes.selectAll("rect").filter(function(d8,i8){
                        if (d8.name.indexOf(uidTokens[3])!=-1)
                            return d8;
                    }).classed("selected",true);

                    d3.select(this).style("stroke", color).classed("selected", true).moveToFront();
                }) 
            }
        })
        .on("mouseout", function(d, i) {


           if(d.click==0)
           {
            context.SVG.edges.filter("[class*='" + d.uid + "']").each(function(d4,i4){
                d3.select(this).classed("selected", false).classed("deselected", false).style("stroke", defaultEdgeColor);
                context.SVG.nodes.selectAll("rect").filter(function(d9,i9){
                 return customNodeFilter(d9,d);
             }).classed("selected",false);  
            });

        }


        context.SVG.edges.filter(function(d1){
            if(d1.click == 1){
                d3.select(this).moveToFront();
                context.SVG.nodes.selectAll("rect").filter(function(d9,i9){
                 return customNodeFilter(d9,d1);
             }).classed("selected",true);
            }  
        });



    })


        context.SVG.background
        .on("dblclick", function() {
            context.SVG.edges.classed("selected", false).classed("deselected", false).style("stroke", defaultEdgeColor);

            context.SVG.nodes.selectAll("rect").classed("selected", false).classed("deselected", false)

            context.SVG.edges.each(function(d2,i2){
                d2.click=0;
            })

            context.SVG.nodes.selectAll("rect").each(function(d4,i4){
                d4.click=0;
            })
    //d3.event.stopPropagation();
})


    }

    function createEdges() {
        return context.SVG.group.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", function(d, i) {
            return "wvf-edge e" + " " + d.uid + " " + d.classList;
        })
        .property("uid", function(d, i) {
            return d.uid;
        })
        .attr("id", function(d, i) {
            d.id = i;
            return "link-" + i;
        })
        .attr("d", path)
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        });
        console.log()
    }



    function createNodes() {
        context.SVG.nodes = context.SVG.group.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", function(d, i) {
            return " " + d.name.replaceAll("|", "")+" col-" + d.i
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

        .call(d3.behavior.drag()
          .origin(function(d) { return d; })
          .on("drag", dragmove))
   // the function for moving the nodes
   function dragmove(d) {
    if (this.nextSibling) this.parentNode.appendChild(this);
    d3.select(this).attr("transform", 
        "translate(" + (
           d.x = Math.max(0, Math.min(context.config.dims.fixedWidth - offsetW - d.dx, d3.event.x))
           ) + "," + (
           d.y = Math.max(0, Math.min(context.config.dims.fixedHeight , d3.event.y))
           ) + ")");
// sankey.relayout();
context.SVG.edges.attr("d", path);


}

context.SVG.nodes.append("rect")
.attr("class", "wvf-node")
.attr("height", function(d) {
    return d.dy;
})
.attr("width", sankey.nodeWidth())

context.SVG.nodes.append("text")
.attr("x", -6)
.attr("y", function(d) {
    return d.dy / 2;
})
.attr("dy", ".35em")
.attr("text-anchor", "end")
.attr("transform", null)
.text(function(d) {
    var stats=""
    if(d.i == 0){
        name = d.name.replace(/\s/g, '').toUpperCase()
        switch(name)
        {
            case "BIGREDII":stats = context.filteredData.resource_users.BIGREDII;break;
            case "QUARRY": stats = context.filteredData.resource_users.QUARRY;break;
            case "MASON":stats = context.filteredData.resource_users.MASON;break;
            case "KARST":stats = context.filteredData.resource_users.KARST;break;

        }

        var txt = d.name.replaceAll("|", "").replaceAll("dotdot", ".");
        if (context.config.meta.labels.prettyMap[txt.trim()]) {
            return context.config.meta.labels.prettyMap[txt.trim()]+" (#Users: "+Utilities.formatValue["number"](stats)+")";
        }
        if ((txt.length>stringSizeLimit) && (d.i==2))
            {return txt.slice(0, stringSizeLimit)+"...";
    }
    else return txt+" (#"+Utilities.formatValue["number"](stats)+")";
}
if(d.i == 1){
    var stats1=""
     switch(d.name)
        {
            case "NIH-FDA":stats1 = context.filteredData.grant_sizes.NIHFDA;break;
            case "NIH-NCCIH":stats1 = context.filteredData.grant_sizes.NIHNCCIH;break;
            case "NIH-NCI":stats1 = context.filteredData.grant_sizes.NIHNCI;break;
            case "NIH-NHLBI":stats1 = context.filteredData.grant_sizes.NIHNHLBI;break;
            case "NIH-NIA": stats1 = context.filteredData.grant_sizes.NIHNIA;break;
            case "NIH-NIAAA":stats1 = context.filteredData.grant_sizes.NIHNIAAA;break;
            case "NIH-NIAID":stats1 = context.filteredData.grant_sizes.NIHNIAID;break;
            case "NIH-NIGMS":stats1 = context.filteredData.grant_sizes.NIHNIGMS;break;
            case "NIH-NIBIB":stats1 = context.filteredData.grant_sizes.NIHNIBIB;break;
            case "NIH-NIAMS":stats1 = context.filteredData.grant_sizes.NIHNIAMS;break;
            case "NIH-NIDA":stats1 = context.filteredData.grant_sizes.NIHNIDA;break;
            case "NIH-NIMH":stats1 = context.filteredData.grant_sizes.NIHNIMH;break;
            case "NIH-NICHD":stats1 = context.filteredData.grant_sizes.NIHNICHD;break;
            case "NIH-NIDCD":stats1 = context.filteredData.grant_sizes.NIHNIDCD;break;
            case "NIH-NIDDK":stats1 = context.filteredData.grant_sizes.NIHNIDDK;break;
            case "NIH-NLM":stats1 = context.filteredData.grant_sizes.NIHNLM;break;
            case "NIH-OD":stats1 = context.filteredData.grant_sizes.NIHOD;break;
            case "NIH-ODCDC":stats1 = context.filteredData.grant_sizes.NIHODCDC;break;

                 
        }
    var txt = d.name.replaceAll("|", "").replaceAll("dotdot", ".");
    if (context.config.meta.labels.prettyMap[txt.trim()]) {
        return context.config.meta.labels.prettyMap[txt.trim()]+" ("+Utilities.formatValue["currency"](stats1,'$')+")";
    }
    if ((txt.length>15) && (d.i==2))
        {return txt.slice(0,15)+"...";
        }
else return txt+" ("+Utilities.formatValue["currency"](stats1,'$')+")";
}

if(d.i == 2){
    var stats2=""
     switch(d.name)
        {
            case "Other":stats2 = context.filteredData.publication_disciplines.Other;break; 
            case "Infectious Diseases":stats2 = context.filteredData.publication_disciplines.InfectiousDiseases;break;
            case "Brain Research":stats2 = context.filteredData.publication_disciplines.BrainResearch;break;
            case "Biotechnology":stats2 = context.filteredData.publication_disciplines.Biotechnology;break;
            case "Biology":stats2 = context.filteredData.publication_disciplines.Biology;break;
            case "Medical Specialties":stats2 = context.filteredData.publication_disciplines.MedicalSpecialties;break;
            case "Social Sciences":stats2 = context.filteredData.publication_disciplines.SocialSciences;break;
            case "Chemistry":stats2 = context.filteredData.publication_disciplines.Chemistry;break;
            case "Social Sciences":stats2 = context.filteredData.publication_disciplines.SocialSciences;break;
            case "Health Professionals":stats2 = context.filteredData.publication_disciplines.HealthProfessionals;break;
            case "Electrical Engineering & Computer Science":stats2 = context.filteredData.publication_disciplines.ElectricalEngineeringComputerScience;break;
            case "Chemical, Mechanical, & Civil Engineering":stats2 = context.filteredData.publication_disciplines.ChemicalMechanicalCivilEngineering;break;
            

                 
        }
    var txt = d.name.replaceAll("|", "").replaceAll("dotdot", ".");
    if (context.config.meta.labels.prettyMap[txt.trim()]) {
        return context.config.meta.labels.prettyMap[txt.trim()]+" (#Publications: "+Utilities.formatValue["number"](stats2)+")";
    }
    
 return txt+" ("+Utilities.formatValue["number"](stats2)+")";
}

})
.filter(function(d) {
    return d.x < context.config.dims.fixedWidth / 2;
})
.attr("x", 6 + sankey.nodeWidth())
.attr("text-anchor", "start");
return context.SVG.nodes
}

function createToolTips() {
    context.SVG.edges.append("title")
    .attr("class", "tooltip")
    .text(function(d) {
        var source = d.source.name.replaceAll("|", "").replaceAll("dotdot", ".").trim();
        if (context.config.meta.labels.prettyMap[source]) {
            source = context.config.meta.labels.prettyMap[source]
        } else {
            source = source
        }
        var target = d.target.name.replaceAll("|", "").replaceAll("dotdot", ".").trim();
        if (context.config.meta.labels.prettyMap[target]) {
            target = context.config.meta.labels.prettyMap[target]
        } else {
            target = target
        }
        var val = source + " to " +
        target + "\n" + "#"+ Utilities.formatValue["number"](d.value);
        return val.replaceAll("|", "").replaceAll("dotdot", ".").trim();
    });
    context.SVG.nodes.append("title")
    .attr("class", "tooltip")
    .text(function(d) {
        var name = d.name.replaceAll("|", "").replaceAll("dotdot", ".").trim();
        if (context.config.meta.labels.prettyMap[name]) {
            name = context.config.meta.labels.prettyMap[name]
        } else {
            name = name
        }

        var val1 = name + "\n" + "#" + Utilities.formatValue[""](d.value);
        var val2 = val1.replaceAll("|", "").replaceAll("dotdot", ".").trim();
        return val2;
    });
    return context.SVG.selectAll(".tooltip")
}

function createVisGroup() {
    return context.SVG.append("g")
    .attr("transform", "translate(" + (offsetW / 2) + "," + (offsetH / 2) + ")")
}

function formatData() {
    graph = {
        "nodes": [],
        "links": []
    };
    
    context.filteredData.records.data.map(function(d, i) {
        var pre = "";
        context.config.meta.other.categories.forEach(function(d1, i1) {
            d[d1] = pre + d[d1].replaceAll(/\//g, "").replaceAll(/\./g, "dotdot")
            pre += "";
        })
    })

    var stepOne = {};
    context.filteredData.records.data.forEach(function(d, i) {
        var str = "|"

        context.config.meta.other.categories.forEach(function(d1, i1) {
            if (d[d1].length < stringSizeLimit)
                str += d[d1]+ "|"
            else str +=d[d1].slice(0,stringSizeLimit)+"|"
        })
        if (has(stepOne, str)) {
            stepOne[str].children.push(d)
        } else {
            stepOne[str] = { children: [d], uid: str, classList: str }
        }
    })

    var stepTwo = [];
    context.noderef = {}
    var refi = 0;
    Object.keys(stepOne).forEach(function(d, i) {
        var outObj = new Object();
        context.config.meta.other.categories.forEach(function(d1, i1) {
            if (stepOne[d].children.length > 0) {
                outObj[d1] = stepOne[d].children[0][d1]
                if (!has(context.noderef, outObj[d1])) {
                    context.noderef[outObj[d1]] = refi.toString();
                    refi++;
                }
            }
        })
        outObj.count = stepOne[d].children.length
        outObj.uid = stepOne[d].uid
        outObj.classList = stepOne[d].classList
        stepTwo.push(outObj)
    });
    stepTwo.forEach(function(d, i) {
        context.config.meta.other.categories.forEach(function(d1, i1) {
            d[d1 + "s"] = context.noderef[d[d1]]
        });
    })

    var stepThree = [];
    stepTwo.forEach(function(d, i) {
        context.config.meta.other.categories.forEach(function(d1, i1) {
            if (i1 < context.config.meta.other.categories.length - 1) {
                stepThree.push({
                    source: d[context.config.meta.other.categories[i1]],
                    target: d[context.config.meta.other.categories[i1 + 1]],
                    value: d.count,
                    uid: d.uid,
                    classList: d.classList
                })
            }
        })
    })

    stepThree.forEach(function(d) {
        if (d.source != null && d.target != null) {
            graph.nodes.push({ "name": d.source, "uid": d.uid });
            graph.nodes.push({ "name": d.target, "uid": d.uid });
            graph.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value,
                "uid": d.uid,
                "classList": d.classList,
                "click": 0
            });

        }
    });

    graph.nodes = d3.keys(d3.nest()
        .key(function(d) {
            return d.name;
        })
        .map(graph.nodes));

    /*var expensesCount = d3.nest()
  .key(function(d) { return d.name; })
  .rollup(function(v) { return v.GrantSize; })
 
  console.log(JSON.stringify(expensesCount));*/

  graph.links.forEach(function(d, i) {
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
});

  graph.nodes.forEach(function(d, i) {
    graph.nodes[i] = { "name": d, "click": 0 };
});
        // console.log(graph.nodes)
        graph.links.sort(function(a, b) {
            if (a.value == b.value) return -1
                return a.value - b.value;
        });

      /*  var k = d3.nest()
        .key(function(d) { return d.PubID; })
        .entries(context.filteredData.records.data);
        console.log(JSON.stringify(k));*/
        return graph;
    }

    function has(object, key) {
        return object ? hasOwnProperty.call(object, key) : false;
    }

}
return context;
}