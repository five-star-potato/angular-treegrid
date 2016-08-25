import { Component, Directive, OnInit, ViewChild } from "@angular/core";
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser';
import { TreeGrid, TreeGridDef } from "../treegrid/treegrid.component";

@Component({
    moduleId: module.id,
    templateUrl: 'demo3.component.html',
    directives: [TreeGrid],
    providers: [DomSanitizationService, BROWSER_SANITIZATION_PROVIDERS]
})
export class Demo3Component implements OnInit {
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
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true, className: "" },
            { labelHtml: "Given<br/>name or sth", dataField: "firstname", render: (data, row, index) => { return this.sanitizer.bypassSecurityTrustHtml('<input type="checkbox" value=""/>&nbsp' + data.toUpperCase()); } },
            { labelHtml: "Lastname", dataField: "lastname", className: "tg-body-center tg-header-center" },
            { labelHtml: "Date of Birth", dataField: "dob", className: "" },
            { labelHtml: "Report To", dataField: "report_to" }];
    }
}