var app = angular.module('app', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])

var verbose = false;
var visualizationFunctions = {};
var configs = {};
var events = {};
var dataprep = {};

app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
    var service = {
        mapDatasource: globalDatasourceMap,
        addToDatasource: function(datasource, url) {
            this.mapDatasource[datasource] = this.mapDatasource[datasource] || {};
            this.mapDatasource[datasource].data = {};
            this.mapDatasource[datasource].url = url || datasource;
            this.mapDatasource[datasource].params = this.mapDatasource[datasource].params || {};
            this.mapDatasource[datasource].queued = false;
        },
        retrieveData: function(datasource, cb) {
            if (datasource) {
                if (verbose) console.info("Getting " + datasource + " data...");
                this.mapDatasource[datasource].queued = true;
                if (!service.mapDatasource[datasource]) {
                    service.addToDatasource(datasource);
                }
                var paramList = {};
                var urlParams = service.getURLParams();
                Object.keys(service.mapDatasource[datasource].params).forEach(function(d, i) {
                    if (service.mapDatasource[datasource].params[d] == "QUERYSTRING") {
                        if (urlParams[d]) {
                            paramList[d] = urlParams[d][0];
                        }
                    } else {
                        paramList[d] = service.mapDatasource[datasource].params[d]
                    }
                })
                $http({
                    method: 'GET',
                    url: service.mapDatasource[datasource].url,
                    params: paramList,
                    dataType: 'jsonp',
                }).then(function successCallback(res) {
                    if (verbose) console.info("Got " + datasource + " data!");
                    service.mapDatasource[datasource].queued = false;
                    cb(res);
                }, function errorCallback(res) {
                    console.warn('Datasource: ' + datasource + ' not found. Check the ng-data-field attribute and the corresponding entry in /src/DatasourceMap.js (if applicable).')
                });
            }
        },
        getURLParams: function() {
            var url = location.search;
            var queryString = url || window.location.search || '';
            var keyValPairs = [];
            var params = {};
            queryString = queryString.replace(/.*?\?/, "");

            if (queryString.length) {
                keyValPairs = queryString.split('&');
                for (pairNum in keyValPairs) {
                    var key = keyValPairs[pairNum].split('=')[0];
                    if (!key.length) continue;
                    if (typeof params[key] === 'undefined')
                        params[key] = [];
                    params[key].push(keyValPairs[pairNum].split('=')[1]);
                }
            }
            return params;
        },
        getData: function(datasource, args = {}) {
            if (!service.mapDatasource[datasource]) {
                service.addToDatasource(datasource);
            }
            var currDatasource = service.mapDatasource[datasource]
            function broadcastUpdate(data) {
                if (verbose) console.info("Broadcasting: " + datasource + " updated.");
                $rootScope.$broadcast(datasource + '.update', data);
            }
            if (!service.mapDatasource[datasource].queued) {
                this.retrieveData(datasource, function(res) {
                    currDatasource.data = res.data;
                    broadcastUpdate(res.data);
                    return res.data;
                });
            }
        }
    }
    Object.keys(service.mapDatasource).map(function(d, i) {
        service.addToDatasource(d, service.mapDatasource[d].url);
    });
    return service;
}])

app.controller('ngCnsVisual', ['$rootScope', '$scope', '$element', '$attrs', 'Data', function($rootScope, $scope, elem, attrs, Data) {
    $scope.attrs = attrs;
    $scope.elem = elem;
    $scope.Visualization = new Visualization($scope, elem, attrs);
    $scope.DataService = Data
    window[attrs.ngIdentifier] = $scope;
    $scope.element = elem;
    $scope.attrs = attrs;

    var loadConfigPromise = new Promise(function(resolve, reject) {
        if (attrs.ngConfig) {
            var configObj = new Object();
            configObj['config_' + attrs.ngIdentifier] = attrs.ngConfig;
            //HeadJS has no way to handle 404s :(.
            //Just have to check if the object exists after it loads.
            head.js(configObj);

            head.ready('config_' + attrs.ngIdentifier, function() {
                if (typeof configs[attrs.ngIdentifier] == "undefined") {
                    Promise.reject(new Error("Failed to load specified config for: " + attrs.ngIdentifier + ". Visualization failed to load."))
                } else {
                    angular.element(elem).scope().configs = configs[attrs.ngIdentifier]
                    resolve();
                }
            })
        } else {
            resolve();
        }
    })

    loadConfigPromise.then(function() {
        if (attrs.ngDataField) {
            Data.getData(attrs.ngDataField)
        }
        $rootScope.$broadcast(attrs.ngIdentifier + '.created')

        if (!visualizationFunctions[attrs.ngVisType]) {
            var obj = new Object();
            obj[attrs.ngVisType] = 'visuals/' + attrs.ngVisType + '/' + attrs.ngVisType + '/' + attrs.ngVisType + '.js'
            head.js(obj);
            head.ready(attrs.ngVisType, function(d) {
                $scope.VisScript = visualizationFunctions[attrs.ngVisType];
                if (!attrs.ngDataField) {
                    $scope.RunVis();
                }
            });
        } else {
            $scope.VisScript = visualizationFunctions[attrs.ngVisType];
        }
    }).then(function() {
            $scope.updateDataSource();
    })
    $scope.switchDatasource = function(ds, args = {}) {
        $scope.$$listeners[attrs.ngDataField + '.update'] = [];
        attrs.ngDataField = ds;
        $scope.$$listeners[ds + '.update'] = [];
        $scope.updateDataSource();
        Data.getData(attrs.ngDataField, args);
    };

    $scope.updateDataSource = function() {
        $scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
            if (verbose) console.info("Updating: " + attrs.ngIdentifier);
            if (newVal !== oldVal) {
                $scope.filteredData = newVal;
                $scope.setData(newVal);
                $scope.ResetVis();
            }
        })
    }

}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
});
