import { Component, Directive, OnInit, ViewChild } from "@angular/core";
import { CurrencyPipe } from '@angular/common';
import { TreeGrid, TreeGridDef, GroupConfig,  ColumnOrder, SortDirection } from "../../treegrid/treegrid.component";

@Component({
    moduleId: module.id,
    template: `
    <h2>Grouping by Columns</h2>
    <h3>Description</h3>
    Features included:
    <ul>
        <li>Grouping</li>
        <li>Aggregate</li>
    </ul>

    <ul class="nav nav-tabs">
      <li class="active"><a data-toggle="tab" href="#demoTab">Demo</a></li>
      <li><a data-toggle="tab" href="#srcTab">Code</a></li>
    </ul>    

    <div class="tab-content">
        <div role="tabpanel" class="tab-pane" id="srcTab">
            <iframe class="code-block" src="/app/demo/grouping/code.html"></iframe>
        </div>
        <div role="tabpanel" class="tab-pane active" id="demoTab">
            <tg-treegrid [treeGridDef]="treeDef">
            </tg-treegrid>
        </div>
    </div>
    `,
    directives: [TreeGrid]
})
export class GroupingDemoComponent implements OnInit {
    @ViewChild(TreeGrid)
    treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    ngOnInit() {
        this.treeDef.grouping = {
            groupByColumns: [ { columnIndex: 0, sortDirection: SortDirection.ASC }, { columnIndex: 1, sortDirection: SortDirection.ASC } ],
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
            { labelHtml: "Salary", dataField: "salary", transforms: [{ pipe: new CurrencyPipe() }] }
        ];
        this.treeDef.pageSize = 10;
    }
}