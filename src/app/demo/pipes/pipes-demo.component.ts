import { Component, Directive, OnInit, ViewChild, Pipe, PipeTransform, AfterViewInit, ElementRef } from "@angular/core";
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
    <pre>
        <code #code class="typescript">
/* we use this pipe to attch "- eh" at the end of <strong>value</strong> */
@Pipe(&#123;name: 'MyPipe'&#125;)
export class MyPipe implements PipeTransform &#123;
  transform(value: string, param: string): string &#123;
    return &#96;$&#123;value&#125; $&#123;param&#125;&#96;;
  &#125;
&#125;

export class PipesDemoComponent implements OnInit &#123;
    ngOnInit() &#123;
        this.treeDef.columns = [
            &#123; labelHtml: "Employee ID", dataField: "emp_id" &#125;,
            &#123; labelHtml: "Given name", dataField: "firstname" &#125;,
            &#123; labelHtml: "Family name", dataField: "lastname", transforms: [&#123; pipe: new LowerCasePipe() &#125;, &#123; pipe: new MyPipe(), param: " - eh"&#125;] &#125;,
            &#123; labelHtml: "Birthdate", dataField: "dob", transforms: [&#123; pipe: new DatePipe(), param: "yMMMMd" &#125;, &#123; pipe: new UpperCasePipe() &#125;] &#125;
        ];
        /* ... */    
    &#125;
&#125;
        </code>
     </pre>
</div>

<div role="tabpanel" class="tab-pane active" id="demoTab">
    <tg-treegrid [treeGridDef]="treeDef">
    </tg-treegrid>
</div>
</div>
    `,
    directives: [TreeGrid]
})
export class PipesDemoComponent implements OnInit, AfterViewInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    @ViewChild('code')
    codeElement: ElementRef;

    ngAfterViewInit() {
        hljs.highlightBlock(this.codeElement.nativeElement);
    }

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