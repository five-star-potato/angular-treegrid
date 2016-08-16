/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, ComponentResolver, Input, ComponentMetadata, SimpleChange, ComponentFactory, ReflectiveInjector, OnInit, OnChanges} from "@angular/core";
import { Pipe, PipeTransform, Injectable, Inject, Output, EventEmitter, ElementRef, HostListener, ViewChild, ViewContainerRef, AfterViewInit } from "@angular/core";
import { SafeHtml } from  '@angular/platform-browser'

class TreeNodeState {
    state: string = "CLOSED";
    visible: boolean = false;
    level: number = 0;
    children: any[] = null;
}

export enum SortDirection {
    ASC,
    DESC
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
			<li [class.disabled]="currentPage <= 0">
				<a href="#" (click)="goPage(0)" aria-label="First">
				<span aria-hidden="true">&laquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage <= 0">
				<a href="#" (click)="goPrev()" aria-label="Previous">
				<span aria-hidden="true">&lsaquo;</span>
				</a>
			</li>

			<li [class.disabled]="true">
				<a href="#" aria-label="">
				<span aria-hidden="true">Page {{currentPage + 1}} of {{numPages}}</span>
				</a>
			</li>

			<li></li>

			<li [class.disabled]="currentPage >= numPages - 1">
				<a href="#" (click)="goNext()" aria-label="Previous">
				<span aria-hidden="true">&rsaquo;</span>
				</a>
			</li>
			<li [class.disabled]="currentPage >= numPages - 1">
				<a href="#" (click)="goPage(numPages - 1)" aria-label="Previous">
				<span aria-hidden="true">&raquo;</span>
				</a>
			</li>
		</ul>
    `
})
export class PageNavigator implements OnChanges {
    currentPage: number = 0;
    numPages: number;
    @Input() pageSize: number;
    @Input() entries: any[];
    // fire the event when the user click, let the parent handle refreshing the page data
    @Output() onNavClick = new EventEmitter<number>();
    @Output() onResetCurrent = new EventEmitter<number>();

    refresh() {
        let numEntries = this.entries.filter(r => r.__STATE__.visible).length;
        this.numPages = Math.ceil(numEntries / this.pageSize);
        if (this.numPages > 0)
            if (this.currentPage >= this.numPages) { // is somehow current page is no longer valid, move the pointer the last page
                this.currentPage = this.numPages = -1;
        }
    }
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.refresh();
        /*
        let chng = changes["numEntries"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
        */
    }

    goPage(pn: number) {
        this.currentPage = pn;
        this.onNavClick.emit(pn);
    }
    goPrev() {
        if (this.currentPage > 0)
            this.currentPage -= 1;
        this.onNavClick.emit(this.currentPage);
    }
    goNext() {
        if (this.currentPage < (this.numPages - 1))
            this.currentPage += 1;
        this.onNavClick.emit(this.currentPage);
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
			<table class="treegrid-table table table-striped table-hover" data-resizable-columns-id="resizable-table">
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
						<td class='treegrid-td' *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? (dr.__STATE__.level * 15).toString() + 'px' : ''" [class]="dc.className">
                            <span [class.tg-opened]="y == 0 && dr.__STATE__.state == 'OPENED' && dr.__STATE__.children.length > 0" (click)="closeTree(dr[treeGridDef.hierachy.primaryKeyField])">&nbsp;</span>
                            <span [class.tg-closed]="y == 0 && dr.__STATE__.state == 'CLOSED' && dr.__STATE__.children.length > 0" (click)="openTree(dr[treeGridDef.hierachy.primaryKeyField])">&nbsp;</span>
                            <span *ngIf="dc.render == null">{{ dr[dc.dataField] }}</span>
    						<span *ngIf="dc.render != null" [innerHTML]="dc.render(dr[dc.dataField], dr, x)"></span>
                        </td>

					</tr>
				</tbody>
			</table>
            <tg-page-nav [entries]="treeGridDef.data" [pageSize]="treeGridDef.pageSize" (onNavClick)="goPage($event)" *ngIf="treeGridDef.paging"></tg-page-nav>
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
            cursor: printer; cursor: hand;
        }
        span.tg-opened:after {
            font-family: "FontAwesome";
            content: "\\f078";
        }
        span.tg-closed:after {
            font-family: "FontAwesome";
            content: "\\f054";
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
    private initalProcessed: boolean = false;
    public sortDirType = SortDirection; // workaround to NG2 issues #2885
    constructor(private elementRef: ElementRef) {
        console.log(this.elementRef);
    }
    private sortFunc(arr: any[], columnName: string, dir: SortDirection) {
        arr.sort((a: any, b: any) => {
            if (dir == SortDirection.ASC)
                return a[columnName] > b[columnName] ? 1 : (a[columnName] < b[columnName] ? -1 : 0);
            else
                return a[columnName] < b[columnName] ? 1 : (a[columnName] > b[columnName] ? -1 : 0);
        });
    }
    // reassign the elements back to the indexed position
    private rearrangeIndex(indices: number[], arr: any[]) {
        indices.forEach(i => {
            this.treeGridDef.data[i] = arr[i];
        });
    }
    private sortChildren(pk: string, fk:string, columnName: string, parentRow: any, dir: SortDirection) {
        let childrenKeys: number[];
        let childrenRows: any[] = [];
        let indices: number[] = [];
        let cnt = this.treeGridDef.data.length;

        // if this is not first time calling (parentRow == null) and you have no children, then nothing to sort, just return;
        if (parentRow && parentRow.__STATE__.children.length == 0)
            return; 

        if (parentRow != null)
            childrenKeys = parentRow.__STATE__.children;

        for (let i = 0; i < cnt; i++) {
            let r = this.treeGridDef.data[i];
            let toInclude: boolean = false;
            if (parentRow == null) { //top level
                if (r[fk] == null) {
                    toInclude = true;
                }
            }
            else if (childrenKeys.includes(r[pk])) {
                toInclude = true;
            }
            if (toInclude) {
                childrenRows.push(r);
                indices.push(i);
            }
        }
        // after getting all the children rows, now sort it
        this.sortFunc(childrenRows, columnName, dir);
        this.rearrangeIndex(indices, childrenRows);
        childrenRows.forEach(c => {
            this.sortChildren(pk, fk, columnName, c, dir);
        });
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
        let pk = this.treeGridDef.hierachy.primaryKeyField; 
        let fk = this.treeGridDef.hierachy.foreignKeyField;
        if (pk && fk) {
            this.sortChildren(pk, fk, columnName, null, dir);
        }
        else
            this.sortFunc(this.treeGridDef.data, columnName, dir);
        this.refresh();
    }    

    refresh() {
        if (!this.initalProcessed) {
            this.groupItemsHierarchy();
            this.initalProcessed = true;
            if (this.treeGridDef.defaultOrder.length > 0) {
                // TODO: assume only one entry for now
                this.sortColumn(this.treeGridDef.defaultOrder[0]);
            }
        }
        this.goPage(0);
        if (this.treeGridDef.paging) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }
    private groupItemsHierarchy() {
        let tmpDest: any[] = [];
        let tmpSrc = this.treeGridDef.data.slice();
        let fk = this.treeGridDef.hierachy.foreignKeyField;
        let pk = this.treeGridDef.hierachy.primaryKeyField;

        // Initial loop; move all the root nodes to tmpDest;
        let k = tmpSrc.length;
        let lvl = 0;
        while (k--) {
            if (tmpSrc[k][fk] == null) {
                let row = tmpSrc.splice(k, 1)[0];
                row.__STATE__ = new TreeNodeState();
                row.__STATE__.visible = true;
                tmpDest.unshift(row);
            }
        }
        let i = 0;
        while (i < tmpDest.length) {
            // continuously insert rows from src to dest until all the rows in dest are processed; at the end of the process ,src should become empty
            let parentRow = tmpDest[i];
            if (!parentRow.__STATE__.children ) { // undefined __CHILD__ means this row hasn't been processed yet
                parentRow.__STATE__.children = [];
                let pkVal = parentRow[pk];
                k = tmpSrc.length;
                while (k--) { // scan Src for rows that its FK is pointing to this PK; remove them from src and add them to dest
                    if (tmpSrc[k][fk] == pkVal) {
                        let childRow = tmpSrc.splice(k, 1)[0];
                        childRow.__STATE__ = new TreeNodeState();
                        childRow.__STATE__.level = parentRow.__STATE__.level + 1;
                        parentRow.__STATE__.children.push(childRow[pk]);
                        tmpDest.splice(i + 1, 0, childRow);
                    }
                }
            }
            i++;
        }
        this.treeGridDef.data = tmpDest;
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
        let tmpSrc: any[] = this.treeGridDef.data.filter(r => r.__STATE__.visible);
        if (this.treeGridDef.paging)
            this.dataView = tmpSrc.slice(pn * sz, (pn + 1) * sz);
        else
            this.dataView = tmpSrc.slice(0);
    }
    openTree(pkVal: any) {
        let pkField = this.treeGridDef.hierachy.primaryKeyField;
        let row = this.treeGridDef.data.filter(r => r[pkField] == pkVal)[0];
        row.__STATE__.state = "OPENED";
        this.toggleDescendantsDisplay(pkField, row, true);
        this.refresh();
    }
    closeTree(pkVal: any) {
        let pkField = this.treeGridDef.hierachy.primaryKeyField;
        let row = this.treeGridDef.data.filter(r => r[pkField] == pkVal)[0];
        row.__STATE__.state = "CLOSED";
        this.toggleDescendantsDisplay(pkField, row, false);
        this.refresh();
    }
    private toggleDescendantsDisplay(pkField:string, parentRow: any, show: Boolean) {
        let childrenRows = parentRow.__STATE__.children;
        let parentIsOpen = (parentRow.__STATE__.state == "OPENED");

        if (childrenRows) {
            this.treeGridDef.data.filter(r => childrenRows.includes(r[pkField])).forEach(
                c => {
                    if (show) {
                        if (parentIsOpen) {
                            c.__STATE__.visible = true;
                            this.toggleDescendantsDisplay(pkField, c, show);
                        }
                    }
                    else {
                        // when closing, everything closes
                        c.__STATE__.visible = false;
                        this.toggleDescendantsDisplay(pkField, c, show);
                    }
                });
        }
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

