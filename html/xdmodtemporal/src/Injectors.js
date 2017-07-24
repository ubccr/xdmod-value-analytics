jQuery.fn.d3Event = function(eventName) {
    this.each(function(i, e) {
        var evt = new MouseEvent(eventName);
        e.dispatchEvent(evt);
    });
};

function applyD3Event(sel, evt) {
    $(sel[0]).d3Event(evt);
}

angular.module('app').requires.push('ngTable');

function deselectSelection(sel) {
    sel.classed("deselected", true).classed("selected", false);
}

function selectSelection(sel) {
    sel.classed("deselected", false).classed("selected", true);
}

function defaultSelection(sel) {
    sel.classed("deselected", false).classed("selected", false);
}

app.controller('tableCtrl', ['$scope', function($scope) {
    $scope.tableData = [];
    $scope.addTableData = function(data) {
        $scope.tableData = $scope.tableData.concat(data);
        $scope.sortTableData("last_name");
    }
    $scope.sortTableData = function(val, dir) {
        $scope.tableData = $scope.tableData.sort(function(a, b) {
            var c = a;
            var d = b;
            if (dir == "desc") {
                c = b;
                d = a;
            }
            return c[val] - d[val]
        })
    }
    $scope.clearTableData = function() {
        $scope.tableData = [];
    }
}]).directive('stRatio', function() {
    return {
        link: function(scope, element, attr) {
            var ratio = +(attr.stRatio);

            element.css('width', ratio + '%');

        }
    };
})

function processAuthorSpec(data) {
    var nodes = data.authors.data;
    var edges = [];
    nodes.forEach(function(d, i) {
        d.idd = d.id;
        d.id = i;
    })

    data.records.data.forEach(function(record, recordIndex) {
        var pairs = [];
        record.author_ids.forEach(function(d, i) {
            var numLeft = i + 1;
            if (numLeft < record.author_ids.length) {
                for (var i1 = numLeft; i1 < record.author_ids.length; i1++) {
                    pairs.push([d, record.author_ids[i1]])
                }
            }
        })
        pairs.forEach(function(d, i) {
            var s = d[0];
            var t = d[1];
            var filteredEdge = edges.filter(function(d1, i1) {
                return (d1.s == s && d1.t == t) || (d1.s == t && d1.t == s);
            })
            if (filteredEdge.length > 0) {
                filteredEdge[0].coauthoredWorks.push(record);
            } else {
                edges.push({
                    s: s,
                    t: t,
                    coauthoredWorks: [record]
                })
            }
        })
    })

    edges.forEach(function(d, i) {
        d.source = nodes.filter(function(d1, i1) {
            return d1.idd == d.s
        })[0].id;
        d.target = nodes.filter(function(d1, i1) {
            return d1.idd == d.t
        })[0].id;
        d.weight = d.coauthoredWorks.length;
    })

    nodes.forEach(function(author, authorIndex) {
        var papers = data.records.data.filter(function(d, i) {
            return d.author_ids.indexOf(author.idd) > -1;
        });
        author.numPapers = papers.length;
        author.firstYearPublished = d3.min(papers, function(d, i) {
            return d.year;
        })

    });

    var res = {
        nodes: {
            data: nodes,
            schema: data.authors.schema
        },
        edges: {
            data: edges,
            schema: [{
                name: "source",
                type: "numeric"
            }, {
                name: "target",
                type: "numeric"
            }, {
                name: "weight",
                type: "numeric"
            }]
        }
    }
    res.nodes.schema.push({
        name: "numPapers",
        type: "numeric"
    }, {
        name: "id",
        type: "numeric"
    })
    return res;
}

function showPopup(tableData) {
    var popupScope = angular.element($("#popup-table-container")).scope()
    $(".popup").css({ display: "block" });
    $("#popup-table").css("display", "block");
    popupScope.clearTableData();
    popupScope.addTableData(tableData);
    popupScope.sortTableData("year", "desc");
    popupScope.$apply();
    $("#popup-table-container").css("display", "block");
}