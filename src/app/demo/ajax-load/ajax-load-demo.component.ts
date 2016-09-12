import { Component, Directive, OnInit, ViewChild, AfterViewInit, ElementRef } from "@angular/core";
import { TreeGrid, TreeGridDef } from "../../treegrid/treegrid.component";

declare var hljs: any;

@Component({
    moduleId: module.id,
    template: `
    <h2>Loading with Ajax</h2>
    <h3>Description</h3>
    Features included:
    <ul>
        <li>Loading table with Ajax</li>
        <li>If <strong>lazyLoad</strong> is true, only the top level nodes are loaded initially; children nodes are loaded only when you expand the parent row. If it is set to false, all nodes are loaded</li>    
        <li>If <strong>doNotLoad</strong> is true, ajax will not be called initially. You can call the method <strong>TreeGrid.loadAjaxData</strong> to load the data</li>    
    </ul>
 
 <ul class="nav nav-tabs">
  <li class="active"><a data-toggle="tab" href="#demoTab">Demo</a></li>
  <li><a data-toggle="tab" href="#srcTab">Code</a></li>
</ul>    

<div class="tab-content">
<div role="tabpanel" class="tab-pane" id="srcTab">
    <pre>
        <code #code class="typescript">
@ViewChild(TreeGrid)
treeGrid: TreeGrid;
treeDef: TreeGridDef = new TreeGridDef();

ngOnInit&#40;&#41;  &#123;
    this.treeDef.hierachy = [
        foreignKeyField: "report_to", primaryKeyField: "emp_id"
    &#125;;
    this.treeDef.ajax = &#123;
        url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', 
        method: "POST",
        lazyLoad: false,
        doNotLoad: false
    &#125;;
    this.treeDef.columns = [
        &#123; labelHtml: "Employee ID", dataField: "emp_id", sort: true &#125;,
        &#123; labelHtml: "Given&lt;br/&gt;name", dataField: "firstname" &#125;,
        &#123; labelHtml: "Family&lt;br/&gt;name", dataField: "lastname", className: "tg-body-center tg-header-center" &#125;,
        &#123; labelHtml: "Report To", dataField: "report_to" &#125;
     ];
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
export class AjaxLoadDemoComponent implements OnInit, AfterViewInit {
    @ViewChild(TreeGrid)
    private treeGrid: TreeGrid;
    treeDef: TreeGridDef = new TreeGridDef();

    @ViewChild('code')
    codeElement: ElementRef;

    ngAfterViewInit() {
        hljs.highlightBlock(this.codeElement.nativeElement);
    }

    ngOnInit() {
        this.treeDef.hierachy = {
            foreignKeyField: "report_to", primaryKeyField: "emp_id"
        };
        this.treeDef.ajax = {
            url: 'http://treegriddemoservice.azurewebsites.net/api/values/GetAllEmployees', method: "POST",
            //url: 'http://localhost:7774/api/values/GetEmployees', method: "POST",
            lazyLoad: false,
            doNotLoad: false
        };
        this.treeDef.columns = [
            { labelHtml: "Employee ID", dataField: "emp_id", sort: true },
            { labelHtml: "Given<br/>name", dataField: "firstname" },
            { labelHtml: "Family<br/>name", dataField: "lastname", className: "tg-body-center tg-header-center" },
            { labelHtml: "Report To", dataField: "report_to" }];
    }
}