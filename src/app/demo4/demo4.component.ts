import { Component, Directive, OnInit, ViewChild } from "@angular/core";
import { DatePipe } from '@angular/common';
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser';
import { TreeGrid, TreeGridDef } from "../treegrid/treegrid.component";

@Component({
    moduleId: module.id,
    templateUrl: 'demo4.component.html',
    directives: [TreeGrid],
    providers: [DomSanitizationService, BROWSER_SANITIZATION_PROVIDERS]
})
export class Demo4Component implements OnInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    constructor(private sanitizer: DomSanitizationService) {
    }

    ngOnInit() {
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Birthdate", dataField: "dob", transform: { pipe: new DatePipe() } }
        ];
        this.treeDef.data = [
            { emp_id: 101, firstname: "Tommen", lastname: "Baratheon", dob: "1970-01-12T00:00:00" },
            { emp_id: 67, firstname: "Ramsay", lastname: "Bolton", dob: "1995-02-23T00:00:00"  }
        ];
    }
}