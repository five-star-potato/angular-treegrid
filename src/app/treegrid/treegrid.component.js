"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var datatree_1 = require('./datatree');
var pagenav_component_1 = require('./pagenav.component');
var simpledata_service_1 = require('./simpledata.service');
var treedef_1 = require("./treedef");
__export(require('./treedef'));
/**
* Controls the sorting by clicking the page header
* The actual sorting the data is not done by this control. This control will fire the event to let the hosting component to handle the actual sorting.
* This component mainly handles the UI state (like updown arrows) on each column header
*/
var SortableHeader = (function () {
    function SortableHeader(e, vr) {
        this.e = e;
        this.vr = vr;
        this.sortDir = null;
        /* the actual sorting is done by the parent */
        this.onSort = new core_2.EventEmitter();
        this.el = e.nativeElement;
        this.vc = vr;
    }
    SortableHeader.prototype.onMouseEnter = function () {
        this.highlight('#DDD');
    };
    SortableHeader.prototype.onMouseLeave = function () {
        this.highlight(null);
    };
    SortableHeader.prototype.onClick = function () {
        if (!this.sort)
            return;
        // cyling sortDir among -1,0,1
        this.sortDir = (this.sortDir == null) ? treedef_1.SortDirection.ASC : (this.sortDir == treedef_1.SortDirection.ASC ? treedef_1.SortDirection.DESC : treedef_1.SortDirection.ASC);
        this.onSort.emit({ columnIndex: this.colIndex, sortDirection: this.sortDir });
        console.log('header clicked');
    };
    SortableHeader.prototype.highlight = function (color) {
        this.el.style.backgroundColor = color;
    };
    __decorate([
        core_2.Output(), 
        __metadata('design:type', Object)
    ], SortableHeader.prototype, "onSort", void 0);
    __decorate([
        core_1.Input('column-index'), 
        __metadata('design:type', Number)
    ], SortableHeader.prototype, "colIndex", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], SortableHeader.prototype, "sort", void 0);
    __decorate([
        core_2.HostListener('mouseenter'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SortableHeader.prototype, "onMouseEnter", null);
    __decorate([
        core_2.HostListener('mouseleave'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SortableHeader.prototype, "onMouseLeave", null);
    __decorate([
        core_2.HostListener('click'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], SortableHeader.prototype, "onClick", null);
    SortableHeader = __decorate([
        core_1.Directive({
            selector: '[tg-sortable-header]'
        }), 
        __metadata('design:paramtypes', [core_2.ElementRef, core_2.ViewContainerRef])
    ], SortableHeader);
    return SortableHeader;
}());
exports.SortableHeader = SortableHeader;
var TreeGrid = (function () {
    function TreeGrid(dataService, elementRef) {
        this.dataService = dataService;
        this.elementRef = elementRef;
        this.debugVar = 0;
        this.onDblClickRow = new core_2.EventEmitter();
        this.currentPage = { num: 0 };
        this.isLoading = false;
        this.self = this; // copy of context
        this.initalProcessed = false;
        this.sortDirType = treedef_1.SortDirection; // workaround to NG2 issues #2885, i.e. you can't use Enum in template html as is.
        this.currentPage.num = 0;
        console.log(this.elementRef);
    }
    TreeGrid.prototype.sortColumnEvtHandler = function (event) {
        // assuming that we can only sort one column at a time;
        // clear all the sortDirection flags across columns;
        var dir = event.sortDirection;
        this.treeGridDef.columns.forEach(function (item) {
            item.sortDirection = null;
        });
        this.treeGridDef.columns[event.columnIndex].sortDirection = event.sortDirection;
        var columnName = this.treeGridDef.columns[event.columnIndex].dataField;
        this.dataTree.sortColumn(columnName, event.sortDirection);
        this.refresh();
    };
    TreeGrid.prototype.calcIndent = function (row) {
        var showExpand = this.showExpandIcon(row);
        var showCollapse = this.showCollapseIcon(row);
        var ident = row.__node.level * 30 + 10;
        if (showExpand)
            ident -= 17;
        else if (showCollapse)
            ident -= 21;
        return ident;
    };
    TreeGrid.prototype.showCollapseIcon = function (row) {
        if (!row.__node)
            return false;
        return (row.__node.isOpen && row.__node.childNodes.length > 0);
    };
    // test to see if the node should show an icon for opening the subtree
    TreeGrid.prototype.showExpandIcon = function (row) {
        if (!row.__node)
            return false;
        if (!row.__node.isOpen) {
            var ajax = this.treeGridDef.ajax;
            // the ajax.childrenIndicatorField indicates the column we need to check to see if his node has children (not loaded yet)
            if (ajax && ajax.childrenIndicatorField) {
                if (row[ajax.childrenIndicatorField])
                    return true;
            }
            else {
                return (row.__node.childNodes.length > 0);
            }
        }
        return false;
    };
    TreeGrid.prototype.refresh = function () {
        if (!this.initalProcessed) {
            if (this.treeGridDef.hierachy && this.treeGridDef.hierachy.primaryKeyField && this.treeGridDef.hierachy.foreignKeyField)
                this.dataTree = new datatree_1.DataTree(this.treeGridDef.data, this.treeGridDef.hierachy.primaryKeyField, this.treeGridDef.hierachy.foreignKeyField);
            else
                this.dataTree = new datatree_1.DataTree(this.treeGridDef.data);
            this.numVisibleRows = this.dataTree.recountDisplayCount();
            this.initalProcessed = true;
        }
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging && this.pageNav)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype.loadAjaxData = function (url) {
        var _this = this;
        var ajax = this.treeGridDef.ajax;
        if (ajax && (url || ajax.url)) {
            this.isLoading = true;
            if (ajax.method == "POST") {
                this.dataService.post(url ? url : ajax.url).subscribe(function (ret) {
                    _this.treeGridDef.data = ret;
                    _this.refresh();
                    _this.isLoading = false;
                }, function (err) { console.log(err); });
            }
            else {
                this.dataService.get(ajax.url).subscribe(function (ret) {
                    _this.treeGridDef.data = ret;
                    _this.refresh();
                }, function (err) { console.log(err); });
            }
        }
    };
    TreeGrid.prototype.ngAfterViewInit = function () {
        // Initialize resizable columns after everything is rendered
        var y;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();
        if (this.treeGridDef.paging)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype.ngOnInit = function () {
        this.treeGridDef.columns.forEach(function (item) {
            // can't find good ways to initialize interface
            if (item.sort == undefined)
                item.sort = true;
        });
        var ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (!ajax.doNotLoad) {
                this.loadAjaxData();
            }
        }
        else if (this.treeGridDef.data.length > 0) {
            this.refresh();
        }
    };
    // Handling Pagination logic
    TreeGrid.prototype.goPage = function (pn) {
        var _this = this;
        var sz = this.treeGridDef.pageSize;
        var rows; // indices of the paged data rows
        if (this.treeGridDef.paging)
            rows = this.dataTree.getPageData(pn, sz);
        else
            rows = this.dataTree.getPageData(0, -1);
        this.dataView = [];
        rows.forEach(function (r) { return _this.dataView.push(_this.treeGridDef.data[r]); });
    };
    // These few statments are needed a few times in toggleTreeEvtHandler, so I grouped them together
    TreeGrid.prototype.toggleTreeNode = function (node) {
        this.numVisibleRows = this.dataTree.toggleNode(node);
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype.toggleTreeEvtHandler = function (node) {
        var _this = this;
        var ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (ajax.lazyLoad && !node.isLoaded) {
                this.isLoading = true;
                this.dataService.post(ajax.url + "/" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe(function (ret) {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    node.isLoaded = true;
                    if (ret.length > 0) {
                        var startIndex = _this.treeGridDef.data.length;
                        var endIndex = startIndex + ret.length - 1;
                        ret.forEach(function (r) { return _this.treeGridDef.data.push(r); });
                        _this.dataTree.addRows(startIndex, endIndex, node);
                    }
                    _this.toggleTreeNode(node);
                    _this.isLoading = false;
                }, function (err) { console.log(err); });
            }
            else
                this.toggleTreeNode(node);
        }
        else
            this.toggleTreeNode(node);
    };
    TreeGrid.prototype.transformWithPipe = function (value, trans) {
        var v = value;
        trans.forEach(function (t) {
            v = t.pipe.transform(v, t.param);
        });
        return v;
    };
    TreeGrid.prototype.dblClickRow = function (row) {
        this.selectedRow = row;
        this.onDblClickRow.emit(row);
    };
    TreeGrid.prototype.saveSelectedRowchanges = function (copyRow) {
        Object.assign(this.selectedRow, copyRow);
    };
    TreeGrid.prototype.debugFunc = function () {
        this.debugVar++;
        console.log(this.debugVar);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', treedef_1.TreeGridDef)
    ], TreeGrid.prototype, "treeGridDef", void 0);
    __decorate([
        core_2.Output(), 
        __metadata('design:type', Object)
    ], TreeGrid.prototype, "onDblClickRow", void 0);
    __decorate([
        core_2.ViewChild(pagenav_component_1.PageNavigator), 
        __metadata('design:type', pagenav_component_1.PageNavigator)
    ], TreeGrid.prototype, "pageNav", void 0);
    TreeGrid = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'tg-treegrid',
            template: "\n\t\t\t<table class=\"treegrid-table table table-hover  table-striped table-bordered\" data-resizable-columns-id=\"resizable-table\">\n                <colgroup>\n                        <!-- providing closing tags broke NG template parsing -->    \n                        <col *ngFor=\"let dc of treeGridDef.columns\" [class]=\"dc.className\"> \n                </colgroup>\n\t\t\t    <thead>\n\t\t\t\t    <tr>\n\t\t\t\t\t    <th (onSort)=\"sortColumnEvtHandler($event)\" *ngFor=\"let dc of treeGridDef.columns; let x = index\" data-resizable-column-id=\"#\" [style.width]=\"dc.width\" [class]=\"dc.className\"\n                            tg-sortable-header [column-index]=\"x\" [sort]=\"dc.sort\" [innerHTML]=\"dc.labelHtml\" \n                                [class.tg-sortable]=\"treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC\"\n                                [class.tg-sort-asc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC\"\n                                [class.tg-sort-desc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC\" \n                                >\n                        </th>\n\t\t\t\t    </tr>\n\t\t\t    </thead>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr *ngFor=\"let dr of dataView; let x = index\" (dblclick)=\"dblClickRow(dr)\">\n\t\t\t\t\t\t<td *ngFor=\"let dc of treeGridDef.columns; let y = index\" [style.padding-left]=\"y == 0 ? calcIndent(dr).toString() + 'px' : ''\" [class]=\"dc.className\">\n                            <span class=\"tg-opened\" *ngIf=\"y == 0 && showCollapseIcon(dr)\" (click)=\"toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                            <span class=\"tg-closed\" *ngIf=\"y == 0 && showExpandIcon(dr)\" (click)=\"toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                            <span *ngIf=\"!dc.render && !dc.transforms\">{{ dr[dc.dataField] }}</span>\n    \t\t\t\t\t\t<span *ngIf=\"dc.render != null\" [innerHTML]=\"dc.render(dr[dc.dataField], dr, x)\"></span>\n                            <span *ngIf=\"dc.transforms\" [innerHTML]=\"transformWithPipe(dr[dc.dataField], dc.transforms)\"></span>\n                        </td>\n\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n            <div class=\"row\">\n                <div class=\"loading-icon col-md-offset-4 col-md-4\" style=\"text-align:center\" [class.active]=\"isLoading\"><i style=\"color:#DDD\" class=\"fa fa-cog fa-spin fa-3x fa-fw\"></i></div>\n                <div class=\"col-md-4\"><tg-page-nav style=\"float: right\" [numRows]=\"numVisibleRows\" [pageSize]=\"treeGridDef.pageSize\" (onNavClick)=\"goPage($event)\" *ngIf=\"treeGridDef.paging\" [currentPage]=\"currentPage\"></tg-page-nav></div>\n            </div>\n\t\t    ",
            styles: ["th {\n    color: brown;\n}\nth.tg-sortable:after { \n    font-family: \"FontAwesome\"; \n    opacity: .3;\n    float: right;\n    content: \"\\f0dc\";\n}\nth.tg-sort-asc:after { \n    font-family: \"FontAwesome\";\n    content: \"\\f0de\";\n    float: right;\n}\nth.tg-sort-desc:after { \n    font-family: \"FontAwesome\";\n    content: \"\\f0dd\";\n    float: right;\n}\nspan.tg-opened, span.tg-closed {\n    margin-right: 0px;\n    cursor: pointer;\n}\nspan.tg-opened:after {\n    font-family: \"FontAwesome\";\n    content: \"\\f078\";\n}\nspan.tg-closed:after {\n    font-family: \"FontAwesome\";\n    content: \"\\f054\";\n}\nth.tg-header-left { \n    text-align: left;\n}\nth.tg-header-right { \n    text-align: right;\n}\nth.tg-header-center { \n    text-align: center;\n}\ntd.tg-body-left { \n    text-align: left;\n}\ntd.tg-body-right { \n    text-align: right;\n}\ntd.tg-body-center { \n    text-align: center;\n}\n\ndiv.loading-icon  {\n    opacity: 0;\n    transition: opacity 2s;\n}\n\ndiv.loading-icon.active {\n    opacity: 100;\n    transition: opacity 0.1s;\n}\n\n.table-hover tbody tr:hover td, .table-hover tbody tr:hover th {\n  background-color: #E8F8F5;\n}\n"],
            directives: [SortableHeader, pagenav_component_1.PageNavigator],
            providers: [simpledata_service_1.SimpleDataService]
        }), 
        __metadata('design:paramtypes', [simpledata_service_1.SimpleDataService, core_2.ElementRef])
    ], TreeGrid);
    return TreeGrid;
}());
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.component.js.map