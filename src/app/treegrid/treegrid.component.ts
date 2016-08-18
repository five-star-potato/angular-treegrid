/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, ComponentResolver, Input, ComponentMetadata, SimpleChange, ComponentFactory, ReflectiveInjector, OnInit, OnChanges} from "@angular/core";
import { Pipe, PipeTransform, Injectable, Inject, Output, EventEmitter, ElementRef, HostListener, ViewChild, ViewContainerRef, AfterViewInit } from "@angular/core";
import { SafeHtml } from  '@angular/platform-browser';
import { DataTree, DataNode, SortDirection } from './datatree';

interface PageNumber {
    num: number;
}
export interface ColumnOrder {
    columnIndex?: number;
    //dataField?: string; // TODO: to be implemented
    sortDirection: SortDirection;
}

export class TreeHierarchy {
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
    hierachy: TreeHierarchy = new TreeHierarchy();
}

/**
 * Page navigation control at the bottom
 */
@Component({
    selector: 'tg-page-nav',
    template: `
		<ul class="pagination">
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="goPage(0)" aria-label="First">
				<span aria-hidden="true">&laquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num <= 0">
				<a href="javascript:void(0)" (click)="goPrev()" aria-label="Previous">
				<span aria-hidden="true">&lsaquo;</span>
				</a>
			</li>

			<li [class.disabled]="true">
				<a href="javascript:void(0)" aria-label="">
				<span aria-hidden="true">Page {{currentPage.num + 1}} of {{numPages}}</span>
				</a>
			</li>

			<li></li>

			<li [class.disabled]="currentPage.num >= numPages - 1">
				<a href="javascript:void(0)" (click)="goNext()" aria-label="Previous">
				<span aria-hidden="true">&rsaquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage.num >= numPages - 1">
				<a href="javascript:void(0)" (click)="goPage(numPages - 1)" aria-label="Previous">
				<span aria-hidden="true">&raquo;</span>
				</a>
			</li>
		</ul>
    `
})
export class PageNavigator implements OnChanges {
    numPages: number;
    @Input() pageSize: number;
    @Input() numRows: number;
    @Input() currentPage: PageNumber;
    // fire the event when the user click, let the parent handle refreshing the page data
    @Output() onNavClick = new EventEmitter<number>();
    @Output() onResetCurrent = new EventEmitter<number>();

    refresh() {
        this.numPages = Math.ceil(this.numRows / this.pageSize);
        if (this.numPages > 0)
            if (this.currentPage.num >= this.numPages) { // is somehow current page is no longer valid, move the pointer the last page
                this.currentPage.num = this.numPages = -1;
        }
    }
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.refresh();
        let chng = changes["numRows"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
    }

    goPage(pn: number) {
        this.currentPage.num = pn;
        this.onNavClick.emit(pn);
    }
    goPrev() {
        if (this.currentPage.num > 0)
            this.currentPage.num -= 1;
        this.onNavClick.emit(this.currentPage.num);
    }
    goNext() {
        if (this.currentPage.num < (this.numPages - 1))
            this.currentPage.num += 1;
        this.onNavClick.emit(this.currentPage.num);
    }
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
			    <thead>
				    <tr>
					    <th (onSort)="sortColumn($event)" *ngFor="let dc of treeGridDef.columns; let x = index" data-resizable-column-id="#" [style.width]="dc.width" 
                            tg-sortable-header [colIndex]="x" [sort]="dc.sort" [innerHTML]="dc.labelHtml" 
                                [class.tg-sortable]="treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC"
                                [class.tg-sort-asc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC"
                                [class.tg-sort-desc]="treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC" >
                        </th>
				    </tr>
			    </thead>
				<tbody>
					<tr class='treegrid-tr' *ngFor="let dr of dataView; let x = index">
						<td *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? (dr.__node.level * 22).toString() + 'px' : ''" [class]="dc.className">
                            <span class="tg-opened" *ngIf="y == 0 &&  dr.__node.isOpen && dr.__node.childNodes.length > 0" (click)="toggleTree(dr.__node)">&nbsp;</span>
                            <span class="tg-closed" *ngIf="y == 0 && !dr.__node.isOpen && dr.__node.childNodes.length > 0" (click)="toggleTree(dr.__node)">&nbsp;</span>
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
        .td-right { 
            text-align: right;
        }
    `],
    directives: [SortableHeader, PageNavigator]
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
    constructor(private elementRef: ElementRef) {
        this.currentPage.num = 0;
        console.log(this.elementRef);
    }

    private sortColumn(event: ColumnOrder) {
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
        if (this.treeGridDef.data.length > 0)
            this.refresh();
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
    toggleTree(node: DataNode) {
        this.numVisibleRows = this.dataTree.toggleNode(node);
        this.goPage(this.currentPage.num);
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

