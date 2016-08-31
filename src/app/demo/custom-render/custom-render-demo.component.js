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
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
var core_1 = require("@angular/core");
var platform_browser_1 = require('@angular/platform-browser');
var treegrid_component_1 = require("../../treegrid/treegrid.component");
/****************************************************************************************************************/
/* Deomonstrate custom rendering                                                                                */
/****************************************************************************************************************/
var CustomRenderDemoComponent = (function () {
    function CustomRenderDemoComponent(sanitizer) {
        this.sanitizer = sanitizer;
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    CustomRenderDemoComponent.prototype.ngAfterViewInit = function () {
        // Initialize resizable columns after everything is rendered
        // jQuery('body').on('input', 'input:checkbox', function() {
        //     jQuery('#debugMessage').text(this.id + " is clicked");
        // });
    };
    CustomRenderDemoComponent.prototype.ngOnInit = function () {
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Select", dataField: "lastname",
                componentHtml: "<p>Hello World! = {{row['emp_id']}} </p>"
            }
        ];
        this.treeDef.data = [
            { emp_id: 101, firstname: "Tommen", lastname: "Baratheon" },
            { emp_id: 102, firstname: "Eddard", lastname: "Stark" },
            { emp_id: 37, firstname: "Ros", lastname: "" },
            { emp_id: 42, firstname: "Bowen", lastname: "Marsh" },
            { emp_id: 44, firstname: "Melisandre", lastname: "" },
            { emp_id: 45, firstname: "Pypar", lastname: "" },
            { emp_id: 48, firstname: "Samwell", lastname: "Tarly" },
            { emp_id: 51, firstname: "Kevan", lastname: "Lannister" },
            { emp_id: 54, firstname: "Jeor", lastname: "Mormont" },
            { emp_id: 55, firstname: "Jorah", lastname: "Mormont" },
            { emp_id: 63, firstname: "Robb", lastname: "Stark" },
            { emp_id: 66, firstname: "Margaery", lastname: "Tyrell" },
            { emp_id: 67, firstname: "Ramsay", lastname: "Bolton" }
        ];
        this.treeDef.pageSize = 10;
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], CustomRenderDemoComponent.prototype, "treeGrid", void 0);
    CustomRenderDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: 'custom-render-demo.component.html',
            directives: [treegrid_component_1.TreeGrid],
            providers: [platform_browser_1.DomSanitizationService, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService])
    ], CustomRenderDemoComponent);
    return CustomRenderDemoComponent;
}());
exports.CustomRenderDemoComponent = CustomRenderDemoComponent;
//# sourceMappingURL=custom-render-demo.component.js.map