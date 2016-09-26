import { Component, Directive, OnInit, ViewChild } from "@angular/core";
import { TreeGrid, TreeGridDef } from "../../treegrid/treegrid.component";

declare var hljs: any;

@Component({
    moduleId: module.id,
    template: `
    <h2>Simple Data Setup</h2>
    <h3>Description</h3>
    Features included:
    <ul>
        <li>Table data statically defined</li>
        <li>Column Resizing</li>
        <li>Sorting</li>
        <li>Paging</li>
    </ul>

<ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#demoTab">Demo</a></li>
  <li><a data-toggle="tab" href="#srcTab">Code</a></li>
</ul>    

<div class="tab-content">
<div role="tabpanel" class="tab-pane" id="srcTab">
    <iframe class="code-block" src="/app/demo/basic/code.html"></iframe>
</div>

<div role="tabpanel" class="tab-pane active" id="demoTab">
    <tg-treegrid [treeGridDef]="treeDef">
    </tg-treegrid>
</div>
</div>
    `,
    directives: [TreeGrid]
})
export class BasicDemoComponent implements OnInit {
    @ViewChild(TreeGrid)
    treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    ngOnInit() {
        this.treeDef.filter = true;

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
    }
}