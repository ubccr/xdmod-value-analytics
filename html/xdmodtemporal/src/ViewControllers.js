app.controller('CheckboxCtrl', function($scope, $attrs) {
    $scope.title = $attrs.ngTitle || "Checkbox";
    $scope.template = { name: "checkbox.html", url: "partials/checkbox.html" }
    $scope.items = [];
    $scope.allowSelectAll = true;
    if ($attrs.ngValues) {
        $scope.items = $attrs.ngValues.replaceAll(" ", "").split(",");
    }

    $scope.selected = [$scope.items[0]];
    $scope.radio = $attrs.ngRadio;
    $scope.toggle = function(item, list) {
        if ($scope.radio) {
            $scope.selected = [item];
        }

        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    };
    $scope.updateTitle = function(title) {
        $scope.$apply(function() {
            $scope.title = title;
        })
        return true;
    }
    $scope.populateList = function(list) {
        $scope.$apply(function() {
            $scope.items = list;
            $scope.selected = [list[0]];
        })
        return true;
    }
    $scope.exists = function(item, list) {
        return list.indexOf(item) > -1;
    };
    $scope.isIndeterminate = function() {
        return ($scope.selected.length !== 0 &&
            $scope.selected.length !== $scope.items.length);
    };
    $scope.isChecked = function() {
        return $scope.selected.length === $scope.items.length;
    };

    $scope.selectAll = function() {
        $scope.$apply(function() {
            $scope.selected = $scope.items.slice(0);
        })
        return true;
    }
    $scope.deselectAll = function() {
        $scope.$apply(function() {
            $scope.selected = [];
        })
        return true;
    }

    $scope.toggleAll = function() {
        if ($scope.selected.length === $scope.items.length) {
            $scope.selected = [];
        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
            $scope.selected = $scope.items.slice(0);
        }
    };
}).controller('SideNavCtrl', function($scope, $timeout, $mdSidenav, $log) {
    $scope.toggleLeft = buildDelayedToggler('left');

    function debounce(func, wait, context) {
        var timer;

        return function debounced() {
            var context = $scope,
            args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    function buildDelayedToggler(navID) {
        return debounce(function() {
            $mdSidenav(navID).toggle();
        }, 200);
    }

    function buildToggler(navID) {
        return function() {
            $mdSidenav(navID).toggle();
        }
    }
})
.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function() {
        $mdSidenav('left').close();
    };
}).config(function($mdThemingProvider) {

    var customBackground = {
        '50': "#ffffff",
        '100': "#ecb1d0",
        '200': "#ff0000",
        '300': "#d080aa",
        '400': "#bc6894",
        '500': "#a3507b",
        '600': '#000000',
        '700': '#000000',
        '800': '#000000',
        '900': '#000000',
        'A100': "#f7f7f7",
        'A200': "#181818",
        'A400': "#000000",
        'A700': "#000000",
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)
        };

        var customPrimary = {
            '50': '#626262',
            '100': '#555555',
            '200': '#484848',
            '300': '#3b3b3b',
            '400': '#ffffff',
            '500': '#222222',
            '600': '#ffffff',
            '700': '#080808',
            '800': '#000000',
            '900': '#000000',
            'A100': '#FF0000',
            'A200': '#7b7b7b',
            'A400': '#888888',
            'A700': '#000000',
            'contrastDefaultColor': 'light', // whether, by default, text (contrast)

        };
        $mdThemingProvider
        .definePalette('customPrimary',
            customPrimary);

        var customAccent = {
            '50': '#3b5319',
            '100': '#48671f',
            '200': '#567b24',
            '300': '#648e2a',
            '400': '#72a230',
            '500': '#ffffff',
            '600': '#99cc53',
            '700': '#a4d266',
            '800': '#b0d77a',
            '900': '#bcdd8e',
            'A100': '#99cc53',
            'A200': '#8dc63f',
            'A400': '#80b636',
            'A700': '#c7e3a1'
        };
        $mdThemingProvider
        .definePalette('customAccent',
            customAccent);

        var customWarn = {
            '50': '#000000',
            '100': '#ffa266',
            '200': '#ff934d',
            '300': '#ff8333',
            '400': '#ff741a',
            '500': '#ff6400',
            '600': '#e65a00',
            '700': '#cc5000',
            '800': '#b34600',
            '900': '#993c00',
            'A100': '#ffc199',
            'A200': '#ffd1b3',
            'A400': '#ffe0cc',
            'A700': '#803200'
        };
        $mdThemingProvider
        .definePalette('customWarn',
            customWarn);

        $mdThemingProvider
        .definePalette('customBackground',
            customBackground);

        $mdThemingProvider.theme('default')
        .backgroundPalette('customBackground')
        .warnPalette('customWarn')
        .accentPalette('customAccent')
        .primaryPalette('customPrimary')
    })
.controller('ToastCtrl', function($scope, $mdToast, $mdDialog) {
    $scope.template = '<md-toast id="toast"><span class="md-toast-text" flex><h2>%d</h2><h4>%d</h4></span><md-button class="md-highlight" ng-click="closeToast()">Close</md-button></md-toast>';
    $scope.content = "";
    $scope.showCustomToast = function() {
        $mdToast.show({
            hideDelay: 0,
            position: 'bottom left',
            controller: 'ToastCtrl',
            template: $scope.template
        });
    };
    $scope.setTemplateText = function(text) {
        $scope.$apply(function() {
            $scope.template = text;
        })
    }
    $scope.openMoreInfo = function(e) {
        if (isDlgOpen) return;
        isDlgOpen = true;
        $mdDialog
        .show($mdDialog
            .alert()
            .title('More info goes here.')
            .textContent('Something witty.')
            .ariaLabel('More info')
            .ok('Got it')
            .targetEvent(e)
            )
        .then(function() {
            isDlgOpen = false;
        })
    };
    $scope.closeToast = function() {
        if (isDlgOpen) return;
        $mdToast
        .hide()
        .then(function() {
            isDlgOpen = false;
        });

    }

})
.controller("basicCtrl", ["$scope", 'smart-table', function($scope, smarttable) {
    $scope.rowCollection = [];
    $scope.setrowCollection = function(d) {
        $scope.rowCollection = d;
        $scope.displayedCollection = [].concat($scope.rowCollection);
    }
    $scope.setitemsByPage = function(d) {
        $scope.itemsByPage = d;
    }
    $scope.itemsByPage = 10;
    $scope.removeItem = function removeItem(row) {
        var index = $scope.rowCollection.indexOf(row);
        if (index !== -1) {
            $scope.rowCollection.splice(index, 1);
        }
    }

    $scope.filter = function(val) {
        val = val || ''
        $scope.displayedCollection = [];
        $scope.rowCollection.forEach(function(d, i) {
            var include = false;

            Object.keys(d).forEach(function(d1, i1) {
                if (d[d1].toString().toLowerCase().indexOf(val.toString().toLowerCase()) >= 0) {
                    include = true;
                }
            })
            if (include) {
                $scope.displayedCollection.push(d)
            }
        })
    }

}])
.filter('myFilter', [function() {
    return function(array, expression) {
        return array.filter(function(val, index) {
            return val > val;
        });
    }
}]);

var isDlgOpen;
