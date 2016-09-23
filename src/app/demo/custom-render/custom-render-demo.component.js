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
    function CustomRenderDemoComponent(elementRef, sanitizer) {
        this.elementRef = elementRef;
        this.sanitizer = sanitizer;
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    CustomRenderDemoComponent.prototype.ngAfterViewInit = function () {
        // Initialize resizable columns after everything is rendered
        this.elementRef.nativeElement.querySelector('#chk0').innerHTML = "hello";
    };
    CustomRenderDemoComponent.prototype.onEvent = function (evt) {
        console.log('cat event');
        console.log(evt);
    };
    CustomRenderDemoComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Select", dataField: "lastname",
                render: function (data, row, index) {
                    return _this.sanitizer.bypassSecurityTrustHtml("<input \n                                onclick=\"javascript: \n                                $('#debugMessage').text('" + data + "');\" type=\"checkbox\" id=\"chk" + index.toString() + "\"/>&nbsp" + data.toUpperCase());
                }
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
            template: "\n    <h2>Custom Column Rendering</h2>\n    <h3>Description</h3>\n    Features included:\n    <ul>\n        <li>Using the <strong>render</strong> property to provide a function to draw the cell</li>\n    </ul>\n    \n<ul class=\"nav nav-tabs\">\n  <li class=\"active\"><a data-toggle=\"tab\" href=\"#demoTab\">Demo</a></li>\n  <li><a data-toggle=\"tab\" href=\"#srcTab\">Code</a></li>\n</ul>    \n\n<div class=\"tab-content\">\n<div role=\"tabpanel\" class=\"tab-pane\" id=\"srcTab\">\n    <iframe class=\"code-block\" src=\"/app/demo/custom-render/code.html\"></iframe>\n</div>\n\n<div role=\"tabpanel\" class=\"tab-pane active\" id=\"demoTab\">    <tg-treegrid [treeGridDef]=\"treeDef\">\n    </tg-treegrid>\n\n    <div id=\"debugMessage\" style=\"width:500px; height:100px; border: 1px solid #ddd\">\n    Debug Message\n    </div>\n</div>\n \n </div>\n    \n    ",
            directives: [treegrid_component_1.TreeGrid],
            providers: [platform_browser_1.DomSanitizationService, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, platform_browser_1.DomSanitizationService])
    ], CustomRenderDemoComponent);
    return CustomRenderDemoComponent;
}());
exports.CustomRenderDemoComponent = CustomRenderDemoComponent;
//# sourceMappingURL=custom-render-demo.component.js.map