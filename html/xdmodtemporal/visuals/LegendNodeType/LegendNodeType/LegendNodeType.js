visualizationFunctions.LegendNodeType = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    context.VisFunc = function() {
        d3.xml("visuals/LegendNodeType/LegendNodeType/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
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
            context.SVG.attr("width", 150);
            context.SVG.attr("height", 150);
        });

        context.updateTypeColors = function(arr) {
            context.getMinG().selectAll("rect").style("fill", arr[2])
            context.getMidG().selectAll("rect").style("fill", arr[1])
            context.getMaxG().selectAll("rect").style("fill", arr[0])
        }

        context.updateText = function(arr) {
            context.setMinVal(arr[2])
            context.setMidVal(arr[1])
            context.setMaxVal(arr[0])
        }

    }
    return context;
}
