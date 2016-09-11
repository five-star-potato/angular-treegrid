/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, Input, ComponentMetadata, SimpleChange, ComponentFactory, OnInit, OnChanges} from "@angular/core";
import { Pipe, PipeTransform, Injectable, Inject, Output, EventEmitter, ElementRef, HostListener, ViewChild, ViewContainerRef, AfterViewInit } from "@angular/core";
import { DataTree, DataNode } from './datatree';
import { PageNavigator, PageNumber } from './pagenav.component';
import { SimpleDataService } from './simpledata.service';
import { AjaxConfig, ColumnDef, ColumnOrder, ColumnTransform, EditorConfig, EditorType, SortDirection, TreeGridDef, TreeHierarchy } from "./treedef";

export * from './treedef';

/**
* Controls the sorting by clicking the page header
* The actual sorting the data is not done by this control. This control will fire the event to let the hosting component to handle the actual sorting.
* This component mainly handles the UI state (like updown arrows) on each column header
*/
@Directive({
    selector: '[tg-sortable-header]'
})
export class SortableHeader {
    private el: HTMLElement;
    private vc: ViewContainerRef;
    private sortDir:SortDirection = null;

    /* the actual sorting is done by the parent */
    @Output() onSort = new EventEmitter<ColumnOrder>();
    @Input('column-index') colIndex: number;
    @Input() sort: boolean;

    constructor(private e: ElementRef, private vr: ViewContainerRef) {
        this.el = e.nativeElement;
        this.vc = vr;
    }
    @HostListener('mouseenter') onMouseEnter() {
        this.highlight('#DDD');
    }
    @HostListener('mouseleave') onMouseLeave() {
        this.highlight(null);
    }
    @HostListener('click') onClick() {
        if (!this.sort) return;

        // cyling sortDir among -1,0,1
        this.sortDir = (this.sortDir == null) ? SortDirection.ASC : (this.sortDir == SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
        this.onSort.emit({ columnIndex: this.colIndex, sortDirection: this.sortDir });
        console.log('header clicked')
    }
    private highlight(color: string) {
        this.el.style.backgroundColor = color;
    }
}

@Component({
    moduleId: module.id,
    selector: 'tg-treegrid',
    template: `
			<table [class]="treeGridDef.className" data-resizable-columns-id="resizable-table">
                <colgroup>
                        <!-- providing closing tags broke NG template parsing -->    
                        <col *ngFor="let dc of treeGridDef.columns" [class]="dc.className"> 
                </colgroup>
			    <thead>
				    <tr>
					    <th (onSort)="sortColumnEvtHandler($event)" *ngFor="let dc of treeGridDef.columns; let x = index" data-resizable-column-id="#" [style.width]="dc.width" [class]="dc.className"
                            tg-sortable-header [column-index]="x" [sort]="dc.sort" [innerHTML]="dc.labelHtml" 
                                [class.tg-sortable]="treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC"
                                [class.tg-sort-asc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC"
                                [class.tg-sort-desc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC" 
                                >
                        </th>
				    </tr>
			    </thead>
				<tbody>
					<tr *ngFor="let dr of dataView; let x = index" (dblclick)="dblClickRow(dr)">
						<td *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? calcIndent(dr).toString() + 'px' : ''" [class]="dc.className">
                            <span class="tg-opened" *ngIf="y == 0 && showCollapseIcon(dr)" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span class="tg-closed" *ngIf="y == 0 && showExpandIcon(dr)" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span *ngIf="!dc.render && !dc.transforms">{{ dr[dc.dataField] }}</span>
    						<span *ngIf="dc.render != null" [innerHTML]="dc.render(dr[dc.dataField], dr, x)"></span>
                            <span *ngIf="dc.transforms" [innerHTML]="transformWithPipe(dr[dc.dataField], dc.transforms)"></span>
                        </td>

					</tr>
				</tbody>
			</table>
            <div class="row">
                <div class="loading-icon col-md-offset-4 col-md-4" style="text-align:center" [class.active]="isLoading"><i style="color:#DDD" class="fa fa-cog fa-spin fa-3x fa-fw"></i></div>
                <div class="col-md-4"><tg-page-nav style="float: right" [numRows]="numVisibleRows" [pageSize]="treeGridDef.pageSize" (onNavClick)="goPage($event)" *ngIf="treeGridDef.paging" [currentPage]="currentPage"></tg-page-nav></div>
            </div>
		    `,
    styles: [`th {
    color: brown;
}
th.tg-sortable:after { 
    font-family: "FontAwesome"; 
    opacity: .3;
    float: right;
    content: "\\f0dc";
}
th.tg-sort-asc:after { 
    font-family: "FontAwesome";
    content: "\\f0de";
    float: right;
}
th.tg-sort-desc:after { 
    font-family: "FontAwesome";
    content: "\\f0dd";
    float: right;
}
span.tg-opened, span.tg-closed {
    margin-right: 0px;
    cursor: pointer;
}
span.tg-opened:after {
    font-family: "FontAwesome";
    content: "\\f078";
}
span.tg-closed:after {
    font-family: "FontAwesome";
    content: "\\f054";
}
th.tg-header-left { 
    text-align: left;
}
th.tg-header-right { 
    text-align: right;
}
th.tg-header-center { 
    text-align: center;
}
td.tg-body-left { 
    text-align: left;
}
td.tg-body-right { 
    text-align: right;
}
td.tg-body-center { 
    text-align: center;
}

div.loading-icon  {
    opacity: 0;
    transition: opacity 2s;
}

div.loading-icon.active {
    opacity: 100;
    transition: opacity 0.1s;
}

.table-hover tbody tr:hover td, .table-hover tbody tr:hover th {
  background-color: #E8F8F5;
}
`],
    directives: [SortableHeader, PageNavigator ],
    providers: [ SimpleDataService ]
})
export class TreeGrid implements OnInit, AfterViewInit {
    private debugVar:number = 0;
    @Input()
    treeGridDef: TreeGridDef;
    @Output() 
    onRowDblClick = new EventEmitter<any>();

    @ViewChild(PageNavigator)
    private pageNav: PageNavigator;

	// dataView is what the user is seeing on the screen; one page of data if paging is enabled
    private dataView: any[];
    private dataTree: DataTree;
    private numVisibleRows: number;
    private currentPage: PageNumber = { num: 0 };
    private isLoading: boolean = false;
    private selectedRow: any;
    private sortColumnField: string;
    private sortDirection: SortDirection;
    private DEFAULT_CLASS:string = "table table-hover table-striped table-bordered";

    self = this; // copy of context

    private initalProcessed: boolean = false;
    public sortDirType = SortDirection; // workaround to NG2 issues #2885, i.e. you can't use Enum in template html as is.
    constructor(private dataService: SimpleDataService, private elementRef: ElementRef) {
        this.currentPage.num = 0;
        console.log(this.elementRef);
    }
    private sortColumnEvtHandler(event: ColumnOrder) {
        // assuming that we can only sort one column at a time;
        // clear all the sortDirection flags across columns;
        let dir: SortDirection = event.sortDirection;
        this.treeGridDef.columns.forEach((item) => {
            item.sortDirection = null;
        });
        this.treeGridDef.columns[event.columnIndex].sortDirection = event.sortDirection;
        this.sortColumnField = this.treeGridDef.columns[event.columnIndex].dataField;
        this.sortDirection = event.sortDirection;
        this.dataTree.sortByColumn(this.sortColumnField, this.sortDirection);

        this.refresh();
    }    
    calcIndent(row: any):number {
        var showExpand = this.showExpandIcon(row);
        var showCollapse = this.showCollapseIcon(row);
        var ident:number = row.__node.level * 30 + 10;

        if (showExpand)
            ident -= 17;
        else if (showCollapse)
            ident -= 21;
        return ident;
    }
    showCollapseIcon(row: any):boolean {
        if (!row.__node)
            return false;
        return (row.__node.isOpen && row.__node.childNodes.length > 0);
    }
    // test to see if the node should show an icon for opening the subtree
    showExpandIcon(row: any): boolean {
        if (!row.__node)
            return false;

        if (!row.__node.isOpen) {
            let ajax = this.treeGridDef.ajax;
            // the ajax.childrenIndicatorField indicates the column we need to check to see if his node has children (not loaded yet)
            if (ajax && ajax.childrenIndicatorField) {
                if (row[ajax.childrenIndicatorField])
                    return true;
            }
            else {
                return (row.__node.childNodes.length > 0)
            }
        }
        return false;
    } 
    refresh() {
        if (!this.initalProcessed) {
            if (this.treeGridDef.hierachy && this.treeGridDef.hierachy.primaryKeyField && this.treeGridDef.hierachy.foreignKeyField)
                this.dataTree = new DataTree(this.treeGridDef.data, this.treeGridDef.hierachy.primaryKeyField, this.treeGridDef.hierachy.foreignKeyField);
            else // data is just flat 2d table
                this.dataTree = new DataTree(this.treeGridDef.data);
            this.numVisibleRows = this.dataTree.recountDisplayCount();
            this.initalProcessed = true;
        }
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging && this.pageNav) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }

    loadAjaxData(url?: string) { // user can provide a different url to override the url in AjaxConfig
        let ajax = this.treeGridDef.ajax;
        if (ajax && (url || ajax.url)) {
            this.isLoading = true;
            if (ajax.method == "POST") {
                this.dataService.post(url ? url : ajax.url).subscribe((ret: any) => {
                    this.treeGridDef.data = ret;
                    this.refresh();
                    this.isLoading = false;
                }, (err: any) => { console.log(err) });
            }
            else {
                /*
                this.dataService.get(ajax.url).subscribe((ret: any) => {
                        this.treeGridDef.data = ret;
                        this.refresh();
                    }, (err: any) => { console.log(err) });
                */
            }
        }
    }
    ngAfterViewInit() {
        // Initialize resizable columns after everything is rendered
        let y: any;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();

        if (this.treeGridDef.paging) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }

    ngOnInit() {
        this.treeGridDef.columns.forEach((item) => {
            // can't find good ways to initialize interface
            if (item.sort == undefined)
                item.sort = true;
        });

        let ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (!ajax.doNotLoad) {
                this.loadAjaxData();
            }
        }
        else if (this.treeGridDef.data.length > 0) {
                this.refresh();
        }
        if (!this.treeGridDef.className)
            this.treeGridDef.className = this.DEFAULT_CLASS;
    }
	// Handling Pagination logic
    goPage(pn: number) {
        var sz = this.treeGridDef.pageSize;
        let rowInds: number[]; // indices of the paged data rows
        if (this.treeGridDef.paging)
            rowInds = this.dataTree.getPageData(pn, sz);
        else
            rowInds = this.dataTree.getPageData(0, -1);
        
        this.dataView = [];
        rowInds.forEach(i => 
            this.dataView.push(this.treeGridDef.data[i]));
    }

    // These few statments are needed a few times in toggleTreeEvtHandler, so I grouped them together
    private toggleTreeNode(node: DataNode) {
        this.numVisibleRows = this.dataTree.toggleNode(node);
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }
    toggleTreeEvtHandler(node: DataNode) {
        let ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (ajax.lazyLoad && !node.isLoaded) {
                this.isLoading = true;
                this.dataService.post(ajax.url + "/" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe((ret: any) => {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    node.isLoaded = true;
                    if (ret.length > 0) {
                        let startIndex = this.treeGridDef.data.length;
                        let endIndex = startIndex + ret.length - 1;
                        ret.forEach((r: any) => this.treeGridDef.data.push(r));
                        this.dataTree.addRows(startIndex, endIndex, node);
                        // The data has been sorted, the newly loaded data should be sorted as well.
                        if (this.sortColumnField) {
                            this.dataTree.sortNode(node, this.sortColumnField, this.sortDirection);
                            //this.dataTree.sortRows(startIndex, endIndex
                        }
                            
                    }
                    this.toggleTreeNode(node);
                    this.isLoading = false;
                }, (err: any) => { console.log(err) });
            }
            else
                this.toggleTreeNode(node);
        }
        else 
            this.toggleTreeNode(node);
    }
    transformWithPipe(value:any, trans:ColumnTransform[]) {
        let v:any = value;
        trans.forEach(function(t:ColumnTransform) {
            v = t.pipe.transform(v, t.param);
        })
        return v;
    }
    dblClickRow(row: any) {
        this.selectedRow = row;
        this.onRowDblClick.emit(row);
    }
    saveSelectedRowchanges(copyRow: any) {
        Object.assign(this.selectedRow, copyRow);
    }
    debugFunc() {
        this.debugVar++;
        console.log(this.debugVar);
    }

	/* event not fired when treeGridDef was changed programmatically. Is this a bug?
	http://www.bennadel.com/blog/3053-changing-directive-inputs-programmatically-won-t-trigger-ngonchanges-in-angularjs-2-beta-9.htm
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        let newTreeDef = <TreeGridDef> changes["treeGridDef"].currentValue;
        this.dataView = newTreeDef.data.slice(0);
        console.log(changes);
    }
	*/
}

