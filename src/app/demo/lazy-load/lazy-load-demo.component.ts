import { Component, Directive, OnInit, ViewChild } from "@angular/core";
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser';
import { TreeGrid, TreeGridDef } from "../../treegrid/treegrid.component";

/****************************************************************************************************************/
/* Calling ajax to retrieve children when the user click open a branch                                          */
/****************************************************************************************************************/
@Component({
    moduleId: module.id,
    template: `
    <h2>Lazy Loading with Ajax</h2>
    <tg-treegrid [treeGridDef]="treeDef">
    </tg-treegrid>
    `,
    directives: [TreeGrid],
    providers: [DomSanitizationService, BROWSER_SANITIZATION_PROVIDERS]
})
export class LazyLoadDemoComponent implements OnInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    constructor(private sanitizer: DomSanitizationService) {
    }
    ngOnInit() {
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetEmployees', method: "POST",
            //url: 'http://localhost:7774/api/values/GetEmployees', method: "POST",
            lazyLoad: true,
            childrenIndicatorField: 'hasChildren'
        };
        this.treeDef.columns = [
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname", className: "tg-body-center tg-header-center" },
            { labelHtml: "Date of Birth", dataField: "dob", className: "" },
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "" },
            { labelHtml: "Report To", dataField: "report_to" }];
    }
}