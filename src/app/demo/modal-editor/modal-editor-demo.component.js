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
        __metadata('design:type', Object)
    ], MyModalEditor.prototype, "row", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], MyModalEditor.prototype, "onSave", void 0);
    MyModalEditor = __decorate([
        core_1.Component({
            selector: 'my-modal-editor',
            template: "\n<div class=\"modal fade\" id=\"modalEditor\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\">\n  <div class=\"modal-dialog\" role=\"document\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n        <h4 class=\"modal-title\">This is a sample modal editor</h4>\n      </div>\n      <div class=\"modal-body\" *ngIf=\"row != null\">\n        <div class=\"form-group\">\n            <label>Given Name</label>\n            <input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['firstname']\">\n            <label>Family Name</label>\n            <input type=\"text\" class=\"form-control\" [(ngModel)]=\"row['lastname']\">\n            <!--\n                <div class=\"form-group\" *ngFor=\"let dc of treeGridDef.columns\">\n                    <label for=\"exampleInputEmail1\">{{dc.labelHtml}}</label>\n                    <input type=\"text\" class=\"form-control\" [(ngModel)]=\"row[dc.dataField]\">\n                </div>\n            -->            \n        </div>\n      </div>\n      <div class=\"modal-footer\">\n        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n        <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" (click)=\"saveChanges()\">Save changes</button>\n      </div>\n    </div>\n  </div>\n</div>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], MyModalEditor);
    return MyModalEditor;
}());
var ModalEditorDemoComponent = (function () {
    function ModalEditorDemoComponent() {
        this.treeGridDef = new treegrid_component_1.TreeGridDef();
    }
    ModalEditorDemoComponent.prototype.ngOnInit = function () {
        this.treeGridDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname", className: "sample-column-class" }
        ];
        this.treeGridDef.data = [
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
        this.treeGridDef.pageSize = 10;
        this.treeGridDef.editor = { editorType: treegrid_component_1.EditorType.MODAL };
    };
    __decorate([
        core_1.ViewChild(treegrid_component_1.TreeGrid), 
        __metadata('design:type', treegrid_component_1.TreeGrid)
    ], ModalEditorDemoComponent.prototype, "treeGrid", void 0);
    __decorate([
        core_1.ViewChild(MyModalEditor), 
        __metadata('design:type', MyModalEditor)
    ], ModalEditorDemoComponent.prototype, "modalEditor", void 0);
    ModalEditorDemoComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            template: "\n    <h2>Simple Table Data</h2>\n\n    <p>{{message}}</p>\n    <div *componentOutlet=\"html; context:self; selector:'my-dynamic-component'\"></div>\n\n    <tg-treegrid [treeGridDef]=\"treeGridDef\" (onRowDblClick)=\"modalEditor.show($event)\">\n    </tg-treegrid>\n\n    <my-modal-editor (onSave)=\"treeGrid.saveSelectedRowchanges($event)\"></my-modal-editor>\n    ",
            directives: [treegrid_component_1.TreeGrid, MyModalEditor],
        }), 
        __metadata('design:paramtypes', [])
    ], ModalEditorDemoComponent);
    return ModalEditorDemoComponent;
}());
exports.ModalEditorDemoComponent = ModalEditorDemoComponent;
//# sourceMappingURL=modal-editor-demo.component.js.map