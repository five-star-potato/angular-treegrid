/*
import { Component, Directive, Input, Output, OnInit, OnChanges, EventEmitter} from "@angular/core";
import { TreeGridDef, ColumnDef, EditorConfig, EditorType } from './treedef';

@Component({
    selector: 'modal-dialog',
    template: `
<div class="modal fade" id="modalEditor" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">{{modalTitle}}</h4>
      </div>
      <div class="modal-body" *ngIf="row != null">
        <div class="form-group" *ngFor="let dc of treeGridDef.columns">
            <label for="exampleInputEmail1">{{dc.labelHtml}}</label>
            <input type="text" class="form-control" [(ngModel)]="row[dc.dataField]">
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
export class ModalEditor implements OnInit {
  @Input() treeGridDef: TreeGridDef;
  @Input() row: any;
  @Input('modal-title') modalTitle: string;

  @Output() onSave = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
    console.log(this.treeGridDef);
  }

  saveChanges() {
    this.onSave.emit(this.row);
  }
}
*/ 
//# sourceMappingURL=modal-editor.component.js.map