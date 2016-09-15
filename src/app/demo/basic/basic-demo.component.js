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
var BasicDemoComponent = (function () {
    function BasicDemoComponent() {
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    BasicDemoComponent.prototype.ngAfterViewInit = function () {
        hljs.highlightBlock(this.codeElement.nativeElement);
    };
    BasicDemoComponent.prototype.ngOnInit = function () {
        this.treeDef.search = true;
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname", className: "sample-column-class" }
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
    ], BasicDemoComponent.prototype, "treeGrid", void 0);
    __decorate([
        core_1.ViewChild('code'), 
        __metadata('design:type', core_1.ElementRef)
    ], BasicDemoComponent.prototype, "codeElement", void 0);
    BasicDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "\n    <h2>Simple Table Data</h2>\n    <h3>Description</h3>\n    Features included:\n    <ul>\n        <li>Table data statically defined</li>\n        <li>Column Resizing</li>\n        <li>Sorting</li>\n        <li>Paging</li>\n    </ul>\n\n<ul class=\"nav nav-tabs\">\n  <li class=\"active\"><a data-toggle=\"tab\" href=\"#demoTab\">Demo</a></li>\n  <li><a data-toggle=\"tab\" href=\"#srcTab\">Code</a></li>\n</ul>    \n\n<div class=\"tab-content\">\n<div role=\"tabpanel\" class=\"tab-pane\" id=\"srcTab\">\n    <pre>\n        <code #code class=\"typescript\">\n@ViewChild(TreeGrid)\ntreeGrid: TreeGrid;\ntreeDef: TreeGridDef = new TreeGridDef();\n\nngOnInit&#40;&#41;  &#123;\n    this.treeDef.columns = [\n        &#123; labelHtml: \"Employee ID\", dataField: \"emp_id\" &#125;,\n        &#123; labelHtml: \"Given name\", dataField: \"firstname\" &#125;,\n        &#123; labelHtml: \"Family name\", dataField: \"lastname\" &#125;\n    &#125;    \n    this.treeDef.data = [\n        &#123; emp_id: 101, firstname: \"Tommen\", lastname: \"Baratheon\" &#125;,\n        &#123; emp_id: 102, firstname: \"Eddard\", lastname: \"Stark\" &#125;,\n        /* ... */\n        &#123; emp_id: 67, firstname: \"Ramsay\", lastname: \"Bolton\" &#125;\n    ];\n    this.treeDef.pageSize = 10;\n&#125;;\n        </code>\n     </pre>\n</div>\n\n<div role=\"tabpanel\" class=\"tab-pane active\" id=\"demoTab\">\n    <tg-treegrid [treeGridDef]=\"treeDef\">\n    </tg-treegrid>\n</div>\n</div>\n    ",
            directives: [treegrid_component_1.TreeGrid]
        }), 
        __metadata('design:paramtypes', [])
    ], BasicDemoComponent);
    return BasicDemoComponent;
}());
exports.BasicDemoComponent = BasicDemoComponent;
//# sourceMappingURL=basic-demo.component.js.map