/**
 * @namespace  HVBarChart
 * @type {Object}
 * @description Bar chart context can be flipped between a horizontal and vertical orientation. Options also allow stacked/non-stacked chart types depending on the configuration.
 */
 visualizationFunctions.HVBarChart = function(element, data, opts) {
    var context = this;
    this.config = this.CreateBaseConfig();
    this.VisFunc = function() {
        
        var chartOrientation = context.config.meta.orientation;
        if (chartOrientation == "vertical") {
            var newHeight = (22 * context.filteredData[context.PrimaryDataAttr].data.length)
            if (context.config.dims.fixedHeight < newHeight) {
                $(element[0]).parent().css({height: newHeight + 50});
            }
            context.config.dims.fixedHeight = newHeight;
        }
        context.SVG = context.config.easySVG(element[0])
        formatData();

        context.filteredData[context.PrimaryDataAttr].data.sort(function(a, b) {
            return b.values[context.config.meta.bars.styleEncoding.size.attr] - a.values[context.config.meta.bars.styleEncoding.size.attr];
        })

        var xOrientation = "top";
        context.chart = configureChartArea();
        context.SVG.barGroups = createBars();



        function formatData() {

            context.possibleRowValues = [];
            context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
                if (context.possibleRowValues.indexOf(d[context.config.meta[context.PrimaryDataAttr].rowAggregator]) == -1) {
                    context.possibleRowValues.push("" + d[context.config.meta[context.PrimaryDataAttr].rowAggregator])
                }
            })
            context.possibleRowValues.sort(function(a, b) {
                if (a > b) return 1
                    return -1
            })

            function rollup(leaves) {
                var obj = { children: leaves };
                context.filteredData[context.PrimaryDataAttr].schema.forEach(function(d) {
                    if (d.type == "numeric") {
                        obj[d.name] = d3.sum(leaves, function(d1) {
                            return d1[d.name];
                        })
                    }
                })
                return obj;
            }

            function nest(data, attr) {
                return d3.nest()
                .key(function(d) {
                    return d[attr]
                })
                .rollup(rollup)
                .entries(data)
            }

            function getUnique(arr) {
                var u = {},
                a = [];
                for (var i = 0, l = arr.length; i < l; ++i) {
                    if (u.hasOwnProperty(arr[i])) {
                        continue;
                    }
                    a.push(arr[i]);
                    u[arr[i]] = 1;
                }
                return a;

            }


            context.filteredData[context.PrimaryDataAttr].data = nest(context.filteredData[context.PrimaryDataAttr].data, context.config.meta[context.PrimaryDataAttr].colAggregator)
            context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
                d[context.config.meta[context.PrimaryDataAttr].rowAggregator] = nest(d.values.children, context.config.meta[context.PrimaryDataAttr].rowAggregator)
            });

            context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
                var list = d[context.config.meta[context.PrimaryDataAttr].rowAggregator].map(function(d1, i1) {
                    return d1.key
                });
                var uniqueDifference = getUnique($(context.possibleRowValues).not(list).get());
                uniqueDifference.forEach(function(d1, i1) {
                    var obj = new Object();
                    obj.key = d1;
                    obj.values = {
                        children: []
                    };
                    d[context.config.meta[context.PrimaryDataAttr].rowAggregator].push(obj);
                })
            })
            context.filteredData[context.PrimaryDataAttr].data.forEach(function(d, i) {
                d[context.config.meta[context.PrimaryDataAttr].rowAggregator] = d[context.config.meta[context.PrimaryDataAttr].rowAggregator].sort(function(a, b) {
                    return a.key.toString() > b.key.toString()
                });
            });
            context.filteredData[context.PrimaryDataAttr].data = context.filteredData[context.PrimaryDataAttr].data.sort(function(a, b) {
                return a.key - b.key
            });
        }

        function configureChartArea() {
            if (chartOrientation == "horizontal") {
                context.Scales.yScale = d3.scale.linear()
                .domain([d3.max(context.filteredData[context.PrimaryDataAttr].data, function(d, i) {
                    return d.values[context.config.meta.bars.styleEncoding.size.attr]
                }), 0])
                context.Scales.xScale = d3.scale.linear()
                .domain([0, context.filteredData[context.PrimaryDataAttr].data.length])
            }
            if (chartOrientation == "vertical") {
                context.Scales.xScale = d3.scale.linear()
                .domain([0, d3.max(context.filteredData[context.PrimaryDataAttr].data, function(d, i) {
                    return d.values[context.config.meta.bars.styleEncoding.size.attr]
                })])
                ;

                context.Scales.yScale = d3.scale.linear()
                .domain([0, context.filteredData[context.PrimaryDataAttr].data.length])

            }
            context.SVG.visG = context.SVG.append("g");
            var chart = Utilities.chartArea()
            .network(context)
            .selector(context.SVG.visG)
            .origin(context.config.meta.bars.styleEncoding.graphOffset)
            .end([context.config.dims.fixedWidth, context.config.dims.fixedHeight])
            .xscale(context.Scales.xScale)
            .xorientation(xOrientation)
            .xtitle(context.config.meta.labels.xAxis.attr, context.config.meta.labels.xAxis.orientation)
            .yscale(context.Scales.yScale)
            .ytitle(context.config.meta.labels.yAxis.attr, context.config.meta.labels.yAxis.orientation)
            
            chart();

            return chart;
        }

        function createBars() {
            return context.SVG.visG.append("g")
            .attr("transform", function(d, i) {
                if (chartOrientation == "horizontal") {
                    return "translate(" + context.chart.xorigin()[0] + ", " + (context.chart.yorigin()[1] + d3.max(context.chart.yscale().range())) + ")"
                }
                if (chartOrientation == "vertical") {
                    return "translate(" + (context.chart.xorigin()[0]) + ", " + (context.chart.xorigin()[1]) + ")"
                }
            })
            .selectAll("bars")
            .data(context.filteredData[context.PrimaryDataAttr].data)
            .enter()
            .append("g")
            .each(function(d, i) {
                var x = 0;
                var y = 0;
                var w = 0;
                var h = 0;
                var currG = d3.select(this);
                var prevX = 0;
                var prevY = 0;
                d[context.config.meta[context.PrimaryDataAttr].rowAggregator].forEach(function(d1, i1) {
                    if (chartOrientation == "horizontal") {
                        w = context.chart.xscale()(1) - 3;
                        h = context.chart.yscale()(d3.max(context.chart.yscale().domain()) - d1.values[context.config.meta.bars.styleEncoding.size.attr]);
                        x = context.chart.xscale()(i);
                        if (xOrientation == "bottom") {
                            y = context.chart.xscale()(0) - h;
                            h = d3.max([h, 0]);
                            y = d3.min([y + prevY, 0]);
                        }
                        if (xOrientation == "top") {
                            y = -context.chart.yscale()(0) - prevY
                        }
                        prevY -= h
                    }
                    if (chartOrientation == "vertical") {
                        w = context.chart.xscale()(d3.max([d1.values[context.config.meta.bars.styleEncoding.size.attr], 0]));
                        h = context.chart.yscale()(1) - 3;
                        x = context.chart.yscale()(0) + prevX;
                        y = context.chart.yscale()(i);
                        if (xOrientation == "bottom") {
                            y = -context.chart.yscale()(i + 1);
                        } else {
                            y += 5;
                        }
                        prevX += w;
                    }
                    
                    currG.append("rect")
                    .attr("class", "wvf-rect")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("fill", "white")
                    if (chartOrientation == "vertical") {
                        currG.append("rect")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("width", context.config.dims.fixedWidth)
                        .attr("height", h + 3.1)
                        .attr("fill", "lightgrey")
                        .style("opacity", .000001)
                    }
                    if (chartOrientation == "horizontal") {
                        currG.append("rect")
                        .attr("x", x)
                        .attr("y", y - context.config.dims.fixedHeight)
                        .attr("width", w)
                        .attr("height", context.config.dims.fixedHeight)
                        .attr("fill", "lightgrey")
                        .style("opacity", .000001)
                    }
                });
            })
            .on('mouseover', function(d,i){
                
                barChart01.SVG.selectAll("text.wvf-label-mid").attr("opacity",.25);
                

                d3.select(this).selectAll("text.wvf-label-mid").attr("opacity",1);
                d3.select(this).selectAll("text.wvf-label-mid").style("fontWeight","bold");
                d3.select(this).selectAll("text.wvf-label-mid").style("stroke","black"); 
                d3.select(this).selectAll("text.wvf-label-mid").style("stroke-width",".5px");

                
                d3.select(this).selectAll("rect.wvf-rect").style("fill","darkgrey");



                forceNetwork01.SVG.selectAll("text").attr("display","none");
                
                
                forceNetwork01.SVG.nodeG.selectAll("circle")
                .attr("opacity", .25)
                forceNetwork01.SVG.edges
                .attr("opacity", .25)

                forceNetwork01.SVG.nodeG.filter(function(d1,i1){
                    if(d1.name == d.key)
                    {
                        var matchingEdges = forceNetwork01.SVG.edges.filter(function(d2, i2) {
                         return d2.source.id == d1.id || d2.target.id == d1.id;
                     })

                        matchingEdges.attr("opacity", 1);

                        matchingEdges.data().forEach(function(d4, i4) {
                            forceNetwork01.SVG.nodeG.filter(function(d5, i5) {
                             
                                if(d5.id == d4.source.id || d5.id == d4.target.id) {
                                                // barChart01.SVG.barGroups.selectAll("text").forEach(function(d6,i6){
                                                // if (d6[0].innerHTML == d2.name) d6[0].setAttribute("opacity",1);
                                                
                                                  // })
                                                  return d4.id;    
                                              }
                                          }).selectAll("circle").attr("opacity", 1)
                        });
                        
                        matchingEdges.data().forEach(function(d6,i6){
                            forceNetwork01.SVG.nodeG.filter(function(d7,i7){
                                if((d6.target.id == d1.id) && (d7.id == d6.source.id)) {

                                 barChart01.SVG.barGroups.selectAll("text").forEach(function(d9,i9){
                                    if (d9[0].innerHTML == d7.name.toString().toLowerCase()) 
                                    {
                                     d9[0].setAttribute("opacity",1);
                                     
                                 }
                             })


                                 return d7.id;

                             }
                             else if((d6.source.id == d1.id) && (d7.id == d6.target.id)) {

                              barChart01.SVG.barGroups.selectAll("text").forEach(function(d9,i9){
                                if (d9[0].innerHTML == d7.name.toString().toLowerCase()) 
                                {
                                 d9[0].setAttribute("opacity",1);
                                 
                             }
                         })

                              return d7.id;

                          }
                      }).selectAll("text").attr("display","inline");
                        })
                        return d1.id;
                    } 

                }).selectAll("circle").attr("opacity", 1)
                
                forceNetwork01.SVG.nodeG.filter(function(d8,i8){
                    if(d8.name == d.key)
                        { return d8.id;}
                }).selectAll("text").attr("display", "inline")
            })
            .on('mouseout', function(d,i){
                
                d3.selectAll("rect.wvf-rect").style("fill","lightgrey");
                
                forceNetwork01.SVG.nodeG.selectAll("text").attr("display", function(d, i) {
                    if (d[configs.forceNetwork01.nodes.styleEncoding.size.attr] >= parseInt($("#range")["0"].value)) {
                     
                        return "inline";
                        
                    } else {
                        
                        return "none";
                    }
                    
                });
                barChart01.SVG.selectAll("text.wvf-label-mid").attr("opacity",1);
                barChart01.SVG.selectAll("text.wvf-label-mid").style("fontWeight","normal"); 
                barChart01.SVG.selectAll("text.wvf-label-mid").style("stroke-width","0px");
                forceNetwork01.SVG.nodeG.selectAll("circle").attr("opacity", "1");
                forceNetwork01.SVG.edges.attr("opacity", 1);
            });
        }
    }
    return context;
}
