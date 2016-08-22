import { Component, Directive, ViewContainerRef, ComponentResolver, Input, ComponentMetadata, SimpleChange, ComponentFactory, ReflectiveInjector, OnInit, OnChanges} from "@angular/core";
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser'
import { Injectable, Output, EventEmitter, ViewChild, AfterViewInit } from "@angular/core";
import { TreeGrid, TreeGridDef, ColumnDef, SortableHeader } from "./treegrid/treegrid.component";
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'my-app',
    template: `
		<h2 id="testTitle">Table Test 98</h2>
        <router-outlet></router-outlet>
		<button (click)="changeData($event)">Reduce Data</button>
		<tg-treegrid [treeGridDef]="treeDef">
		</tg-treegrid>
    `,
    directives: [TreeGrid, SortableHeader],
    providers: [DomSanitizationService, BROWSER_SANITIZATION_PROVIDERS]
})
export class AppComponent implements OnInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    constructor(private sanitizer: DomSanitizationService) {
    }
    changeData(event: any) {
		// to show that databinding does work
        this.treeDef.data.splice(0, 5);
        this.treeGrid.refresh();
    }
    ngOnInit() {
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.ajax = {
            url: 'http://localhost:7774/api/values/GetAll', method: "POST",
            lazyLoad: false,
            childrenIndicatorField: 'hasChildren'
        };
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "column_sample_style" },
            { labelHtml: "Given<br/>name or sth", dataField: "firstname", render: (data, row, index) => { return this.sanitizer.bypassSecurityTrustHtml('<input type="checkbox" value=""/>&nbsp' + data.toUpperCase()); } },
            { labelHtml: "Lastname", dataField: "lastname", className: "tg-body-center tg-header-center"},
            { labelHtml: "Report To", dataField: "report_to" }];
    }
    ngAfterViewInit() {

    }
}
