/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
import { Component, Directive, Input, ComponentMetadata, SimpleChange, ComponentFactory, OnInit, OnChanges} from "@angular/core";
import { Pipe, PipeTransform, Injectable, Inject, Output, EventEmitter, ElementRef, HostListener, ViewChild, ViewContainerRef, AfterViewInit } from "@angular/core";
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { DataTree, DataNode, DataTreeOption } from './datatree';
import { PageNavigator } from './pagenav.component';
import { SimpleDataService, HttpMethod } from './simpledata.service';
import { AjaxConfig, GroupConfig, ColumnDef, ColumnOrder, ColumnTransform, EditorConfig, EditorType, SortDirection, TreeGridDef, TreeHierarchy, FilterConfig } from "./treedef";
import { Utils } from './utils';

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
    private _el: HTMLElement;
    private _vc: ViewContainerRef;
    private _sortDir: SortDirection = null;

    /* the actual sorting is done by the parent */
    @Output() onSort = new EventEmitter<ColumnOrder>();
    @Input('column-index') colIndex: number;
    @Input() sortable: boolean;

    constructor(private e: ElementRef, private vr: ViewContainerRef) {
        this._el = e.nativeElement;
        this._vc = vr;
    }
    @HostListener('mouseenter') onMouseEnter() {
        this._highlight('#DDD');
    }
    @HostListener('mouseleave') onMouseLeave() {
        this._highlight(null);
    }
    @HostListener('click') onClick() {
        if (!this.sortable) return;

        // cyling sortDir among -1,0,1; don't check !this.sortDir because 0 is a valid value
        this._sortDir = (this._sortDir == undefined) ? SortDirection.ASC : (this._sortDir == SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
        this.onSort.emit({ columnIndex: this.colIndex, sortDirection: this._sortDir });
        console.log('header clicked')
    }
    private _highlight(color: string) {
        this._el.style.backgroundColor = color;
    }
}

@Component({
    moduleId: module.id,
    selector: 'tg-treegrid',
    template: `
        <form class="form-inline" style="margin:5px" *ngIf="treeGridDef.filter">
            <div class="form-group">
                <div class="dropdown" style="display:inline">
                      <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        {{ _filterLabel }}
                        <span class="caret"></span>
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                        <li (click)="_filterColumnChange(ANY_SEARCH_COLUMN, 'Any column')"><a >Any column</a></li>
                        <li role="separator" class="divider"></li>
                        <template ngFor let-dc [ngForOf]="treeGridDef.columns" >
                            <li *ngIf="dc.filterable"><a (click)="_filterColumnChange(dc.dataField, dc.labelHtml)" [innerHTML]="utils.stripHTML(dc.labelHtml)"></a></li>
                        </template>
                      </ul>
                </div>
            </div>
            <div class="form-group">
                <input type="text" [formControl]="_term" class="form-control" id="filterText" placeholder="Type to filter">
            </div>
        </form>

        <table [class]="'treegrid-table ' + treeGridDef.className" data-resizable-columns-id="resizable-table">
            <colgroup>
                    <!-- providing closing tags broke NG template parsing -->    
                    <col *ngFor="let dc of treeGridDef.columns" [class]="dc.className"> 
            </colgroup>
            <thead>
                <tr>
                    <th (onSort)="_sortColumnEvtHandler($event)" *ngFor="let dc of treeGridDef.columns; let x = index" data-resizable-column-id="#" [style.width]="dc.width" [class]="dc.className"
                        tg-sortable-header [column-index]="x" [sortable]="dc.sortable" [innerHTML]="dc.labelHtml" 
                            [class.tg-sortable]="treeGridDef.sortable && dc.sortable && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC"
                            [class.tg-sort-asc]="treeGridDef.sortable && dc.sortable && dc.sortDirection == sortDirType.ASC"
                            [class.tg-sort-desc]="treeGridDef.sortable && dc.sortable && dc.sortDirection == sortDirType.DESC" 
                            >
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let dr of _dataView; let x = index" (dblclick)="_dblClickRow(dr)" (click)="onRowClick.emit(dr)">
                    <td *ngFor="let dc of treeGridDef.columns; let y = index" [style.padding-left]="y == 0 ? _calcIndent(dr).toString() + 'px' : ''" [class]="dc.className"
                        [class.tg-group-level-0]="dr.__node.level == 0 && dr.__node.childNodes.length > 0"
                        [class.tg-group-level-1]="dr.__node.level == 1 && dr.__node.childNodes.length > 0"
                        [class.tg-group-level-2]="dr.__node.level == 2 && dr.__node.childNodes.length > 0">
                        <span title="close" class="tg-opened" *ngIf="y == 0 && _showCollapseIcon(dr)" (click)="_toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                        <span title="open" class="tg-closed" *ngIf="y == 0 && _showExpandIcon(dr)" (click)="_toggleTreeEvtHandler(dr.__node)">&nbsp;</span>
                        <span *ngIf="!dc.render && !dc.transforms">{{ dr[dc.dataField] }}</span>
                        <span *ngIf="dc.render != null" [innerHTML]="dc.render(dr[dc.dataField], dr, x)"></span>
                        <span *ngIf="dc.transforms" [innerHTML]="_transformWithPipe(dr[dc.dataField], dc.transforms)"></span>
                    </td>

                </tr>
            </tbody>
        </table>
        <div class="row">
            <div class="loading-icon col-md-offset-4 col-md-4" style="text-align:center" [class.active]="_isLoading"><i style="color:#DDD" class="fa fa-cog fa-spin fa-3x fa-fw"></i></div>
            <div class="col-md-4"><tg-page-nav style="float: right" [numRows]="_numVisibleRows" [pageSize]="treeGridDef.pageSize" (onNavClick)="_goPage($event)" *ngIf="treeGridDef.paging" [(currentPage)]="_currentPage"></tg-page-nav></div>
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

.tg-group-level-0 {
    font-weight: bold;
}
.tg-group-level-1 {
    font-weight: bold;
}
.tg-group-level-2 {
    font-weight: bold;
}

`],
    directives: [SortableHeader, PageNavigator ],
    providers: [ SimpleDataService, Utils ]
})
export class TreeGrid implements OnInit, AfterViewInit, OnChanges {
    private debugVar:number = 0;
    @Input() treeGridDef: TreeGridDef;
    @Output() onRowDblClick = new EventEmitter<any>();
    @Output() onRowClick = new EventEmitter<any>();

    @ViewChild(PageNavigator)
    private pageNav: PageNavigator;

    private ANY_SEARCH_COLUMN:string = "[any]";
    private DEFAULT_CLASS:string = "table table-hover table-striped table-bordered";

	// _dataView is what the user is seeing on the screen; one page of data if paging is enabled
    private _dataView: any[];
    private _dataTree: DataTree;
    private _numVisibleRows: number;
    private _currentPage: number = 0;// PageNumber = { num: 0 };
    private _isLoading: boolean = false; // show loading icon
    private _selectedRow: any;
    private _sortColumnField: string;
    private _sortDirection: SortDirection;
    private _filterField:string = this.ANY_SEARCH_COLUMN;
    private _filterLabel:string = "Any column";
    private _setIsLoaded:boolean = false; // need to know whether to set each node to be "loaded"; in the case of a filter result, I always set it to loaded, to avoid duplicate rows
    private _term:FormControl = new FormControl();

    private _dataBackup: any[]; // used to restore the _dataview after filtering, if Ajax is not configured, i.e. the data is static

    self = this; // copy of context

    private isDataTreeConstructed: boolean = false;
    public sortDirType = SortDirection; // workaround to NG2 issues #2885, i.e. you can't use Enum in template html as is.

    constructor(private dataService: SimpleDataService, private elementRef: ElementRef, private utils: Utils) {
        this._currentPage = 0;
    }
    ngAfterViewInit() {
        // Initialize resizable columns after everything is rendered
        let y: any;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();

        if (this.treeGridDef.paging && this.pageNav) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }
    ngOnInit() {
        if (this.treeGridDef.grouping && this.treeGridDef.hierachy) {
            throw new Error("GroupConfig and TreeHierarchy cannot be both assigned");
        }
        this.treeGridDef.columns.forEach((item) => {
            // can't find good ways to initialize interface
            if (item.className == undefined)
                item.className = ""; // got class="undefined tg-sortable" ... if I don't give it an empty string
            if (item.sortable == undefined)
                item.sortable = true;
            if (item.filterable == undefined)
                item.filterable = true;
        });

        let ajax = this.treeGridDef.ajax;
        if (ajax) {
            if (!ajax.method)
                ajax.method = HttpMethod.GET;
            if (ajax.method != HttpMethod.GET && ajax.method != HttpMethod.POST) {
                throw new Error("Ajax Method must be GET or POST");
            }            
            if (!ajax.doNotLoad) {
                this.reloadAjax();
            }
        }
        else if (this.treeGridDef.data.length > 0) {
            // Static data already loaded
            this._dataBackup = this.treeGridDef.data;
            this.refresh();
            this._goPage(this._currentPage);
        }
        if (!this.treeGridDef.className)
            this.treeGridDef.className = this.DEFAULT_CLASS;

        // Based on the blog: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
        if (this.treeGridDef.filter) {
            this._term.valueChanges
                     .debounceTime(400)
                     .distinctUntilChanged()
                     .switchMap(term => this._filterOrReloadObservable(term, this._filterField))
                     .subscribe((ret: any) => { this._reloadData(ret); }, (err: any) => { console.log(err) });
        }
    }
    private _sortColumnEvtHandler(event: ColumnOrder) {
        // assuming that we can only sort one column at a time;
        // clear all the._sortDirection flags across columns;
        let dir: SortDirection = event.sortDirection;
        this.treeGridDef.columns.forEach((item) => {
            item.sortDirection = null;
        });
        this.treeGridDef.columns[event.columnIndex].sortDirection = event.sortDirection;
        this._sortColumnField = this.treeGridDef.columns[event.columnIndex].dataField;
        this._sortDirection = event.sortDirection;
        this._dataTree.sortByColumn(this._sortColumnField, this._sortDirection);

        this.refresh();
        this._goPage(this._currentPage)
    }    
    // Calculate how much indentation we need per level; notice that the open/close icon are not of the same width
    private _calcIndent(row: any):number {
        var showExpand = this._showExpandIcon(row);
        var showCollapse = this._showCollapseIcon(row);
        var ident:number = row.__node.level * 20 + 20;

        if (showExpand)
            ident -= 17;
        else if (showCollapse)
            ident -= 21;
        return ident;
    }
    private _showCollapseIcon(row: any):boolean {
        if (!row.__node)
            return false;
        return (row.__node.isOpen && row.__node.childNodes.length > 0);
    }
    // test to see if the node should show an icon for opening the subtree
    private _showExpandIcon(row: any): boolean {
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
	// Handling Pagination logic
    private _goPage(pn: number) {
        var sz = this.treeGridDef.pageSize;
        let pageRows: any[]; // indices of the paged data rows
        if (this.treeGridDef.paging)
            pageRows = this._dataTree.getPageData(pn, sz);
        else
            pageRows = this._dataTree.getPageData(0, -1);
        
        this._dataView = [];
        this._dataView.push(... pageRows);
    }

    // These few statments are needed a few times in toggleTreeEvtHandler, so I grouped them together
    private _toggleTreeNode(node: DataNode) {
        this._numVisibleRows = this._dataTree.toggleNode(node);
        this._goPage(this._currentPage);
        if (this.treeGridDef.paging && this.pageNav) 
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    }
    private _toggleTreeEvtHandler(node: DataNode) {
        let ajax = this.treeGridDef.ajax;
        if (ajax) {
            if (ajax.lazyLoad && !node.isLoaded) {
                this._isLoading = true;
                this.dataService.send(ajax.method, ajax.url + "?id=" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe((ret: any) => {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    node.isLoaded = true;
                    if (ret.length > 0) {
                        let startIndex = this.treeGridDef.data.length;
                        let endIndex = startIndex + ret.length - 1;
                        ret.forEach((r: any) => this.treeGridDef.data.push(r));
                        this._dataTree.addRows(startIndex, endIndex, node);
                        // The data has been sorted, the newly loaded data should be sorted as well.
                        if (this._sortColumnField) {
                            this._dataTree.sortNode(node, this._sortColumnField, this._sortDirection);
                        }
                    }
                    this._toggleTreeNode(node);
                    this._isLoading = false;
                }, (err: any) => { console.log(err) });
            }
            else
                this._toggleTreeNode(node);
        }
        else 
            this._toggleTreeNode(node);
    }
    private _dblClickRow(row: any) {
        this._selectedRow = row;
        this.onRowDblClick.emit(row);
    }
    private _reloadData(data: any[]) {
        this.isDataTreeConstructed = false;
        this.treeGridDef.data = data;
        this.refresh();
        this._isLoading = false;
        this._goPage(this._currentPage);
    }
    // I tried to push the decision to whether filter or reload the data (two different Urls) to the last minute
    private _filterOrReloadObservable(term: string, field: string): Observable<any[]> {
        if (term) {
            this._setIsLoaded = true;
            if (this.treeGridDef.filter) {
                if (typeof this.treeGridDef.filter === "object") {
                    let cfg:FilterConfig = <FilterConfig> this.treeGridDef.filter;
                    if (cfg && cfg.method && cfg.url)
                        return this.dataService.send(cfg.method, cfg.url + "?value=" + term + "&field=" + field);
                    else 
                        throw new Error("Filter config missing");
                }
                else { // do client-side filter
                    let filterResult:any[] = this._filterInExistingData(term, field);
                    return Observable.from(filterResult).toArray();
                }
            }
        }
        else { // if term is empty, reload 
            if (this.treeGridDef.ajax) {
                this._setIsLoaded = false;
                let ajax = this.treeGridDef.ajax;
                if (ajax && ajax.url) 
                    return this.dataService.send(ajax.method, ajax.url)
                else
                    throw new Error("Ajax config missing");
            }
            else {
                return Observable.from(this._dataBackup).toArray();
            }
        }
    }
    // handles the filter column dropdown change
    private _filterColumnChange(field:string, labelHTML:string) {
        this._filterField = field; 
        this._filterLabel = labelHTML;
        if (this._term.value) {
            this._filterOrReloadObservable(this._term.value, this._filterField).subscribe((ret: any) => {
                this._reloadData(ret);
            }, (err: any) => { console.log(err) });
        }
    }
    private _filterInExistingData(term:string, field:string):any[] {
        let filterResult:Set<any> = new Set<any>();
        if (field === this.ANY_SEARCH_COLUMN) {
            // user may choose filter any fields
            for (let dc of this.treeGridDef.columns) {
                if (dc.filterable) 
                    // remember to filter from the initial dataset; not withing the prev filter result
                    this._dataBackup.filter((row:any) => { return row[dc.dataField].toString().toLowerCase().includes(term); })
                        .forEach(x => filterResult.add(x));
            }
        }
        else { // use specifies one column to filter
            filterResult.add(this.treeGridDef.data.filter((row:any) => { return row[field].toString().toLowerCase().includes(term); }));
        }
        return Array.from(filterResult);
    }
    private _transformWithPipe(value:any, trans:ColumnTransform[]) {
        let v:any = value;
        trans.forEach(function(t:ColumnTransform) {
            v = t.pipe.transform(v, t.param);
        })
        return v;
    }
    saveSelectedRowchanges(copyRow: any) {
        Object.assign(this._selectedRow, copyRow);
    }
    reloadAjax(url?: string) { // user can provide a different url to override the url in AjaxConfig
        let ajax = this.treeGridDef.ajax;
        if (ajax && (url || ajax.url)) {
            this._isLoading = true;
            this.dataService.send(ajax.method, url ? url : ajax.url).subscribe((ret: any) => {
                this._reloadData(ret);
            }, (err: any) => { console.log(err) });
        }
    }
    // the setIsLoaded flag is to be used by Filtering - filtering may return partial hierarhies. I would consider the node "isLoaded", therefore no more ajax call to reload the node.
    // otherwise the ajax call will create duplicate rows
    refresh() {
        if (!this.isDataTreeConstructed) {
            if (this.treeGridDef.hierachy && this.treeGridDef.hierachy.primaryKeyField && this.treeGridDef.hierachy.foreignKeyField)
                this._dataTree = new DataTree(this.treeGridDef.data, {  primaryKey: this.treeGridDef.hierachy.primaryKeyField,
                                                                        foreignKey: this.treeGridDef.hierachy.foreignKeyField, 
                                                                        setIsLoaded: this._setIsLoaded });
            else if (this.treeGridDef.grouping) {
                this._dataTree = new DataTree(this.treeGridDef.data, { grouping: this.treeGridDef.grouping }, this.treeGridDef /* unfortunately, DataTree need to access the column names */);
            }
            else
                // data is just flat 2d table
                this._dataTree = new DataTree(this.treeGridDef.data, {});
            this._numVisibleRows = this._dataTree.recountDisplayCount();
            this.isDataTreeConstructed = true;
        }
        else {
        // changes in this._numVisibleRows should trigger pageNav refresh()
        //if (this.treeGridDef.paging && this.pageNav) 
        //      this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
        //this._goPage(this._currentPage);
        }
    }
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        //this.refresh();
        console.log(changes);
        /*
        let chng = changes["numRows"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
        */    
    }

	/* event not fired when treeGridDef was changed programmatically. Is this a bug?
	http://www.bennadel.com/blog/3053-changing-directive-inputs-programmatically-won-t-trigger-ngonchanges-in-angularjs-2-beta-9.htm
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        let newTreeDef = <TreeGridDef> changes["treeGridDef"].currentValue;
        this._dataView = newTreeDef.data.slice(0);
        console.log(changes);
    }
	*/
}

