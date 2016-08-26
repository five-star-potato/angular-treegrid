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
var platform_browser_1 = require('@angular/platform-browser');
var treegrid_component_1 = require("../../treegrid/treegrid.component");
/****************************************************************************************************************/
/* Calling ajax to retrieve children when the user click open a branch                                          */
/****************************************************************************************************************/
var LazyLoadDemoComponent = (function () {
    function LazyLoadDemoComponent(sanitizer) {
        this.sanitizer = sanitizer;
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    LazyLoadDemoComponent.prototype.ngOnInit = function () {
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetEmployees', method: "POST",
            //url: 'http://localhost:7774/api/values/GetEmployees', method: "POST",
            lazyLoad: true,
            childrenIndicatorField: 'hasChildren'
        };
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname", className: "tg-body-center tg-header-center" },
            { labelHtml: "Date of Birth", dataField: "dob", className: "" },
            { labelHtml: "Report To", dataField: "report_to" }];
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], LazyLoadDemoComponent.prototype, "treeGrid", void 0);
    LazyLoadDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: 'lazy-load-demo.component.html',
            directives: [treegrid_component_1.TreeGrid],
            providers: [platform_browser_1.DomSanitizationService, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService])
    ], LazyLoadDemoComponent);
    return LazyLoadDemoComponent;
}());
exports.LazyLoadDemoComponent = LazyLoadDemoComponent;
//# sourceMappingURL=lazy-load-demo.component.js.map