visualizationFunctions.LegendNodeSize = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    // context.SVG = context.config.easySVG(element[0])
    context.VisFunc = function() {

        d3.xml("visuals/LegendNodeSize/LegendNodeSize/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
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

            context.getMaxNode = function() {
                return context.SVG.selectAll("#maxNode");
            }
            context.getMidNode = function() {
                return context.SVG.selectAll("#midNode");
            }
            context.getMinNode = function() {
                return context.SVG.selectAll("#minNode");
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

        context.updateNodeSize = function(arr) {          
            var minNode = context.getMinNode();
            var midNode = context.getMidNode();
            var minNodeSize = (64 * arr[0]) / arr[1];
            var midNodeSize = (64 + minNodeSize) / 2;

            minNode
            .attr("r", minNodeSize)
            .attr("cy", 174 - minNodeSize)
            
            midNode
            .attr("r", midNodeSize)
            .attr("cy", 174 - midNodeSize)
            context.getMidG().attr("transform", "translate(70," + (174 - (midNodeSize * 2)) + ")")
            context.getMinG().attr("transform", "translate(70," + (174 - (minNodeSize * 2)) + ")")
        }

        context.updateTextFromFunc = function(f) {
            var max = f(96);
            var mean = f(57.6);
            var min = f(19.2);
            nodeSize.updateText([min, mean, max]);
        }

        context.updateText = function(arr) {
            context.setMinVal(Utilities.round(arr[0], 0))
            context.setMidVal(Utilities.round(arr[1], 0))
            context.setMaxVal(Utilities.round(arr[2], 0))
        }

    }
    return context;
}
