/// <reference path="../../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, OnInit,  AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { BROWSER_SANITIZATION_PROVIDERS, SafeHtml, DomSanitizationService } from  '@angular/platform-browser';
import { TreeGrid, TreeGridDef } from "../../treegrid/treegrid.component";

/****************************************************************************************************************/
/* Deomonstrate custom rendering                                                                                */
/****************************************************************************************************************/
@Component({
    moduleId: module.id,
    template: `
    <h2>Custom Column Rendering</h2>
    <tg-treegrid [treeGridDef]="treeDef">
    </tg-treegrid>

    <div id="debugMessage" style="width:500px; height:200px; border: 1px solid #ddd">
    Debug Message
    </div>
    `,
    directives: [TreeGrid],
    providers: [DomSanitizationService, BROWSER_SANITIZATION_PROVIDERS]
})
export class CustomRenderDemoComponent implements OnInit, AfterViewInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    constructor(private elementRef: ElementRef, private sanitizer: DomSanitizationService) {
    }
    ngAfterViewInit() {
        // Initialize resizable columns after everything is rendered
        this.elementRef.nativeElement.querySelector('#chk0').innerHTML = "hello";
    }
    onEvent(evt:any) {
        console.log('cat event');
        console.log(evt);
    }
    ngOnInit() {
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname" },
            { labelHtml: "Select", dataField: "lastname",
                render: (data, row, index) => 
                    {   return  this.sanitizer.bypassSecurityTrustHtml(`<input 
                                onclick="javascript: 
                                $('#debugMessage').text('` + data + `');" type="checkbox" id="chk` + index.toString() + `"/>&nbsp` + data.toUpperCase()); }
                    }
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