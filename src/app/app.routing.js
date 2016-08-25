"use strict";
var router_1 = require('@angular/router');
var home_component_1 = require('./home/home.component');
var demo1_component_1 = require('./demo1/demo1.component');
var demo2_component_1 = require('./demo2/demo2.component');
var demo3_component_1 = require('./demo3/demo3.component');
var demo4_component_1 = require('./demo4/demo4.component');
var APP_ROUTES = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    { path: 'home', component: home_component_1.HomeComponent },
    { path: 'demo1', component: demo1_component_1.Demo1Component },
    { path: 'demo2', component: demo2_component_1.Demo2Component },
    { path: 'demo3', component: demo3_component_1.Demo3Component },
    { path: 'demo4', component: demo4_component_1.Demo4Component }
];
exports.routing = router_1.RouterModule.forRoot(APP_ROUTES);
//# sourceMappingURL=app.routing.js.map