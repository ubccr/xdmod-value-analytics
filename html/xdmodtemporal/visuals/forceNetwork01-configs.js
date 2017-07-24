configs.forceNetwork01 = {
    "nodes": {
        "styleEncoding": {
            "size": {
                "attr": "number_of_grants",
                "range": [5,11,17],
                "scale": "linear"
            },
            "color": {
                "attr": "total_amount",
                "range": ["#FFFFFF","#3182bd"] //optional. Must be a minimum of two values. Will use the attr color.attr property to fill in bars on the defined scale.
            }
        },
        "identifier": {
            "attr": "name" //Unique identifier
        }
    },
    "edges": {
        "styleEncoding": {
            "strokeWidth": {
                "attr": "number_of_grants",
                "range": [1,3.5,8]
            },
            "opacity": {
                "attr": "value",
                "range": [.5, 1]
            },
            "color": {
                "attr": "",
                "range": ["black"]
            }
        },
        "identifier": {
            "attr": "id" //Unique identifier
        }
    },
    "labels": {
        "identifier": {
            "attr": "name" //Unique identifier
        },
        "styleEncoding": {
            "size": {
                "attr": "numPapers",
                "range": [23, 35],
                "scale": "linear"
            }
        }
    },
    "visualization": { //optional
        "forceLayout": {
            "linkStrength": 0.9,
            "friction": .9,
            "linkDistance": 50,
            "charge": null,
            "chargeDistance": null,
            "gravity": null,
            "theta": 0,
            "alpha": 0.2
        }
    }
};
events.forceNetwork01 = function(ntwrk){
    ntwrk.isPopupShowing = false;
    setTimeout(function() {
        configureDOMElements();
    }, 500);

    function updateNodes(val, orderedSizeCoding) {
        var p = orderedSizeCoding[Math.floor(val / 100 * orderedSizeCoding.length)];
        ntwrk.filteredData.nodes.data = ntwrk.allNodes.filter(function(d, i) {
           return (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] > p);
       });
        ntwrk.filteredData.nodes.data = [];
        ntwrk.SVG.force.restart();
    }

    function updateLabelVisibility(val, orderedSizeCoding) {
        ntwrk.SVG.nodeG.selectAll("text").attr("display", "none").classed("deselected", false).classed("selected", false);
        ntwrk.SVG.nodeG.selectAll("text").attr("display", function(d, i) {
            if (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] >= val) {
                d.keepLabel = true;
                return "inline"
            } else {
                d.keepLabel = false;
                return "none"
            }
        });
    }

    function showFilteredLabels() {
        ntwrk.SVG.nodeG.selectAll("text").attr("display", "inline")
        ntwrk.SVG.nodeG.selectAll("text").attr("display", function(d1, i1) {
            if (!d1.keepLabel) {
                return "none"
            }
            return "inline"
        });
    }

    function configureDOMElements() {

        $('.drawer').drawer();
        
        var orderedSizeCoding = [];
        
        ntwrk.filteredData.nodes.data.forEach(function(d, i) {
            orderedSizeCoding.push(d[configs.forceNetwork01.nodes.styleEncoding.size.attr]);
        })
        orderedSizeCoding.sort(function(a, b) {
            return Number(a) - Number(b);
        });
        

        var $range = $("#range");
        $range.ionRangeSlider({
            min: d3.min(orderedSizeCoding),
            max: d3.max(orderedSizeCoding),
            from: Math.ceil(d3.mean(orderedSizeCoding)),
            // type: 'double',
            step: 1,
            grid: false,
            onChange: function(newVal) {
                
                updateLabelVisibility(newVal.from, orderedSizeCoding)
            }
        }); 

        ntwrk.allNodes = [].concat(ntwrk.filteredData.nodes.data);
        ntwrk.allEdges = [].concat(ntwrk.filteredData.edges.data);
        updateLabelVisibility(d3.mean(orderedSizeCoding), orderedSizeCoding);  

        slider = $("#range").data("ionRangeSlider");
        
        
        var sliderFormElem = $("#sliderForm");
        var sliderFormScope = angular.element(sliderFormElem).scope();
        nodeSize.setTitle("Number of grants")
        nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        nodeSize.updateNodeSize(configs.forceNetwork01.nodes.styleEncoding.size.range);
        nodeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });  

        edgeSize.setTitle("#Co-authored Grants")
        edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
        edgeSize.updateEdgeSize(configs.forceNetwork01.edges.styleEncoding.strokeWidth.range);
        edgeSize.updateTextFromFunc(function(d) {
            return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
        });

        nodeColor.setTitle("Total Amount")
        nodeColor.updateStopColors(configs.forceNetwork01.nodes.styleEncoding.color.range)
        nodeColor.updateText([d3.min(ntwrk.Scales.nodeColorScale.domain()), d3.mean(ntwrk.Scales.nodeColorScale.domain()), d3.max(ntwrk.Scales.nodeColorScale.domain())])

        ntwrk.SVG.on("mousewheel", function() {
            setTimeout(function() {
                nodeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.nodeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                edgeSize.updateTextFromFunc(function(d) {
                    return ntwrk.Scales.edgeSizeScale.invert(d / 2) / ntwrk.zoom.scale();
                });
                nodeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
                edgeSize.setNote("Based on zoom level (" + Utilities.round(ntwrk.zoom.scale(), 1) + "x)")
            }, 10);
        });
        
        
    }
};
dataprep.forceNetwork01 = function(ntwrk) {
    ntwrk.filteredData.nodes.data.map(function(d, i) {
        d.id = i;
        return d;
    })
    ntwrk.filteredData.edges.data.map(function(d, i) {
        d.id = i;
        return d;
    })
};
