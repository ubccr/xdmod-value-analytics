var Visualization = function(scope) {
    scope.config = null;
    scope.VisFunc = null;
    scope.VisScript = null;
    scope.SVG = null;
    scope.Scales = {};
    scope.isFirstRun = true;
    scope.PrimaryDataAttr = "";
    scope.dataTemplate = {
        nodes: {
            data: {},
            schema: {}
        },
        edges: {
            data: {},
            schema: {}
        },
        records: {
            data: {},
            schema: {}
        }
    };
    scope.filteredData = scope.dataTemplate;
    scope.Verbose = verbose || false;
    scope.fillVisSchema = function(from, to) {
        for (var key in from) {
            if (from.hasOwnProperty(key)) {
                if (Object.prototype.toString.call(from[key]) === '[object Object]') {
                    if (!to.hasOwnProperty(key)) {
                        to[key] = {};
                    }
                    scope.fillVisSchema(from[key], to[key]);
                } else if (!to.hasOwnProperty(key)) {
                    to[key] = from[key];
                }
            }
        }
    }
    scope.CreateBaseConfig = function() {
        var out = {};
        out.margins = {};
        out.dims = {};
        out.meta = configs[scope.attrs.ngIdentifier];

        if (scope.configSchema) {
            scope.fillVisSchema(scope.configSchema, out.meta);
        }

        out.margins.top = parseInt(scope.attrs.ngMarginTop) || 0;
        out.margins.right = parseInt(scope.attrs.ngMarginRight) || 0;
        out.margins.bottom = parseInt(scope.attrs.ngMarginBottom) || 0;
        out.margins.left = parseInt(scope.attrs.ngMarginLeft) || 0;
        out.dims.width = (scope.attrs.ngWidth || $(scope.element).parent().width());
        out.dims.height = (scope.attrs.ngHeight || $(scope.element).parent().height());
        out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
        out.dims.fixedHeight = out.dims.height - out.margins.top - out.margins.bottom;
        out.easySVG = function(selector, args) {
            args = args || { responsive: true };
            scope.SVGBase = d3.select(selector)
            .on("touchstart", nozoom)
            .on("touchmove", nozoom)
            .append("svg")
            .classed("canvas " + scope.attrs.ngIdentifier, true)
            .attr("background", "white")
            .attr("transform", "translate(" + (scope.config.margins.left) + "," + (scope.config.margins.top) + ")")
            if (args.responsive) {
                scope.SVGBase
                .attr("preserveAspectRatio", "none")
                .attr("viewBox", "0 0 " + out.dims.fixedWidth + " " + out.dims.fixedHeight)
                    .classed("svg-container", true) //container class to make it responsive
                    .classed("svg-content-responsive", true)
                } else {
                    scope.SVGBase
                    .attr("width", args.width || out.dims.width)
                    .attr("height", args.height || out.dims.height)
                }
                var svgg = scope.SVGBase.append("g");
                if (args.zoomable) {
                    var scaleExtent = args.zoomLevels || [1, 10]
                    scope.zoom = d3.behavior.zoom()
                    .translate([forceNetwork01.config.margins.left + forceNetwork01.config.dims.width / 2, forceNetwork01.config.margins.top + forceNetwork01.config.dims.height / 2])
                    .scaleExtent(scaleExtent)
                    .on("zoom", zoomed);

                    function nozoom() {
                            d3.event.preventDefault();
                        }
                    function zoomed() {
                        scope.SVG.attr("transform", "translate(" + scope.zoom.translate() + ")scale(" + scope.zoom.scale() + ")");
                        zoomtext.text("(" + Utilities.round(scope.zoom.scale(), 2) + "x)");
                    }
                    var btn = scope.SVGBase.selectAll(".zoombutton")
                    .data(['zoom_in', 'zoom_out'])
                    .enter()
                    .append("g")
                    var zoomtext = btn.append("text")
                    .attr("class", "zoom-level-text")
                    .text("(" + scope.zoom.scale() + "x)")
                    .attr("x", 80)
                    .attr("y", 30)

                    btn.append("rect")
                    .attr("x", function(d, i) {
                        return 10 + 35 * i
                    })
                    .attr("y", 10)
                    .attr("width", 30)
                    .attr("height", 30)
                    .attr("class", "button")
                    .attr("id", function(d) {
                        return d
                    })
                    .style("fill", function(d, i) {
                        return i ? "#D8D8D8" : "#D8D8D8"
                    })
                    .style("cursor", "pointer")
                    .style("border-radius", ".2em")
                    .on("click", function(d, i) {
                        d3.event.preventDefault();
                        var factor = (i == 0) ? 1.1 : 1 / 1.1;
                        intervalID = setInterval(zoom_by, 40, factor);
                        setTimeout(function() {
                            clearInterval(intervalID);
                            intervalID = undefined;
                        }, 50)
                    })
                    btn.append("text")
                    .attr("class", "button")
                    .attr("x", function(d, i) {
                        return 20 + 35 * i
                    })
                    .attr("y", 30)
                    .text(function(d, i) {
                        return (i == 0) ? "+" : "-"
                    })
                    .style("cursor", "pointer")
                    .on("click", function(d, i) {
                        d3.event.preventDefault();
                        var factor = (i == 0) ? 1.1 : 1 / 1.1;
                        intervalID = setInterval(zoom_by, 40, factor);
                        setTimeout(function() {
                            clearInterval(intervalID);
                            intervalID = undefined;
                        }, 50)
                    })
                    var intervalID;
                    
                    function zoom_by(factor) {
                        var scale = scope.zoom.scale(),
                        extent = scope.zoom.scaleExtent(),
                        translate = scope.zoom.translate(),
                        x = translate[0],
                        y = translate[1],
                        target_scale = scale * factor;
                    // If we're already at an extent, done
                    if (target_scale === extent[0] || target_scale === extent[1]) {
                        return false;
                    }
                    // If the factor is too much, scale it down to reach the extent exactly
                    var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
                    if (clamped_target_scale != target_scale) {
                        target_scale = clamped_target_scale;
                        factor = target_scale / scale;
                    }
                    // Center each vector, stretch, then put back
                    x = (x - out.dims.fixedWidth / 2) * factor + out.dims.fixedWidth / 2;
                    y = (y - out.dims.fixedHeight / 2) * factor + out.dims.fixedHeight / 2;
                    // Enact the zoom immediately
                    scope.zoom.scale(target_scale)
                    .translate([x, y]);
                    zoomed();
                }


                scope.SVGBase.call(scope.zoom);
            }
            if (args.background) {
                scope.SVGBase.background = scope.SVGBase.append("rect")
                .attr("width", scope.config.dims.fixedWidth)
                .attr("height", scope.config.dims.fixedHeight)
                .attr("x", 0)
                .attr("y", 0)
                .attr("fill", "white")
                .attr("opacity", "1e-24")
            }
            if (args.noG) {
                return scope.SVGBase
            }
            return svgg
        }
        out.easyLeafletMap = function(container, options, tileURL) {
            var obj = new Object();
            obj.map = L.map(container, options);
            var map = obj.map;
            var leaflet = obj;
            obj.TILE_URL = tileURL + "/{z}/{x}/{y}.png";
            obj.addTileLayer = function() {
                L.tileLayer(obj.TILE_URL, {
                    tms: false
                }).addTo(map);
                return obj;
            };
            obj.addInteractionLayer = function() {
                geojson = L.geoJson(statesData, {
                    onEachFeature: onEachFeature,
                    style: {
                        weight: 0,
                        opacity: 0,
                        fillOpacity: 0
                    }
                }).addTo(map);

                function zoomToFeature(e) {
                    var mapZoom = map.getZoom();
                    if (mapZoom <= 8 && mapZoom >= 5) {
                        map.fitBounds(e.target.getBounds());
                    } else {
                        map.zoomIn();
                    }
                }

                function onEachFeature(feature, layer) {
                    layer.on({
                        dblclick: zoomToFeature
                    });
                }
                return obj;
            };
            obj.disableInteractions = function() {
                map.dragging.disable();
                map.keyboard.disable();
                obj.disableZoom();
                return obj;
            };
            obj.disableZoom = function() {
                map.touchZoom.disable();
                map.doubleClickZoom.disable();
                map.scrollWheelZoom.disable();
                map.boxZoom.disable();
                return obj;
            };
            obj.enableInteractions = function() {
                map.dragging.enable();
                map.keyboard.enable();
                obj.enableZoom();
                return obj;
            };
            obj.enableZoom = function() {
                map.touchZoom.enable();
                map.doubleClickZoom.enable();
                map.scrollWheelZoom.enable();
                map.boxZoom.enable();
                return obj;
            };
            obj.initPopup = function() {
                //TODO: Implement obj
            };
            obj.removePopup = function() {
                map.closePopup();
            }
            obj.latLngDebug = function() {
                map.on('click', function(e) {
                    locationClicked = [e.latlng.lat, e.latlng.lng];
                    console.log(locationClicked);
                });
                return obj;
            };
            obj.marker = L.Icon.extend({
                options: {
                    iconUrl: 'images/up_arrow.svg',
                    iconSize: [0, 0],
                    shadowSize: [0, 0],
                    iconAnchor: [0, 0],
                    shadowAnchor: [0, 0],
                    popupAnchor: [0, 0]
                }
            });
            return obj;
        }
        return out;
    };
    scope.ResetVis = function() {
        if (scope.SVG) {
            scope.SVG.remove();
        }
        $(scope.element).find("svg").remove();
        scope.RunVis();
        return scope;
    };
    scope.RunEvents = function() {
        if (events[scope.attrs.ngIdentifier]) {
            events[scope.attrs.ngIdentifier](scope)
        } else {
            console.warn("No events for: " + scope.attrs.ngIdentifier)
        }
        var indent = "     ";
        if (scope.attrs.ngComponentFor != null) indent += indent;
        if (scope.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Events bound: " + scope.attrs.ngIdentifier);
        return scope;
    };

    scope.prepareData = function() {
        if (scope.attrs.ngDataField) {
            if (scope.attrs.ngComponentFor) {
                scope.filteredData = JSON.parse(JSON.stringify(window[scope.attrs.ngComponentFor].filteredData));
            } else {
                scope.filteredData = JSON.parse(JSON.stringify(scope.data));
            }
        }
        if (dataprep[scope.attrs.ngIdentifier]) {
            dataprep[scope.attrs.ngIdentifier](scope)
        } else {
            console.warn("No dataprep for: " + scope.attrs.ngIdentifier)
        }
    };
    scope.resetOnResize = function() {
        function debouncer(func, timeout) {
            var timeoutID, timeout = timeout || 200;
            return function() {
                var scope = scope,
                args = arguments;
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function() {
                    func.apply(scope, Array.prototype.slice.call(args));
                }, timeout);
            }
        }
        $(window).resize(debouncer(function(e) {
            scope.ResetVis();
        }));
        scope.isResetOnResize = true;
    }
    scope.RunVisQueue;
    scope.setQueue = function(f) {
        scope.RunVisQueue = window.setTimeout(f, 200)
    }
    scope.clearQueue = function() {
        window.clearTimeout(scope.RunVisQueue);
    }
    scope.runVisPromise;
    scope.RunVis = function(args) {
        var args = args || {};
        if (Object.keys(scope.attrs).indexOf("ngResetOnResize") >= 0) {
            if (!scope.isResetOnResize) {
                scope.resetOnResize();
            }
        }
        scope.clearQueue();
        scope.setQueue(function() {
            scope.runVisPromise = new Promise(function(resolve, reject) {
                scope.prepareData();
                resolve(resolve, reject);
            }).then(function(resolve, reject) {
                scope.VisScript(scope.element, scope.data, scope.attrs);
                try {
                    if (!scope.attrs.ngLazy || args.lazyRun) {
                        scope.VisFunc();
                        resolve();
                    }
                } catch (exception) {
                    throw exception
                    if (scope.Verbose) {
                        console.log("Visualization failed: " + scope.attrs.ngIdentifier);
                        reject();
                    }
                }

            }).then(function(resolve, reject) {
                var indent = " ";
                if (scope.attrs.ngComponentFor != null) indent += "     ";
                if (scope.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Created scope: " + scope.attrs.ngIdentifier);
                scope.RunEvents();
                scope.isFirstRun = false;
            })
        })

        return scope;
    };
    scope.setData = function(data) {
        if (data.topology) {
            if (data.topology == "graph") scope.PrimaryDataAttr = "nodes";
            if (data.topology == "table") scope.PrimaryDataAttr = "records";
        } else {
            console.warn(scope.attrs.ngDataField + ": " + "No topology set. Assuming 'records'.")
            data.topology = "table";
            scope.PrimaryDataAttr = "records";
        }
        if (!data[scope.PrimaryDataAttr].schema || data[scope.PrimaryDataAttr].schema.length == 0) {
            console.warn(scope.attrs.ngDataField + ": " + "No schema found for '" + scope.PrimaryDataAttr + "'. Attempting to guess.");
            data[scope.PrimaryDataAttr].schema = scope.guessDataSchema(data);
        }
        scope.data = Immutable.Map(data) || Immutable.Map(scope.dataTemplate);
    };
    scope.guessDataSchema = function(datain) {
        Array.prototype.unique = function() {
            var a = this.concat();
            for (var i = 0; i < a.length; ++i) {
                for (var j = i + 1; j < a.length; ++j) {
                    if (a[i] === a[j])
                        a.splice(j--, 1);
                }
            }
            return a;
        };
        var daata = datain[scope.PrimaryDataAttr].data

        var reference = daata[0];
        var refArr = Object.keys(reference);
        daata.forEach(function(d, i) {
            if (Object.keys(d).length == refArr.length) {} else {
                refArr = refArr.concat(Object.keys(d)).unique();
            }
        })
        var arr = new Array();
        refArr.forEach(function(d, i) {
            var obj = new Object();
            obj.name = d;
            obj.type = "";
            if (typeof reference[d] == "string") obj.type = "string";
            if (typeof reference[d] == "number") obj.type = "numeric";
            arr.push(obj);
        })
        return arr;
    }
    scope.Update = function() {
        scope.prepareData()
        scope.RunVis();
    }
    return scope;
};
