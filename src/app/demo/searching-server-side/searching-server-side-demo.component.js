"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var treegrid_component_1 = require("../../treegrid/treegrid.component");
var SearchingServerSideDemoComponent = (function () {
    function SearchingServerSideDemoComponent() {
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    SearchingServerSideDemoComponent.prototype.ngOnInit = function () {
        this.treeDef.pageSize = 10;
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.filter = {
            url: "http://treegriddemoservice.azurewebsites.net/api/values/Search",
            method: "POST"
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetEmployees',
            method: "POST",
            lazyLoad: true,
            childrenIndicatorField: 'hasChildren'
        };
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", filterable: false },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Origin", dataField: "origin" }];
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], SearchingServerSideDemoComponent.prototype, "treeGrid", void 0);
    SearchingServerSideDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "\n    <h2>Server-side Search</h2>\n    <h3>Description</h3>\n    Features included:\n    <ul>\n        <li>Using server-side logic to filter data</li>\n    </ul>\n    \n<ul class=\"nav nav-tabs\">\n  <li class=\"active\"><a data-toggle=\"tab\" href=\"#demoTab\">Demo</a></li>\n  <li><a data-toggle=\"tab\" href=\"#srcTab\">Code</a></li>\n</ul>    \n\n<div class=\"tab-content\">\n<div role=\"tabpanel\" class=\"tab-pane\" id=\"srcTab\">\n    <iframe class=\"code-block\" src=\"/app/demo/searching-server-side/code.html\"></iframe>\n</div>\n\n<div role=\"tabpanel\" class=\"tab-pane active\" id=\"demoTab\">\n    <tg-treegrid [treeGridDef]=\"treeDef\">\n    </tg-treegrid>\n</div>\n</div>\n    ",
            directives: [treegrid_component_1.TreeGrid]
        }), 
        __metadata('design:paramtypes', [])
    ], SearchingServerSideDemoComponent);
    return SearchingServerSideDemoComponent;
}());
exports.SearchingServerSideDemoComponent = SearchingServerSideDemoComponent;
//# sourceMappingURL=searching-server-side-demo.component.js.map