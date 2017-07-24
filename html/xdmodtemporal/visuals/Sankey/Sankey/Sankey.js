head.js('visuals/Sankey/Sankey/sankey-plugin.js')

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
            context.SVG.columnLabels.append("text")
            .attr("class", "columnlabel l")
            .attr("x", function() {
                if (i == 0) {
                    return currNodeData.x
                }
                if (i == context.config.meta.other.categories.length - 1) {
                    return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value
                }
                return currNodeData.x + context.config.meta.nodes.styleEncoding.size.value / 2
            })
            .attr("y", -20)
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
        })
         return d3.selectAll(".columnlabel")
     }


     function applySVGEvents() {
        context.SVG.nodes.selectAll("rect")
        .on("mouseover", function(d) {
            
            context.SVG.nodes.selectAll("rect").classed("selected", false).classed("deselected", false);
            d3.select(this).classed("selected", true).classed("deselected", false)
            context.SVG.edges.classed("selected", false).classed("deselected", true);
            context.SVG.edges.filter("[class*='" + d.name + "-']").moveToFront().classed("deselected", false).classed("selected", true)
        })
        .on("mouseout", function(d, i) {
            context.SVG.edges.classed("selected", false).classed("deselected", false);
        })
        .on("click", function(d) {
            d.color = d3.select(this).style("fill");
            d3.select(this).classed("selected", true);
            context.SVG.edges.filter("[class*='" + d.name + "-']").each(function(d1, i1) {
                if (!d1.selected){
                    d1.selected = true;
                    d3.select(this).style("stroke", d.color).classed("selected", true);
                }
                else {
                    d1.selected = false;
                    d3.select(this).style("stroke", d.color).classed("selected", false);
                }
                
            })
        })
        context.SVG.edges
        .on("mouseover", function(d, i) {
            context.SVG.nodes.selectAll("rect")
            .classed("selected", false);
            d3.select(this).data().forEach(function(d1, i1) {
                var muid = d1.uid
                muid.split("-").forEach(function(dm, im) {
                            //TODO: Invalid selector error
                            if (dm.length > 0) {
                              //  context.SVG.selectAll("." + dm.replaceAll("_", "")).filter(".col-" + im).selectAll("rect").classed("selected", true)
                          }

                      })

            })
            context.SVG.edges.classed("selected", false)
                    //context.SVG.edges.filter("." + d3.select(this).property("uid")).classed("selected", true).moveToFront();
                })
        .on("mouseout", function(d, i) {
            context.SVG.edges.classed("selected", false)
            context.SVG.nodes.selectAll("rect").classed("selected", false)
        })
        context.SVG.background
        .on("click", function() {
            context.SVG.edges.classed("selected", false).classed("deselected", false).style("stroke", defaultEdgeColor);
            context.SVG.nodes.selectAll("rect").classed("selected", false).classed("deselected", false)
            d3.event.stopPropagation();
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
            return " " + d.name.replaceAll("_", "") + " col-" + d.i
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        

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
            var txt = d.name.replaceAll("_", " ").replaceAll("dotdot", ".");
            if (context.config.meta.labels.prettyMap[txt.trim()]) {
                return context.config.meta.labels.prettyMap[txt.trim()]
            }
            return txt;

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
            var source = d.source.name.replaceAll("_", "").replaceAll("dotdot", ".").trim();
            if (context.config.meta.labels.prettyMap[source]) {
                source = context.config.meta.labels.prettyMap[source]
            } else {
                source = source
            }
            var target = d.target.name.replaceAll("_", "").replaceAll("dotdot", ".").trim();
            if (context.config.meta.labels.prettyMap[target]) {
                target = context.config.meta.labels.prettyMap[target]
            } else {
                target = target
            }
            var val = source + " â†’ " +
            target + "\n" + Utilities.formatValue["number"](d.value);
            return "# " + val.replaceAll("_", "").replaceAll("dotdot", ".").trim();
        });
        context.SVG.nodes.append("title")
        .attr("class", "tooltip")
        .text(function(d) {
            var name = d.name.replaceAll("_", "").replaceAll("dotdot", ".").trim();
            if (context.config.meta.labels.prettyMap[name]) {
                name = "# " + context.config.meta.labels.prettyMap[name]
            } else {
                name = "# " + name
            }

            var val1 = name + "\n" + Utilities.formatValue[""](d.value);
            var val2 = val1.replaceAll("_", "").replaceAll("dotdot", ".").trim();
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
                d[d1] = pre + d[d1].replaceAll(" ", "").replaceAll(/\//g, "").replaceAll(/\./g, "dotdot")
                pre += "_"
            })
        })

        var stepOne = {};
        context.filteredData.records.data.forEach(function(d, i) {
            var str = ""
            var str2 = "-"
            context.config.meta.other.categories.forEach(function(d1, i1) {
                str += d[d1] + "-"
                str2 += d[d1] + "- -"
            })
            if (has(stepOne, str)) {
                stepOne[str].children.push(d)
            } else {
                stepOne[str] = { children: [d], uid: str, classList: str2 }
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
                    "classList": d.classList
                });

            }
        });

        graph.nodes = d3.keys(d3.nest()
            .key(function(d) {
                return d.name;
            })
            .map(graph.nodes));

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

            return graph;
        }

        function has(object, key) {
            return object ? hasOwnProperty.call(object, key) : false;
        }
    }
    return context;
}