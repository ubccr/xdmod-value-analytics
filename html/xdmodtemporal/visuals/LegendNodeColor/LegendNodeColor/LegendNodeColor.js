visualizationFunctions.LegendNodeColor = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    context.VisFunc = function() {
        d3.xml("visuals/LegendNodeColor/LegendNodeColor/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
            if (error) throw error;
            context.SVG = d3.select(xml.documentElement);
            element[0].appendChild(context.SVG.node());

            context.setNodeSizes = function(arr) {
                var extent = d3.extent(arr);
                var avg = (extent[1] - extent[0]) / 2;
                context.getMaxNode()
                .attr("r", extent[1])
                context.getMidNode()
                .attr("r", avg)
                .attr("cy", parseInt(context.getMaxNode().attr("cy")) + extent[1] - avg)
                context.getMinNode()
                .attr("r", extent[0])
                .attr("cy", parseInt(context.getMaxNode().attr("cy")) + extent[1] - extent[0])
            }
            context.getTitle = function() {
                return context.SVG.selectAll("#title");
            }

            context.getMaxG = function() {
                return context.SVG.selectAll("#maxG");
            }
            context.getMidG = function() {
                return context.SVG.selectAll("#midG");
            }
            context.getMinG = function() {
                return context.SVG.selectAll("#minG");
            }


            context.getMaxVal = function() {
                return context.getMaxG().selectAll("text");
            }
            context.getMidVal = function() {
                return context.getMidG().selectAll("text");
            }
            context.getMinVal = function() {
                return context.getMinG().selectAll("text");
            }
            context.getNote = function() {
                return context.SVG.selectAll("#note");
            }

            context.setTitle = function(text) {
                context.getTitle().text(text);
            }
            context.setMaxVal = function(val) {
                context.getMaxVal().text(val);
            }
            context.setMidVal = function(val) {
                context.getMidVal().text(val);
            }
            context.setMinVal = function(val) {
                context.getMinVal().text(val);
            }
            context.setNote = function(text) {
                context.getNote().text(text);
            }

            context.getGradient100 = function() {
                return context.SVG.selectAll("#stop-color-0")
            }
            context.getGradient0 = function() {
                return context.SVG.selectAll("#stop-color-1")
            }

            context.SVG.attr("width", 150);
            context.SVG.attr("height", 150);
        });

        context.updateStopColors = function(arr) {
            context.getGradient100().style("stop-color", arr[1])
            context.getGradient0().style("stop-color", arr[0])
        }

        context.MoneyFormat = function (labelValue) 
        {
                          // Nine Zeroes for Billions
                          return Math.abs(Number(labelValue)) >= 1.0e+9

                          ? Math.round(Number(labelValue) / 1.0e+9) + "B"
                               // Six Zeroes for Millions 
                               : Math.abs(Number(labelValue)) >= 1.0e+6

                               ? Math.round(Number(labelValue) / 1.0e+6) + "M"
                               // Three Zeroes for Thousands
                               : Math.abs(Number(labelValue)) >= 1.0e+3

                               ? Math.round(Number(labelValue) / 1.0e+3) + "K"

                               : Math.abs(Number(labelValue));
                           }
                           context.updateText = function(arr) {
                            var minVal = Utilities.round(arr[0], 0);
                            var midVal = Utilities.round(arr[1], 0);
                            var maxVal = Utilities.round(arr[2], 0);
                            
                            if (minVal == midVal && midVal == maxVal) {
                                maxVal = "";
                            }
                            if (minVal == midVal || midVal == maxVal) {
                                midVal = "";
                            }
                            context.setMinVal("$"+context.MoneyFormat(minVal));
                            context.setMidVal("$"+context.MoneyFormat(midVal));
                            context.setMaxVal("$"+context.MoneyFormat(maxVal));

                        }

                    }
                    return context;
                }

