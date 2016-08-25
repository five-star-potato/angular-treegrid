/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, ComponentResolver, Input, ComponentMetadata, SimpleChange, ComponentFactory, ReflectiveInjector, OnInit, OnChanges} from "@angular/core";
import { Pipe, PipeTransform, Injectable, Inject, Output, EventEmitter, ElementRef, HostListener, ViewChild, ViewContainerRef, AfterViewInit } from "@angular/core";
import { SafeHtml } from  '@angular/platform-browser';
import { DataTree, DataNode, SortDirection } from './datatree';
import { PageNavigator, PageNumber } from './pagenav.component';
import { SimpleDataService } from './simpledata.service';

export interface ColumnOrder {
    columnIndex?: number;
    //dataField?: string; // TODO: to be implemented
    sortDirection: SortDirection;
}

/****************************
* Some settings related to AJAX. 
*****************************/
export interface AjaxConfig {
    url: string;        
    method?: string;        // POST or GET
    lazyLoad?: boolean;     // Lazy Loading means initially only the top level data rows are loaded. When the user clicks the expand button beside the rows, the corresponding children rows will then be fetched and inserted into the existing arrays of data rows
    childrenIndicatorField?: string;    // This is the data field (returned from the ajax called) to indicate whether this row has children rows that can be fetched. So that the UI knows whether to place an "expand" icon beside the row
    doNotLoad?: boolean;    // if set to true, the treeGrid will not $http intiallay. You need to call loadData() explicitly
}
/****************************
* To match children rows with parent rows, I used the metaphor like database FK and PK
****************************/
export interface TreeHierarchy {
    foreignKeyField: string;
    primaryKeyField: string;
}

export interface ColumnTransform {
    pipe: PipeTransform,
    param?: string
}
/**
* To use this treegrid control, you need to provide the TreeGridDef to the TreeGrid component - TreeGridDef contains the column definitions and other options
*/
export interface ColumnDef {
    labelHtml: string;
    dataField: string;
    width?: string;
    className?: string;
    sort?: boolean;
    sortDirection?: SortDirection;
    render?: (data: any, row: any, index: number) => SafeHtml;
    transform?: ColumnTransform;
}

export class TreeGridDef  {
    columns: ColumnDef[] = [];
    data: any[] = [];
    paging: boolean = true;
    sort: boolean = true;
    pageSize: number = 25; /* make it small for debugging */
    //currentPage: number = 0;
    defaultOrder: ColumnOrder[] = [];
    hierachy: TreeHierarchy = null;
    ajax: AjaxConfig = null;
}

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
    @Input() colIndex: number;
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
			<table class="treegrid-table table table-striped table-hover table-bordered" data-resizable-columns-id="resizable-table">
                <colgroup>
                </colgroup>
			    <thead>
				    <tr>
					    <th (onSort)="sortColumnEvtHandler($event)" *ngFor="let dc of treeGridDef.columns; let x = index" data-resizable-column-id="#" [style.width]="dc.width" [class]="dc.className"
                            tg-sortable-header [colIndex]="x" [sort]="dc.sort" [innerHTML]="dc.labelHtml" 
                                [class.tg-sortable]="treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC"
                                [class.tg-sort-asc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC"
                                [class.tg-sort-desc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC" 
                                >
                        </th>
				    </tr>
			    </thead>
				<tbody>
					<tr *ngFor="let dr of dataView; let x = index">
						<td *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? (dr.__node.level * 20 + 8).toString() + 'px' : ''" [class]="dc.className">
                            <span class="tg-opened" *ngIf="y == 0 && dr.__node.isOpen && dr.__node.childNodes.length > 0" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span class="tg-closed" *ngIf="y == 0 && testNodeForExpandIcon(dr)" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span *ngIf="!dc.render && !dc.transform">{{ dr[dc.dataField] }}</span>
    						<span *ngIf="dc.render != null" [innerHTML]="dc.render(dr[dc.dataField], dr, x)"></span>
                            <span *ngIf="dc.transform" [innerHTML]="transformWithPipe(dr[dc.dataField], dc.transform)"></span>
                        </td>

					</tr>
				</tbody>
			</table>
            <div class="row">
                <div class="loading-icon col-md-8" style="text-align:center" [class.active]="isLoading"><i style="color:#DDD" class="fa fa-cog fa-spin fa-3x fa-fw"></i></div>
                <div class="col-md-4"><tg-page-nav style="float: right" [numRows]="numVisibleRows" [pageSize]="treeGridDef.pageSize" (onNavClick)="goPage($event)" *ngIf="treeGridDef.paging" [currentPage]="currentPage"></tg-page-nav></div>
            </div>
            
		    `,
    styleUrls: ['treegrid.component.css'],
    directives: [SortableHeader, PageNavigator],
    providers: [ SimpleDataService ]
})
export class TreeGrid implements OnInit, AfterViewInit {
    @Input()
    treeGridDef: TreeGridDef;

    @ViewChild(PageNavigator)
    private pageNav: PageNavigator;

	// dataView is what the user is seeing on the screen; one page of data if paging is enabled
    private dataView: any[];
    private dataTree: DataTree;
    private numVisibleRows: number;
    private currentPage: PageNumber = { num: 0 };
    private isLoading: boolean = false;

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
        let columnName: string = this.treeGridDef.columns[event.columnIndex].dataField;

        this.dataTree.sortColumn(columnName, event.sortDirection);
        this.refresh();
    }    
    // test to see if the node should show an icon for opening the subtree
    testNodeForExpandIcon(row: any): boolean {
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

    loadAjaxData() {
        let ajax = this.treeGridDef.ajax;
        if (ajax && ajax.url) {
            this.isLoading = true;
            if (ajax.method == "POST") {
                this.dataService.post(ajax.url).subscribe((ret: any) => {
                    this.treeGridDef.data = ret;
                    this.refresh();
                    this.isLoading = false;
                }, (err: any) => { console.log(err) });
            }
            else {
                this.dataService.get(ajax.url).subscribe((ret: any) => {
                        this.treeGridDef.data = ret;
                        this.refresh();
                    }, (err: any) => { console.log(err) });
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
    }
	// Handling Pagination logic
    goPage(pn: number) {
        var sz = this.treeGridDef.pageSize;
        let rows: number[]; // indices of the paged data rows
        if (this.treeGridDef.paging)
            rows = this.dataTree.getPageData(pn, sz);
        else
            rows = this.dataTree.getPageData(0, -1);
        
        this.dataView = [];
        rows.forEach(r => this.dataView.push(this.treeGridDef.data[r]));
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
    transformWithPipe(value:any, trans:ColumnTransform) {
        return trans.pipe.transform(value);
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

