import { Component, Directive, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit, ElementRef } from "@angular/core";
import { TreeGrid, TreeGridDef, EditorType } from "../../treegrid/treegrid.component";
import { SimpleDataService } from '../../treegrid/simpledata.service';

declare var hljs: any;
/*
    Given the dynamic nature of modal dialog editor, it is better to leave it for the user to define the modal dialog and connect with the treegrid.
*/
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
            <label>Origin</label>
            <select class="form-control" [(ngModel)]="row['origin']">
              <option *ngFor="let region of regions" value="{{region}}">
                {{region}}
              </option>
            </select>                
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
    @Input() regions: string[];
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
    <h2>Modal Dialog Editor</h2>
    <h3>Description</h3>
    <p>The TreeGrid library does not come with any pre-built modal dialog editor. Instead, this example provides you a way to build one yourself. The TreeGrid and the modal dialog component are decoupled. They communicate through custom events.</p>    

<ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#demoTab">Demo</a></li>
  <li><a data-toggle="tab" href="#srcTab">Code</a></li>
</ul>    

<div class="tab-content">
<div role="tabpanel" class="tab-pane" id="srcTab">
    <iframe class="code-block" src="/app/demo/modal-editor/code.html"></iframe>
</div>

<div role="tabpanel" class="tab-pane active" id="demoTab">
    <tg-treegrid [treeGridDef]="treeGridDef" (onRowDblClick)="modalEditor.show($event)"></tg-treegrid>
    <my-modal-editor [regions]="regions" #modalEditor (onSave)="treeGrid.saveSelectedRowchanges($event)"></my-modal-editor>
</div>
</div>
    `,
    directives: [TreeGrid, MyModalEditor],
    providers: [ SimpleDataService ]
})
export class ModalEditorDemoComponent implements OnInit, AfterViewInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeGridDef: TreeGridDef = new TreeGridDef();

    @ViewChild('modalEditor')
    private modalEditor: MyModalEditor;

    regions: string[] = [];

    constructor(private dataService: SimpleDataService) {
    }

    ngAfterViewInit() {
        this.dataService.post("http://treegriddemoservice.azurewebsites.net/api/values/GetRegions").subscribe((ret: any) => {
                    this.modalEditor.regions = ret;
                }, (err: any) => { console.log(err) });
    }
    ngOnInit() {
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
            { emp_id: 42, firstname: "Bowen", lastname: "Marsh", origin: "Castle Black"},
            { emp_id: 44, firstname: "Melisandre", lastname: "", origin: "Unknown" },
            { emp_id: 45, firstname: "Pypar", lastname: "", origin: "Castle Black" },
            { emp_id: 48, firstname: "Samwell", lastname: "Tarly", origin: "Horn Hill" },
            { emp_id: 51, firstname: "Kevan", lastname: "Lannister", origin: "Casterly Rock" },
            { emp_id: 54, firstname: "Jeor", lastname: "Mormont", origin: "Bear Island" },
            { emp_id: 55, firstname: "Jorah", lastname: "Mormont", origin: "Bear Island"  },
            { emp_id: 63, firstname: "Robb", lastname: "Stark", origin: "Winterfell" },
            { emp_id: 66, firstname: "Margaery", lastname: "Tyrell", origin: "The Reach" },
            { emp_id: 67, firstname: "Ramsay", lastname: "Bolton", origin: "Dreadfort" }
        ];
        this.treeGridDef.pageSize = 10;
        this.treeGridDef.editor = { editorType: EditorType.MODAL };
    }
}