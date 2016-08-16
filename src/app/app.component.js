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
var core_2 = require("@angular/core");
var treegrid_component_1 = require("./treegrid/treegrid.component");
var simpledata_service_1 = require('./treegrid/simpledata.service');
var AppComponent = (function () {
    function AppComponent(dataService, sanitizer) {
        this.dataService = dataService;
        this.sanitizer = sanitizer;
        this.treeDef = new treegrid_component_1.TreeGridDef();
        console.log(this.dataService);
    }
    AppComponent.prototype.changeData = function (event) {
        // to show that databinding does work
        this.treeDef.data.splice(0, 5);
        this.treeGrid.refresh();
    };
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.treeDef.hierachy.foreignKeyField = "report_to";
        this.treeDef.hierachy.primaryKeyField = "emp_id";
        this.treeDef.paging = false;
        //this.treeDef.defaultOrder = [{ columnIndex: 0, sortDirection: SortDirection.DESC }];
        this.dataService.get("http://localhost:7774/api/values")
            .subscribe(function (ret) {
            console.log(ret);
            _this.treeDef.data = ret;
            _this.treeGrid.refresh();
        }, function (err) {
            console.log(err);
        });
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "column_sample_style" },
            { labelHtml: "Given<br/>name or sth", dataField: "firstname", render: function (data, row, index) { return _this.sanitizer.bypassSecurityTrustHtml('<input type="checkbox" value=""/>&nbsp' + data.toUpperCase()); } },
            { labelHtml: "Lastname", dataField: "lastname" },
            { labelHtml: "Report To", dataField: "report_to" }];
    };
    AppComponent.prototype.ngAfterViewInit = function () {
    };
    __decorate([
        core_2.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], AppComponent.prototype, "treeGrid", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n\t\t<h2>Table Test 97</h2>\n\t\t<button (click)=\"changeData($event)\">Reduce Data</button>\n\t\t<tg-treegrid [treeGridDef]=\"treeDef\">\n\t\t</tg-treegrid>\n    ",
            directives: [treegrid_component_1.TreeGrid, treegrid_component_1.SortableHeader],
            providers: [simpledata_service_1.SimpleDataService, platform_browser_1.DomSanitizationService, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS]
        }), 
        __metadata('design:paramtypes', [simpledata_service_1.SimpleDataService, platform_browser_1.DomSanitizationService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map