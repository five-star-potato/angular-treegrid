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
var treegrid_component_1 = require("../treegrid/treegrid.component");
var Demo2Component = (function () {
    function Demo2Component(sanitizer) {
        this.sanitizer = sanitizer;
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    Demo2Component.prototype.ngOnInit = function () {
        var _this = this;
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', method: "POST",
            //url: 'http://localhost:7774/api/values/GetEmployees', method: "POST",
            lazyLoad: false,
            childrenIndicatorField: 'hasChildren'
        };
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "column_sample_style" },
            { labelHtml: "Given<br/>name", dataField: "firstname", render: function (data, row, index) { return _this.sanitizer.bypassSecurityTrustHtml('<input type="checkbox" value=""/>&nbsp' + data.toUpperCase()); } },
            { labelHtml: "Family<br/>name", dataField: "lastname", className: "tg-body-center tg-header-center" },
            { labelHtml: "Report To", dataField: "report_to" }];
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], Demo2Component.prototype, "treeGrid", void 0);
    Demo2Component = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'demo2',
            templateUrl: 'demo2.component.html',
            directives: [treegrid_component_1.TreeGrid],
            providers: [platform_browser_1.DomSanitizationService, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService])
    ], Demo2Component);
    return Demo2Component;
}());
exports.Demo2Component = Demo2Component;
//# sourceMappingURL=demo2.component.js.map