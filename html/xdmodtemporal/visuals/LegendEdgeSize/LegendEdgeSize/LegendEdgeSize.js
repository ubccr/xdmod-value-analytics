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
                return context.SVG.selectAll("#maxEdge");
            }
            context.getMidG = function() {
                return context.SVG.selectAll("#midEdge");
            }
            context.getMinG = function() {
                return context.SVG.selectAll("#minEdge");
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

        context.updateEdgeSize = function(arr, zoom) {
          var minEdge = context.getMinEdge();
           var midEdge = context.getMidEdge();
           var maxEdge = context.getMaxEdge();

           maxEdge.select("line").attr("stroke-width",arr[1]*zoom);
            midEdge.select("line").attr("stroke-width",(arr[0]+arr[1])/2*zoom);
            minEdge.select("line").attr("stroke-width",arr[0]*zoom);

        }

        context.updateText = function(arr) {
            context.setMinVal(Utilities.round(arr[0], 0))
            context.setMidVal(Utilities.round(arr[1], 0))
            context.setMaxVal(Utilities.round(arr[2], 0))
        }

        context.updateTextFromFunc = function() {
            var mid = (forceNetwork01.maxEdgeWeight + forceNetwork01.minEdgeWeight)/2;
            edgeSize.updateText([forceNetwork01.minEdgeWeight, mid, forceNetwork01.maxEdgeWeight]);
        }


    }
    return context;
}
