configs.barChart01 = {
    records: {
        colAggregator: "name"
    },
    bars: {
        styleEncoding: {
            size: {
                // attr: "id"
                attr: "total_amount"
            },
            graphOffset: [10, 10]
        }
    },
    labels: {
        xAxis: {
            attr: "Total Amount",
            orientation: "top"
        },
        yAxis: {
            attr: "",
            orientation: "right"
        },
    },
    orientation: "vertical"
}

events.barChart01 = function(ntwrk) {
 var labels = [];
 ntwrk.filteredData.records.data.forEach(function(d, i) {
    if (labels.indexOf(d.key) == -1) {

        labels.push(d.key);
        
    }
})

 var newyAxis = d3.svg.axis()
 .scale(d3.scale.ordinal()
    .domain(labels)
    .range(ntwrk.chart.yscale().range()))
 .tickValues([])
 .ticks([])
 ntwrk.chart.chartYG().call(newyAxis)

 
 
 ntwrk.SVG.barGroups.each(function(d, i) {
    var currG = d3.select(this);
    var rect = d3.select(currG.selectAll("rect")[0][0])
    var offset = parseFloat(rect.attr("y")) - (parseFloat(rect.attr("height")) / 2) + parseFloat(rect.attr("height") * 1.25)
    currG.selectAll("rect").attr("fill", "white")
    currG.append("text")
    .attr("class", "wvf-label-mid")
    .attr("x", 4)
    .text(d.key.toString().toLowerCase())
    .attr("y", offset)

    
});

}




dataprep.barChart01 = function(ntwrk) {
    ntwrk.click=0;
    ntwrk.filteredData.records = ntwrk.filteredData.nodes; 
    ntwrk.PrimaryDataAttr = "records";

}