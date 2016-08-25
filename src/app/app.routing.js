"use strict";
var router_1 = require('@angular/router');
var home_component_1 = require('./home/home.component');
var basic_demo_component_1 = require('./demo/basic/basic-demo.component');
var ajax_load_demo_component_1 = require('./demo/ajax-load/ajax-load-demo.component');
var lazy_load_demo_component_1 = require('./demo/lazy-load/lazy-load-demo.component');
var pipes_demo_component_1 = require('./demo/pipes/pipes-demo.component');
var custom_render_demo_component_1 = require('./demo/custom-render/custom-render-demo.component');
var APP_ROUTES = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    { path: 'home', component: home_component_1.HomeComponent },
    { path: 'demo1', component: basic_demo_component_1.BasicDemoComponent },
    { path: 'demo2', component: ajax_load_demo_component_1.AjaxLoadDemoComponent },
    { path: 'demo3', component: lazy_load_demo_component_1.LazyLoadDemoComponent },
    { path: 'demo4', component: pipes_demo_component_1.PipesDemoComponent },
    { path: 'demo5', component: custom_render_demo_component_1.CustomRenderDemoComponent }
];
exports.routing = router_1.RouterModule.forRoot(APP_ROUTES);
//# sourceMappingURL=app.routing.js.map