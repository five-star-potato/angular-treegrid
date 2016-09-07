import { Component, Directive, OnInit, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser';
import { TreeGrid, TreeGridDef, EditorType } from "../../treegrid/treegrid.component";
import { ComponentOutlet } from "../../treegrid/componentOutlet.component";

@Component({
    selector: 'my-modal-editor',
    template: `
<div class="modal fade" id="modalEditor" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">This is a sample modal editor</h4>
      </div>
      <div class="modal-body" *ngIf="row != null">
        <div class="form-group">
            <label>Given Name</label>
            <input type="text" class="form-control" [(ngModel)]="row['firstname']">
            <label>Family Name</label>
            <input type="text" class="form-control" [(ngModel)]="row['lastname']">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal" (click)="saveChanges()">Save changes</button>
      </div>
    </div>
  </div>
</div>
`
})
class MyModalEditor {
    @Input() row: any;
    @Output() onSave = new EventEmitter<any>();

    show(row: any) {
        var copyRow = Object.assign({}, row);
        this.row = copyRow;
        jQuery("#modalEditor").modal();
    }
    saveChanges() {
        this.onSave.emit(this.row);    
    }
}

@Component({
    moduleId: module.id,
    template: `
    <h2>Simple Table Data</h2>

    <p>{{message}}</p>
    <div *componentOutlet="html; context:self; selector:'my-dynamic-component'"></div>

    <tg-treegrid [treeGridDef]="treeGridDef" (onDblClickRow)="modalEditor.show($event)">
    </tg-treegrid>

    <my-modal-editor (onSave)="treeGrid.saveSelectedRowchanges($event)"></my-modal-editor>
    `,
    directives: [TreeGrid, MyModalEditor],
})
export class ModalEditorDemoComponent implements OnInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeGridDef: TreeGridDef = new TreeGridDef();

    @ViewChild(MyModalEditor)
    private modalEditor: MyModalEditor;

    ngOnInit() {
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
        this.treeGridDef.editor = { editorType: EditorType.MODAL };
    }
}