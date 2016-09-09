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
var simpledata_service_1 = require('../../treegrid/simpledata.service');
/*
    Given the dynamic nature of modal dialog editor, it is better to leave it for the user to define the modal dialog and connect with the treegrid.
*/
var MyModalEditor = (function () {
    function MyModalEditor() {
        this.onSave = new core_1.EventEmitter();
    }
    MyModalEditor.prototype.show = function (row) {
        var copyRow = Object.assign({}, row);
        this.row = copyRow;
        jQuery("#modalEditor").modal();
    };
    MyModalEditor.prototype.saveChanges = function () {
        this.onSave.emit(this.row);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], MyModalEditor.prototype, "regions", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MyModalEditor.prototype, "row", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], MyModalEditor.prototype, "onSave", void 0);
    MyModalEditor = __decorate([
        core_1.Component({
            selector: 'my-modal-editor',
            template: "\n<div class=\"modal fade\" id=\"modalEditor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\">\n  <div class=\"modal-dialog\" role=\"document\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n        <h4 class=\"modal-title\">This is a sample modal editor</h4>\n      </div>\n      <div class=\"modal-body\" *ngIf=\"row != null\">\n        <div class=\"form-group\">\n            <label>Given Name</label>\n            <input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['firstname']\">\n            <label>Family Name</label>\n            <input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['lastname']\">\n            <label>Origin</label>\n            <select class=\"form-control\" [(ngModel)]=\"row['origin']\">\n              <option *ngFor=\"let region of regions\" value=\"{{region}}\">\n                {{region}}\n              </option>\n            </select>                \n        </div>\n      </div>\n      <div class=\"modal-footer\">\n        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n        <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" (click)=\"saveChanges()\">Save changes</button>\n      </div>\n    </div>\n  </div>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], MyModalEditor);
    return MyModalEditor;
}());
var ModalEditorDemoComponent = (function () {
    function ModalEditorDemoComponent(dataService) {
        this.dataService = dataService;
        this.treeGridDef = new treegrid_component_1.TreeGridDef();
        this.regions = [];
    }
    ModalEditorDemoComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.dataService.post("http://treegriddemoservice.azurewebsites.net/api/values/GetRegions").subscribe(function (ret) {
            _this.modalEditor.regions = ret;
        }, function (err) { console.log(err); });
        hljs.highlightBlock(this.codeElement1.nativeElement);
        hljs.highlightBlock(this.codeElement2.nativeElement);
    };
    ModalEditorDemoComponent.prototype.ngOnInit = function () {
        this.treeGridDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Origin", dataField: "origin" }
        ];
        this.treeGridDef.data = [
            { emp_id: 101, firstname: "Tommen", lastname: "Baratheon", origin: "King's Landing" },
            { emp_id: 102, firstname: "Eddard", lastname: "Stark", origin: "Winterfell" },
            { emp_id: 37, firstname: "Ros", lastname: "", origin: "King's Landing" },
            { emp_id: 42, firstname: "Bowen", lastname: "Marsh", origin: "Castle Black" },
            { emp_id: 44, firstname: "Melisandre", lastname: "", origin: "Unknown" },
            { emp_id: 45, firstname: "Pypar", lastname: "", origin: "Castle Black" },
            { emp_id: 48, firstname: "Samwell", lastname: "Tarly", origin: "Horn Hill" },
            { emp_id: 51, firstname: "Kevan", lastname: "Lannister", origin: "Casterly Rock" },
            { emp_id: 54, firstname: "Jeor", lastname: "Mormont", origin: "Bear Island" },
            { emp_id: 55, firstname: "Jorah", lastname: "Mormont", origin: "Bear Island" },
            { emp_id: 63, firstname: "Robb", lastname: "Stark", origin: "Winterfell" },
            { emp_id: 66, firstname: "Margaery", lastname: "Tyrell", origin: "The Reach" },
            { emp_id: 67, firstname: "Ramsay", lastname: "Bolton", origin: "Dreadfort" }
        ];
        this.treeGridDef.pageSize = 10;
        this.treeGridDef.editor = { editorType: treegrid_component_1.EditorType.MODAL };
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], ModalEditorDemoComponent.prototype, "treeGrid", void 0);
    __decorate([
        core_1.ViewChild('code1'), 
        __metadata('design:type', core_1.ElementRef)
    ], ModalEditorDemoComponent.prototype, "codeElement1", void 0);
    __decorate([
        core_1.ViewChild('code2'), 
        __metadata('design:type', core_1.ElementRef)
    ], ModalEditorDemoComponent.prototype, "codeElement2", void 0);
    __decorate([
        core_1.ViewChild('modalEditor'), 
        __metadata('design:type', MyModalEditor)
    ], ModalEditorDemoComponent.prototype, "modalEditor", void 0);
    ModalEditorDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "\n    <h2>Modal Dialog Editor</h2>\n    <h3>Description</h3>\n    <p>The TreeGrid library does not come with any pre-built modal dialog editor. Instead, this example provides you a way to build one yourself. The TreeGrid and the modal dialog component are decoupled. They communicate through custom events.</p>    \n    <h3>Sample Code</h3>\n    <pre>\n        <code #code1 class=\"typescript\">\n@Component(&#123;\n    selector: 'my-modal-editor',\n    template: &#96;\n&lt;div class=\"modal fade\" id=\"modalEditor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"&gt;\n  &lt;div class=\"modal-dialog\" role=\"document\"&gt;\n    &lt;div class=\"modal-content\"&gt;\n      &lt;div class=\"modal-header\"&gt;\n        &lt;button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"&gt;&lt;span aria-hidden=\"true\"&gt;&times;&lt;/span&gt;&lt;/button&gt;\n        &lt;h4 class=\"modal-title\"&gt;This is a sample modal editor&lt;/h4&gt;\n      &lt;/div&gt;\n      &lt;div class=\"modal-body\" *ngIf=\"row != null\"&gt;\n        &lt;div class=\"form-group\"&gt;\n            &lt;label&gt;Given Name&lt;/label&gt;\n            &lt;input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['firstname']\"&gt;\n            &lt;label&gt;Family Name&lt;/label&gt;\n            &lt;input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['lastname']\"&gt;\n            &lt;label&gt;Origin&lt;/label&gt;\n            &lt;select class=\"form-control\" [(ngModel)]=\"row['origin']\"&gt;\n              &lt;option *ngFor=\"let region of regions\" value=\"&#123;&#173;&#123;region&#125;&#173;&#125;\"&gt;\n                &#123;&#173;&#123;region&#125;&#173;&#125;\n              &lt;/option&gt;\n            &lt;/select&gt;                \n        &lt;/div&gt;\n      &lt;/div&gt;\n      &lt;div class=\"modal-footer\"&gt;\n        &lt;button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\"&gt;Close&lt;/button&gt;\n        &lt;button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" (click)=\"saveChanges()\"&gt;Save changes&lt;/button&gt;\n      &lt;/div&gt;\n    &lt;/div&gt;\n  &lt;/div&gt;\n&lt;/div&gt;\n&#96;\n&#125;)\nclass MyModalEditor &#123;\n    @Input() regions: string[];\n    @Input() row: any;\n    @Output() onSave = new EventEmitter&lt;any&gt;();\n\n    show(row: any) &#123;\n        var copyRow = Object.assign(&#123;&#125;, row);\n        this.row = copyRow;\n        jQuery(\"#modalEditor\").modal();\n    &#125;\n    saveChanges() &#123;\n        this.onSave.emit(this.row);    \n    &#125;\n&#125;\n        </code>\n    </pre>\n\n    <pre>\n        <code #code2 class=\"html\">\n&lt;tg-treegrid [treeGridDef]=\"treeGridDef\" (onRowDblClick)=\"modalEditor.show($event)\"&gt;&lt;/tg-treegrid&gt;\n\n&lt;my-modal-editor [regions]=\"regions\" #modalEditor (onSave)=\"treeGrid.saveSelectedRowchanges($event)\"&gt;&lt;/my-modal-editor&gt;\n        </code>\n     </pre>\n\n    <h3>Demo</h3>\n\n    <tg-treegrid [treeGridDef]=\"treeGridDef\" (onRowDblClick)=\"modalEditor.show($event)\"></tg-treegrid>\n\n    <my-modal-editor [regions]=\"regions\" #modalEditor (onSave)=\"treeGrid.saveSelectedRowchanges($event)\"></my-modal-editor>\n    ",
            directives: [treegrid_component_1.TreeGrid, MyModalEditor],
            providers: [simpledata_service_1.SimpleDataService]
        }), 
        __metadata('design:paramtypes', [simpledata_service_1.SimpleDataService])
    ], ModalEditorDemoComponent);
    return ModalEditorDemoComponent;
}());
exports.ModalEditorDemoComponent = ModalEditorDemoComponent;
//# sourceMappingURL=modal-editor-demo.component.js.map