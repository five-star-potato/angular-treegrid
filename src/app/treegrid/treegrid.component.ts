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
export interface AjaxConfig {
    url: string;
    method?: string;
    lazyLoad?: boolean;
    childrenIndicatorField?: string;
}
export interface TreeHierarchy {
    foreignKeyField: string;
    primaryKeyField: string;
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
}

export class TreeGridDef  {
    columns: ColumnDef[] = [];
    data: any[] = [];
    paging: boolean = true;
    sort: boolean = true;
    pageSize: number = 10; /* make it small for debugging */
    //currentPage: number = 0;
    defaultOrder: ColumnOrder[] = [];
    hierachy: TreeHierarchy = null;
    ajax: AjaxConfig = null;
}

/**
* Controls the sorting by clicking the page header
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
                                [class.tg-sort-desc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC" >
                        </th>
				    </tr>
			    </thead>
				<tbody>
					<tr class='treegrid-tr' *ngFor="let dr of dataView; let x = index">
						<td *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? (dr.__node.level * 20 + 8).toString() + 'px' : ''" [class]="dc.className">
                            <span class="tg-opened" *ngIf="y == 0 && dr.__node.isOpen && dr.__node.childNodes.length > 0" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span class="tg-closed" *ngIf="y == 0 && testNodeForExpandIcon(dr)" (click)="toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                            <span *ngIf="dc.render == null">{{ dr[dc.dataField] }}</span>
    						<span *ngIf="dc.render != null" [innerHTML]="dc.render(dr[dc.dataField], dr, x)"></span>
                        </td>

					</tr>
				</tbody>
			</table>
            <tg-page-nav style="float: right" [numRows]="numVisibleRows" [pageSize]="treeGridDef.pageSize" (onNavClick)="goPage($event)" *ngIf="treeGridDef.paging" [currentPage]="currentPage"></tg-page-nav>
		    `,
    styles: [`
        th {
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
    `],
    directives: [SortableHeader, PageNavigator],
    providers: [ SimpleDataService ]
})
export class TreeGrid implements OnInit, AfterViewInit {
    @Input()
    treeGridDef: TreeGridDef;

    @ViewChild(PageNavigator)
    private pageNav: PageNavigator;

	// dataView is what the user is seeing on the screen; one page of data if paging is enabled
    dataView: any[];
    dataTree: DataTree;
    numVisibleRows: number;
    currentPage: PageNumber = { num: 0 };

    private initalProcessed: boolean = false;
    public sortDirType = SortDirection; // workaround to NG2 issues #2885
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
            this.dataTree = new DataTree(this.treeGridDef.data, this.treeGridDef.hierachy.primaryKeyField, this.treeGridDef.hierachy.foreignKeyField);
            this.numVisibleRows = this.dataTree.recountDisplayCount();
            this.initalProcessed = true;
        }
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }
    ngAfterViewInit() {
        // Initialize resizable columns after everything is rendered
        let y: any;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();
    }

    ngOnInit() {
        this.treeGridDef.columns.forEach((item) => {
            // can't find good ways to initialize interface
            if (item.sort == undefined)
                item.sort = true;
        });
        let ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (ajax.method == "POST") {
                this.dataService.post(ajax.url).subscribe((ret: any) => {
                    this.treeGridDef.data = ret;
                    this.refresh();
                }, (err: any) => { console.log(err) });
            }
            else {
                this.dataService.get(ajax.url).subscribe((ret: any) => {
                        this.treeGridDef.data = ret;
                        this.refresh();
                    }, (err: any) => { console.log(err) });
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
                this.dataService.post(ajax.url + "/" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe((ret: any) => {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    let startIndex = this.treeGridDef.data.length;
                    let endIndex = startIndex + ret.length - 1;
                    ret.forEach((r: any) => this.treeGridDef.data.push(r));
                    node.isLoaded = true;
                    this.dataTree.addRows(startIndex, endIndex, node);

                    this.toggleTreeNode(node);
                }, (err: any) => { console.log(err) });
            }
            else
                this.toggleTreeNode(node);
        }
        else 
            this.toggleTreeNode(node);
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

