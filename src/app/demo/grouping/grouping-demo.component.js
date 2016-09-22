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
var common_1 = require('@angular/common');
var treegrid_component_1 = require("../../treegrid/treegrid.component");
var GroupingDemoComponent = (function () {
    function GroupingDemoComponent() {
        this.treeDef = new treegrid_component_1.TreeGridDef();
    }
    GroupingDemoComponent.prototype.ngAfterViewInit = function () {
        hljs.highlightBlock(this.codeElement.nativeElement);
    };
    GroupingDemoComponent.prototype.ngOnInit = function () {
        this.treeDef.grouping = {
            groupByColumns: [{ columnIndex: 0, sortDirection: treegrid_component_1.SortDirection.ASC }, { columnIndex: 1, sortDirection: treegrid_component_1.SortDirection.ASC }],
            requireSort: true
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', method: "POST",
            lazyLoad: false
        };
        this.treeDef.columns = [
            { labelHtml: "Origin", dataField: "origin" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Salary", dataField: "salary", transforms: [{ pipe: new common_1.CurrencyPipe() }] }
        ];
        this.treeDef.pageSize = 10;
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], GroupingDemoComponent.prototype, "treeGrid", void 0);
    __decorate([
        core_1.ViewChild('code'), 
        __metadata('design:type', core_1.ElementRef)
    ], GroupingDemoComponent.prototype, "codeElement", void 0);
    GroupingDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "\n    <h2>Grouping by Columns</h2>\n    <h3>Description</h3>\n    Features included:\n    <ul>\n        <li>Grouping</li>\n        <li>Aggregate</li>\n    </ul>\n\n    <ul class=\"nav nav-tabs\">\n      <li class=\"active\"><a data-toggle=\"tab\" href=\"#demoTab\">Demo</a></li>\n      <li><a data-toggle=\"tab\" href=\"#srcTab\">Code</a></li>\n    </ul>    \n\n    <div class=\"tab-content\">\n        <div role=\"tabpanel\" class=\"tab-pane\" id=\"srcTab\">\n            <pre>\n                <code #code class=\"typescript\">        \n                </code>\n            </pre>\n        </div>\n        <div role=\"tabpanel\" class=\"tab-pane active\" id=\"demoTab\">\n            <tg-treegrid [treeGridDef]=\"treeDef\">\n            </tg-treegrid>\n        </div>\n    </div>\n    ",
            directives: [treegrid_component_1.TreeGrid]
        }), 
        __metadata('design:paramtypes', [])
    ], GroupingDemoComponent);
    return GroupingDemoComponent;
}());
exports.GroupingDemoComponent = GroupingDemoComponent;
//# sourceMappingURL=grouping-demo.component.js.map