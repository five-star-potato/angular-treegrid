"use strict";
var router_1 = require('@angular/router');
var home_component_1 = require('./demo/home/home.component');
var basic_demo_component_1 = require('./demo/basic/basic-demo.component');
var ajax_load_demo_component_1 = require('./demo/ajax-load/ajax-load-demo.component');
var lazy_load_demo_component_1 = require('./demo/lazy-load/lazy-load-demo.component');
var pipes_demo_component_1 = require('./demo/pipes/pipes-demo.component');
var custom_render_demo_component_1 = require('./demo/custom-render/custom-render-demo.component');
var modal_editor_demo_component_1 = require('./demo/modal-editor/modal-editor-demo.component');
var searching_server_side_demo_component_1 = require('./demo/searching-server-side/searching-server-side-demo.component');
var grouping_demo_component_1 = require('./demo/grouping/grouping-demo.component');
var APP_ROUTES = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: home_component_1.HomeComponent },
    { path: 'demo1', component: basic_demo_component_1.BasicDemoComponent },
    { path: 'demo2', component: ajax_load_demo_component_1.AjaxLoadDemoComponent },
    { path: 'demo3', component: lazy_load_demo_component_1.LazyLoadDemoComponent },
    { path: 'demo4', component: pipes_demo_component_1.PipesDemoComponent },
    { path: 'demo5', component: custom_render_demo_component_1.CustomRenderDemoComponent },
    { path: 'demo6', component: modal_editor_demo_component_1.ModalEditorDemoComponent },
    { path: 'demo7', component: searching_server_side_demo_component_1.SearchingServerSideDemoComponent },
    { path: 'demo8', component: grouping_demo_component_1.GroupingDemoComponent },
];
exports.routing = router_1.RouterModule.forRoot(APP_ROUTES);
//# sourceMappingURL=app.routing.js.map