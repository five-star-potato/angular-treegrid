import { Component, Directive, OnInit, ViewChild, Pipe, PipeTransform } from "@angular/core";
import { DatePipe, UpperCasePipe, LowerCasePipe } from '@angular/common';
import { TreeGrid, TreeGridDef } from "../../treegrid/treegrid.component";

declare var hljs: any;

/****************************************************************************************************************/
/* Deomonstrate the use of Pipes in fomatting. You can chain pipes by supplying more than one pips             */
/****************************************************************************************************************/
@Pipe({name: 'MyPipe'})
export class MyPipe implements PipeTransform {
  transform(value: string, param: string): string {
    return `${value} ${param}`;
  }
}

@Component({
    moduleId: module.id,
    template: `
    <h2>Formatting with Pipes</h2>
    <h3>Description</h3>
    Features included:
    <ul>
        <li>Using built-in pipes or custom pipes to format your data</li>
    </ul>
    
<ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#demoTab">Demo</a></li>
  <li><a data-toggle="tab" href="#srcTab">Code</a></li>
</ul>    

<div class="tab-content">
<div role="tabpanel" class="tab-pane" id="srcTab">
    <iframe class="code-block" src="/app/demo/lazy-load/code.html"></iframe>
</div>

<div role="tabpanel" class="tab-pane active" id="demoTab">
    <tg-treegrid [treeGridDef]="treeDef">
    </tg-treegrid>
</div>
</div>
    `,
    directives: [TreeGrid]
})
export class PipesDemoComponent implements OnInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    ngOnInit() {
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id" },
            { labelHtml: "Given name", dataField: "firstname" },
            { labelHtml: "Family name", dataField: "lastname", transforms: [{ pipe: new LowerCasePipe() }, { pipe: new MyPipe(), param: " - eh"}] },
            { labelHtml: "Birthdate", dataField: "dob", transforms: [{ pipe: new DatePipe(), param: "yMMMMd" }, { pipe: new UpperCasePipe() }] }
        ];
        this.treeDef.data = [
            { emp_id: "102", firstname: "Tommen", lastname: "Baratheon", dob: "1970-01-12T00:00:00" },
            { emp_id: "67", firstname: "Ramsay", lastname: "Bolton", dob: "1995-02-23T00:00:00"  }
        ];
    }
}