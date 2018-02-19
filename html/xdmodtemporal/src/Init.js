var scripts = [{
  "style.css": "css/style.css"
}, {
  "svg.css": "css/svg.css"
}, {
  "opensans": "fonts/open-sans/open-sans.css"
}, {
  "jQuery": "../gui/lib/jquery/jquery-1.12.4.min.js"
}, {
  "bootstrap.min.js": "../gui/lib/bootstrap/dist/js/bootstrap.min.js"
}, {
  "d3.v3.min.js": "../gui/lib/d3.v3/d3.v3.min.js"
}, {
  "head.js": "lib/head.js"
}, {
  "immutable.js": "../gui/lib/immutablejs/immutable.js"
}, {
  "DatasourceMap.js": "src/DatasourceMap.js"
}, {
  "Utilities.js": "src/Utilities.js"
}, {
  "ion.rangeSlider.css": "../gui/lib/ionRangeSlider2/css/ion.rangeSlider.css"
}, {
  "normalize.css": "../gui/lib/ionRangeSlider2/css/normalize.css"
}, {
  "ion.rangeSlider.js": "../gui/lib/ionRangeSlider2/js/ion.rangeSlider.min.js"
},{
  "ion.rangeSlider.skinXDMoD.css": "css/ion.rangeSlider.skinXDMoD.css"
}, {
  "Visualization.js": "src/Visualization.js"
}
]

head.js(scripts);


head.ready(Object.keys(scripts[scripts.length - 2])[0], function() {
  head.ready(document, function() {
    head.js({
      "drawer.min.js": "../gui/lib/drawerjs/drawer.min.js"
    },{
      'ng-table.min.js': '../gui/lib/ng-tablejs/ng-table.min.js'
    },
    {
      'angular-material.css': '../gui/lib/angularMaterialcss/angular-material.min.css'
    },
    {
      'angular-animate.min.js': '../gui/lib/angularAnimatejs/angular-animate.min.js'
    }, {
      'angular-route.min.js': '../gui/lib/angularRoutejs/angular-route.min.js'
    }, {
      'angular-aria.min.js': '../gui/lib/angularAriajs/angular-aria.min.js'
    }, {
      'angular-messages.min.js': '../gui/lib/angularMessagesjs/angular-messages.min.js'
    },
    {
      'svg-assets-cache.js': 'lib/svg-assets-cache.js'
    },
    {
      'angular-material.js': '../gui/lib/angularMaterialjs/angular-material.min.js'
    },
    {
      'App.js': 'src/App.js'
    }, {
      'ViewControllers': 'src/ViewControllers.js'
    }, {
      'Injectors': 'src/Injectors.js'
    });
  });
});

var verbose = false;
