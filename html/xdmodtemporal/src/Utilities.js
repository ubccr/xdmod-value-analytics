/**
 * @namespace Utilities
 * @type {Object}
 * @description Basic reusable utility functions.
 * @property {Function} round {@link Utilities.round}
 * @property {Function} format {@link Utilities.format}
 */

var Utilities = {

    /**
     * @name Utilities.chartArea
     * @description D3 layout to provide configurable axes and chart areas with only a few parameters. Allows chart visualizations to be uniform, but highly customizable. 
     */
    chartArea: function() {
        /**
         * @memberOf chartArea
         * @description Visualization instance
         */
        var network;
        /**
         * @memberOf chartArea
         * @description D3 selector. Used to attach the chart components to. 
         */
        var selector;
        /**
         * @memberOf chartArea
         * @description Display string for the X Axis
         */
        var xtitle = "X-Axis Title";
        /**
         * @memberOf chartArea
         * @description Display string for the Y Axis
         */
        var ytitle = "Y-Axis Title";
        /**
         * @memberOf chartArea
         * @description bottom or top. Changes the origin point of the graph. A bar chart with this value set to bottom will display all bars starting at the bottom of the chart area, extending upwards. A bar chart with this value set to top will display all bars starting at the top of the chart area, extending downwards. 
         */
        var xorientation = "bottom";
        /**
         * @memberOf chartArea
         * @description bottom or top. Changes the location of the X Axis title. 
         */
        var xtitleorientation = "top";
        /**
         * @memberOf chartArea
         * @description left or right. Changes the origin point of the graph. A bar chart with this value set to left will display all bars starting at the left of the chart area, extending to the right. A bar chart with this value set to right will display all bars starting at the right of the chart area, extending to the left. 
         */
        var yorientation = "left";
        /**
         * @memberOf chartArea
         * @description left or right. Changes the location of the Y Axis title.
         */
        var ytitleorientation = "right";
        /**
         * @memberOf chartArea
         * @description Scale used to create and render the X Axis. Returns a modified version of the input scale where the range has been modified to fit the chart's layout. 
         */
        var xscale = d3.scale.linear();
        /**
         * @memberOf chartArea
         * @description Scale used to create and render the Y Axis. Returns a modified version of the input scale where the range has been modified to fit the chart's layout. 
         */
        var yscale = d3.scale.linear();

        var xrange = null
        var yrange = null;
        /**
         * @memberOf chartArea
         * @description [x, y] coordinates of the start of the graph. Can be used to create partial chart areas on a visualization. Allows for user-defined offsetting and exceptions.
         */

        var originArr = [0, 0];
        /**
         * @memberOf chartArea
         * @description [x, y] coordinates of the end of the graph. Can be used to create partial chart areas on a visualization. Allows for user-defined offsetting and exceptions.
         */
        var endArr = [0, 0];
        var xorigin = [0, 0];
        var yorigin = [0, 0];

        var chartXG = null;
        var chartYG = null;

        function compute(data) {
            var width = endArr[0] - originArr[0]
            var height = endArr[1] - originArr[1]

            var chart = selector.append("g")
                .attr("class", "chart")

            chartXG = chart.append("g")
                .attr("class", "x axis")
            chartYG = chart.append("g")
                .attr("class", "y axis")

            var chartXText = chart.append("text")
                .attr("class", "x axis-text")
                .attr("text-anchor", "middle")
                .text(xtitle)
            var chartYText = chart.append("text")
                .attr("class", "y axis-text")
                .attr("text-anchor", "middle")
                .text(ytitle)

            var chartXAxis = d3.svg.axis()
                .scale(xscale)
                .orient(xorientation)
                .ticks(7, "s");
            var chartYAxis = d3.svg.axis()
                .scale(yscale)
                .orient(yorientation);

            origin = [originArr[0], originArr[1]]
            end = [endArr[0], endArr[1]]
            var offset = 25;
            if (xorientation == "top") {
                end[0] -= offset;
                origin[1] += offset;
            }
            if (xorientation == "bottom") {
                end[0] -= offset;
                end[1] -= offset;
            }
            if (yorientation == "left") {
                origin[0] += offset;
            }
            if (yorientation == "right") {
                end[0] -= offset
            }
            if (xtitleorientation == "top") {
                origin[1] += offset;
                chartXText.attr("transform", "translate(" + (width / 2 + originArr[0]) + ", " + ((offset / 2) + originArr[1]) + ")")
            }
            if (xtitleorientation == "bottom") {
                end[1] -= offset * 1.5;
                chartXText.attr("transform", "translate(" + (width / 2 + originArr[0]) + ", " + ((height + originArr[1]) - (offset / 2)) + ")")
            }
            if (ytitleorientation == "left") {
                origin[0] += offset * 2.5
                chartYText.attr("transform", "rotate(270)translate(" + (-height / 2 - originArr[1]) + ", " + ((offset / 2) + originArr[1]) + ")")
            }
            if (ytitleorientation == "right") {
                end[0] -= offset * 1.5
                chartYText.attr("transform", "rotate(-270)translate(" + (height / 2 + originArr[1]) + "," + (-width + (offset / 2) - originArr[1]) + ")")
            }


            xscale.range(xrange || [0, end[0] - origin[0]])
            yscale.range(yrange || [0, end[1] - origin[1]])

            chartXAxis.tickSize(-d3.max(yscale.range()))


            xorigin = [origin[0], origin[1]];
            yorigin = [origin[0], origin[1]];
            if (xorientation == "bottom") {
                xorigin[1] = end[1]
            }
            if (yorientation == "right") {
                yorigin[0] = end[0]
            }



            chartXG.attr("transform", "translate(" + xorigin + ")").call(chartXAxis).selectAll("g").filter(function(d) { return d; })
                .classed("minor", true);
            chartYG.attr("transform", "translate(" + yorigin + ")").call(chartYAxis).selectAll("g").filter(function(d) { return d; })
                .classed("minor", true);



        }
        compute.chartXG = function(s) {
            if (!arguments.length) return chartXG;
            chartXG = s;
            return this;
        }
        compute.chartYG = function(s) {
            if (!arguments.length) return chartYG;
            chartYG = s;
            return this;
        }
        compute.network = function(s) {
            if (!arguments.length) return network;
            network = s;
            return this;
        }
        compute.selector = function(s) {
            if (!arguments.length) return selector;
            selector = s;
            return this;
        }
        compute.xtitle = function(t, o) {
            if (!arguments.length) return xtitle;
            xtitle = t;
            xtitleorientation = o;
            return this;
        }
        compute.ytitle = function(t, o) {
            if (!arguments.length) return ytitle;
            ytitle = t;
            ytitleorientation = o;
            return this;
        }
        compute.xorientation = function(s) {
            if (!arguments.length) return xorientation;
            xorientation = s;
            return this;
        }
        compute.yorientation = function(s) {
            if (!arguments.length) return yorientation;
            yorientation = s;
            return this;
        }
        compute.xscale = function(s) {
            if (!arguments.length) return xscale;
            xscale = s;
            return this;
        }
        compute.yscale = function(s) {
            if (!arguments.length) return yscale;
            yscale = s;
            return this;
        }
        compute.xrange = function(s) {
            if (!arguments.length) return xrange;
            xrange = s;
            return this;
        }
        compute.yrange = function(s) {
            if (!arguments.length) return yrange;
            yrange = s;
            return this;
        }
        compute.origin = function(s) {
            if (!arguments.length) return origin;
            originArr = s;
            return this;
        }
        compute.end = function(s) {
            if (!arguments.length) return end;
            endArr = s;
            return this;
        }
        compute.xorigin = function(s) {
            if (!arguments.length) return xorigin;
            xorigin = s;
            return this;
        }
        compute.yorigin = function(s) {
            if (!arguments.length) return yorigin;
            yorigin = s;
            return this;
        }
        return compute;
    },

    /**
     * @memberOf Utilities
     * @function round
     * @description Rounds n to p positions.
     * @param {Number} n Number to round.
     * @param {Number} p Precision.
     * @returns {Number} Rounded number.
     */
    round: function(n, p) {
        var prec = Math.pow(10, p);
        return Math.round(n * prec) / prec;
    },
    /**
     * @memberOf Utilities
     * @function format
     * @description Formats numbers to thousands, millions, billions, and trillions.
     * @param {Number} n Number to format.
     * @returns {String} Formatted number.
     */
    format: function(n) {
        var base = Math.floor(Math.log(Math.abs(n)) / Math.log(1000));
        var suffix = 'KMBT' [base - 1];
        return suffix ? Utilities.round(n / Math.pow(1000, base), 2) + suffix : '' + n;
    },

    formatValue: {
        "": function(d) {
            return d;
        },
        "currency": function(amount, sign) {
            var currencySign = sign || "c";
            if (amount) {
                if (amount < 0) {
                    currencySign = "-" + currencySign;
                }
                amt = Math.abs(amount);

                if (amt < 1000) {
                    return sign + amt;
                }
                if (amt / 1000000000 >= 1) {
                    return sign + (amt / 1000000000).toFixed(amt % 1000000000 != 0) + 'B';
                }
                if (amt / 1000000 >= 1) {
                    return sign + (amt / 1000000).toFixed(amt % 1000000 != 0) + 'M';
                }
                return sign + (amt / 1000).toFixed(amt % 1000 != 0) + 'K';
            }
            return sign + "0";
        },
        "currencyEU": function(amount) {
            return this.currency(amount, "£");
        },
        "currencyUS": function(amount) {
            return this.currency(amount, "$");
        },
        "number": function(num) {
            num += '';
            x = num.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        "toTitleCase": function(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },
        "truncate": function(str, allowLength) {
            if (str.length > allowLength) {
                str = str.substr(0, allowLength - 3) + "...";
            }
            return str;
        }
    },
    /**
     * @memberOf Utilities
     * @function parseDateUTC
     * @description Special date formatter. Fixes issues with Firefox date formatting.
     * @param {String} d Date to parse.
     * @returns {Date} Parsed date.
     */
    parseDateUTC: function(d) {
        var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
        var parts = reg.exec(d);
        return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null;
    },
    /**
     * @memberOf Utilities
     * @function removeCharactersFromString
     * @description Removes all non-numeric characters from a string.
     * @param {String} str String to clean.
     * @returns {Number} Extracted number.
     */

    removeCharactersFromString: function(str) {
        return parseInt(str.replace(/\D/g, ''));
    },
    svgAddDefs: function(svg) {
        svg.append("defs").selectAll("marker")
            .enter().append("marker")
            .attr("id", function(d) {
                return d;
            })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
            .style("stroke", "#4679BD")
            .style("opacity", "0.6");
    },
    runJSONFuncs: function(o, args) {
        for (var i in o) {
            if (o[i] !== null && typeof(o[i]) == "object") this.runJSONFuncs(o[i], args);
            if (typeof o[i] == "function") o[i] = o[i](args);
        };
    },
    applyEventToElement: function(id, event, func) {
        try {
            document.getElementById(id)[event] = null;
            document.getElementById(id)[event] = func;
        } catch (exception) {
            console.log("Cannot bind: " + func.name + " to: " + id + "." + event);
        }

    },
    applyEventToElements: function(arr) {
        var that = this;
        arr.forEach(function(d) {
            that.applyEventToElement(d.id, d.event, d.func);
        });
    },
    //TODO: Update to allow options
    lineFunction: d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        }).interpolate("bundle").tension(1),
        // }).interpolate("basis"),
    makeDynamicScale: function(data, attr, scaleType, range) {
        var fullDomain = [];
        var rangeCalc;
        if (attr == "") {
            rangeCalc = d3.extent(data);
        } else {
            rangeCalc = d3.extent(data, function(d) {
                return d[attr]
            });
        }
        var tempScale = d3.scale.linear()
            .domain([1, range.length])
            .range(rangeCalc);
        for (var i = 1; i <= range.length; i++) {
            fullDomain.push(tempScale(i));
        }
        return d3.scale[scaleType]()
            .domain(fullDomain)
            .range(range);
    },
    makeDynamicScaleNew: function(domain, range, scaleType) {
        var domain = domain;
        if (domain.length != range.length) {
            if (domain.length != 2) {
                console.warn("'domain' should either contain two values or be the same length as 'range'.");
                console.warn("Using the extent of the scale. This may provide undesired results.");
                domain = d3.extent(domain);
            }
        }
        var domainMap = d3.scale.linear()
            .domain([0, range.length - 1])
            .range(domain)
        var newDomain = [];
        for (var i = 0; i < range.length; i++) {
            newDomain.push(domainMap(i))
        }
        return d3.scale[scaleType || "linear"]()
            .domain(newDomain)
            .range(range);
    }
}

applyIEFixes();
/**
 * @namespace  Shims/Polyfills
 */

/**
 * @name Shims/Polyfills.applyIEFixes
 * @type       {function}
 * @description Provides missing functionality for legacy Internet Explorer versions
 */
function applyIEFixes() {
    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement('style');
        msViewportStyle.appendChild(
            document.createTextNode(
                '@-ms-viewport{width:auto!important}'
            )
        );
        document.getElementsByTagName('head')[0].appendChild(msViewportStyle);
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(fn, scope) {
            for (var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope, this[i], i, this);
            }
        };
    }

    // Production steps of ECMA-262, Edition 5, 15.4.4.19
    // Reference: http://es5.github.com/#x15.4.4.19
    if (!Array.prototype.map) {
        Array.prototype.map = function(callback, thisArg) {

            var T, A, k;

            if (this === null) {
                throw new TypeError(" this is null or not defined");
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== "function") {
                throw new TypeError(callback + " is not a function");
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (thisArg) {
                T = thisArg;
            }

            // 6. Let A be a new array created as if by the expression new Array(len) where Array is
            // the standard built-in constructor with that name and len is the value of len.
            A = new Array(len);

            // 7. Let k be 0
            k = 0;

            // 8. Repeat, while k < len
            while (k < len) {

                var kValue, mappedValue;

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Let mappedValue be the result of calling the Call internal method of callback
                    // with T as the this value and argument list containing kValue, k, and O.
                    mappedValue = callback.call(T, kValue, k, O);

                    // iii. Call the DefineOwnProperty internal method of A with arguments
                    // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
                    // and false.

                    // In browsers that support Object.defineProperty, use the following:
                    // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

                    // For best browser support, use the following:
                    A[k] = mappedValue;
                }
                // d. Increase k by 1.
                k++;
            }

            // 9. return A
            return A;
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fun /*, thisArg*/ ) {
            'use strict';

            if (this === void 0 || this === null) {
                throw new TypeError();
            }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function') {
                throw new TypeError();
            }

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];

                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }


    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement("style");
        msViewportStyle.appendChild(
            document.createTextNode(
                "@-ms-viewport{width:auto!important}"
            )
        );
        document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
    }

    // Some older browsers error out because console is not a variable...Seriosuly. I wrote this in February...far from the first of April.
    if (!window.console) {
        console = {};
        console.log = function() {};
    }

    String.prototype.replaceAll = function(find, replace) {
        return this.replace(new RegExp(find, 'g'), replace);
    };
}


/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
applyWatchFunctions();
/**
 * @name Shims/Polyfills.applyWatchFunctions
 * @type       {function}
 * @description Adds watch and unwatch functions. 
 */
function applyWatchFunctions() {

    if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function(prop, handler) {
                var
                    oldval = this[prop],
                    newval = oldval,
                    getter = function() {
                        return newval;
                    },
                    setter = function(val) {
                        oldval = newval;
                        return newval = handler.call(this, prop, oldval, val);
                    };

                if (delete this[prop]) { // can't watch constants
                    Object.defineProperty(this, prop, {
                        get: getter,
                        set: setter,
                        enumerable: true,
                        configurable: true
                    });
                }
            }
        });
    }

    // object.unwatch
    if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function(prop) {
                var val = this[prop];
                delete this[prop]; // remove accessors
                this[prop] = val;
            }
        });
    }
}

//TODO: Extract this
//http://stackoverflow.com/questions/24784302/wrapping-text-in-d3
function wrap(text, width, actualText) {
    text.each(function() {
        var text = d3.select(this),
            words = actualText.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", "1.6em")
                    .text(word);
            }
        }
    });
}


applyD3Prototypes();
/**
 * @name Shims/Polyfills.applyD3Prototypes
 * @type       {function}
 * @description Adds utility D3 selection protoypes.
 */
function applyD3Prototypes() {
    /**
     * @memberOf applyD3Prototypes
     * @function moveToFront
     * @description Brings D3 selection to the front of the heirarchy, rendering the selected objects in front of everything else in the same container.
     * @param {Array} sel Selected D3 elements.
     * @returns {Array} Selected D3 elements.
     */
    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };
    /**
     * @memberOf applyD3Prototypes
     * @function selectAllToleranceFiltered
     * @description Selects all elements from selection with the "filtered" property.
     * @param {Array} sel Selected D3 elements.
     * @param {Boolean} invert Toggle to determine whether to select all "filtered" or un-"filtered" items from selection.
     * @returns {Array} Selected D3 elements.
     */
    d3.selection.prototype.selectAllToleranceFiltered = function(invert) {
        return this.filter(function() {
            var isFiltered = d3.select(this).property("filtered");
            if (invert) {
                return !isFiltered;
            }
            return isFiltered;
        });
    };
    /**
     * @memberOf applyD3Prototypes
     * @function applyToleranceFilter
     * @description Stops rendering all elements from selection with the "filtered" property.
     * @param {Array} sel Selected D3 elements.
     * @returns {Array} Selected D3 elements.
     */
    d3.selection.prototype.applyToleranceFilter = function() {
        return this.each(function() {
            var curr = d3.select(this);
            curr.property("filtered", true);
            return curr.classed("filtered", true).style("display", "none");
        });
    };

    /**
     * @memberOf applyD3Prototypes
     * @function removeToleranceFilter
     * @description Renders all elements from selection with the "filtered" property.
     * @param {Array} sel Selected D3 elements.
     * @returns {Array} Selected D3 elements.
     */
    d3.selection.prototype.removeToleranceFilter = function() {
        return this.each(function() {
            var curr = d3.select(this);
            curr.property("filtered", false);
            return curr.classed("filtered", false).style("display", "block");
        });
    };
    /**
     * @memberOf applyD3Prototypes
     * @function mergeSelections
     * @description Merges two D3 selections into one select.
     * @param {Array} sel Selected D3 elements.
     * @returns {Array} select Other selection to merge. 
     */
    d3.selection.prototype.mergeSelections = function(select) {
        var merged = this;
        select.each(function() {
            merged[0].push(d3.select(this).node());
        });
        return merged;
    };
}


