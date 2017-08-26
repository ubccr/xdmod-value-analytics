visualizationFunctions.LegendEdgeSize = function(element, data, opts) {
    var context = this;
    context.config = context.CreateBaseConfig();
    context.VisFunc = function() {

        d3.xml("visuals/LegendEdgeSize/LegendEdgeSize/legend.svg").mimeType("image/svg+xml").get(function(error, xml) {
            if (error) throw error;
            context.SVG = d3.select(xml.documentElement);
            element[0].appendChild(context.SVG.node());

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

            context.getMaxEdge = function() {
                return context.SVG.selectAll("#maxEdge");
            }
            context.getMidEdge = function() {
                return context.SVG.selectAll("#midEdge");
            }
            context.getMinEdge = function() {
                return context.SVG.selectAll("#minEdge");
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

        context.updateEdgeSize = function(arr) {          
            var minEdge = context.getMinEdge();
            var midEdge = context.getMidEdge();
            
            var minEdgeSize = (64 * arr[0]) / arr[1];
            var midEdgeSize = (64 + minEdgeSize) / 2;

          
            minEdge.attr("stroke-width", minEdgeSize)
            midEdge.attr("stroke-width", midEdgeSize)

            
        }

        context.updateText = function(arr) {
            context.setMinVal(Utilities.round(arr[0], 0))
            context.setMidVal(Utilities.round(arr[1], 0))
            context.setMaxVal(Utilities.round(arr[2], 0))
        }

        context.updateTextFromFunc = function(f) {
             var max = f(96);
            var mean = f(57.6);
            var min = f(19.2);
            edgeSize.updateText([min, mean, max]);
        }


    }
    return context;
}
