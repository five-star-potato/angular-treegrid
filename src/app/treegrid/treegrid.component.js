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
var forms_1 = require('@angular/forms');
var Rx_1 = require('rxjs/Rx');
var datatree_1 = require('./datatree');
var pagenav_component_1 = require('./pagenav.component');
var simpledata_service_1 = require('./simpledata.service');
var treedef_1 = require("./treedef");
var utils_1 = require('./utils');
var WikipediaService_1 = require('./WikipediaService');
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
        this._sortDir = null;
        /* the actual sorting is done by the parent */
        this.onSort = new core_2.EventEmitter();
        this._el = e.nativeElement;
        this._vc = vr;
    }
    SortableHeader.prototype.onMouseEnter = function () {
        this._highlight('#DDD');
    };
    SortableHeader.prototype.onMouseLeave = function () {
        this._highlight(null);
    };
    SortableHeader.prototype.onClick = function () {
        if (!this.sortable)
            return;
        // cyling sortDir among -1,0,1; don't check !this.sortDir because 0 is a valid value
        this._sortDir = (this._sortDir == undefined) ? treedef_1.SortDirection.ASC : (this._sortDir == treedef_1.SortDirection.ASC ? treedef_1.SortDirection.DESC : treedef_1.SortDirection.ASC);
        this.onSort.emit({ columnIndex: this.colIndex, sortDirection: this._sortDir });
        console.log('header clicked');
    };
    SortableHeader.prototype._highlight = function (color) {
        this._el.style.backgroundColor = color;
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
    ], SortableHeader.prototype, "sortable", void 0);
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
    function TreeGrid(dataService, elementRef, utils, wikipediaService) {
        this.dataService = dataService;
        this.elementRef = elementRef;
        this.utils = utils;
        this.wikipediaService = wikipediaService;
        this.debugVar = 0;
        this.onRowDblClick = new core_2.EventEmitter();
        this.currentPage = { num: 0 };
        this.isLoading = false; // show loading icon
        this.DEFAULT_CLASS = "table table-hover table-striped table-bordered";
        this.searchField = this.ANY_SEARCH_COLUMN;
        this.searchLabel = "Any column";
        this._setIsLoaded = false; // need to know whether to set each node to be "loaded"; in the case of a search result, I always set it to loaded, to avoid duplicate rows
        this.term = new forms_1.FormControl();
        this.self = this; // copy of context
        this.isDataTreeConstructed = false;
        this.sortDirType = treedef_1.SortDirection; // workaround to NG2 issues #2885, i.e. you can't use Enum in template html as is.
        this.currentPage.num = 0;
    }
    Object.defineProperty(TreeGrid.prototype, "ANY_SEARCH_COLUMN", {
        get: function () { return "[any]"; },
        enumerable: true,
        configurable: true
    });
    TreeGrid.prototype.ngAfterViewInit = function () {
        // Initialize resizable columns after everything is rendered
        var y;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();
        if (this.treeGridDef.paging && this.pageNav)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype.ngOnInit = function () {
        var _this = this;
        this.treeGridDef.columns.forEach(function (item) {
            // can't find good ways to initialize interface
            if (item.sortable == undefined)
                item.sortable = true;
            if (item.searchable == undefined)
                item.searchable = true;
        });
        var ajax = this.treeGridDef.ajax;
        if (ajax) {
            if (!ajax.method)
                ajax.method = "GET";
            if (ajax.method != "GET" && ajax.method != "POST") {
                throw new Error("Ajax Method must be GET or POST");
            }
            if (!ajax.doNotLoad) {
                this.reloadAjax();
            }
        }
        else if (this.treeGridDef.data.length > 0) {
            this._dataBackup = this.treeGridDef.data;
            this.refresh();
        }
        if (!this.treeGridDef.className)
            this.treeGridDef.className = this.DEFAULT_CLASS;
        // Based on the blog: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
        if (this.treeGridDef.search) {
            this.term.valueChanges
                .debounceTime(400)
                .distinctUntilChanged()
                .switchMap(function (term) { return _this._searchOrReloadObservable(term, _this.searchField); })
                .subscribe(function (ret) { _this._reloadData(ret); }, function (err) { console.log(err); });
        }
    };
    TreeGrid.prototype._sortColumnEvtHandler = function (event) {
        // assuming that we can only sort one column at a time;
        // clear all the sortDirection flags across columns;
        var dir = event.sortDirection;
        this.treeGridDef.columns.forEach(function (item) {
            item.sortDirection = null;
        });
        this.treeGridDef.columns[event.columnIndex].sortDirection = event.sortDirection;
        this.sortColumnField = this.treeGridDef.columns[event.columnIndex].dataField;
        this.sortDirection = event.sortDirection;
        this.dataTree.sortByColumn(this.sortColumnField, this.sortDirection);
        this.refresh();
    };
    // Calculate how much indentation we need per level; notice that the open/close icon are not of the same width
    TreeGrid.prototype._calcIndent = function (row) {
        var showExpand = this._showExpandIcon(row);
        var showCollapse = this._showCollapseIcon(row);
        var ident = row.__node.level * 20 + 10;
        if (showExpand)
            ident -= 17;
        else if (showCollapse)
            ident -= 21;
        return ident;
    };
    TreeGrid.prototype._showCollapseIcon = function (row) {
        if (!row.__node)
            return false;
        return (row.__node.isOpen && row.__node.childNodes.length > 0);
    };
    // test to see if the node should show an icon for opening the subtree
    TreeGrid.prototype._showExpandIcon = function (row) {
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
    // Handling Pagination logic
    TreeGrid.prototype._goPage = function (pn) {
        var _this = this;
        var sz = this.treeGridDef.pageSize;
        var rowInds; // indices of the paged data rows
        if (this.treeGridDef.paging)
            rowInds = this.dataTree.getPageData(pn, sz);
        else
            rowInds = this.dataTree.getPageData(0, -1);
        this.dataView = [];
        rowInds.forEach(function (i) {
            return _this.dataView.push(_this.treeGridDef.data[i]);
        });
    };
    // These few statments are needed a few times in toggleTreeEvtHandler, so I grouped them together
    TreeGrid.prototype._toggleTreeNode = function (node) {
        this.numVisibleRows = this.dataTree.toggleNode(node);
        this._goPage(this.currentPage.num);
        if (this.treeGridDef.paging && this.pageNav)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype._toggleTreeEvtHandler = function (node) {
        var _this = this;
        var ajax = this.treeGridDef.ajax;
        if (ajax) {
            if (ajax.lazyLoad && !node.isLoaded) {
                this.isLoading = true;
                this.dataService.send(ajax.method, ajax.url + "?id=" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe(function (ret) {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    node.isLoaded = true;
                    if (ret.length > 0) {
                        var startIndex = _this.treeGridDef.data.length;
                        var endIndex = startIndex + ret.length - 1;
                        ret.forEach(function (r) { return _this.treeGridDef.data.push(r); });
                        _this.dataTree.addRows(startIndex, endIndex, node);
                        // The data has been sorted, the newly loaded data should be sorted as well.
                        if (_this.sortColumnField) {
                            _this.dataTree.sortNode(node, _this.sortColumnField, _this.sortDirection);
                        }
                    }
                    _this._toggleTreeNode(node);
                    _this.isLoading = false;
                }, function (err) { console.log(err); });
            }
            else
                this._toggleTreeNode(node);
        }
        else
            this._toggleTreeNode(node);
    };
    TreeGrid.prototype._dblClickRow = function (row) {
        this.selectedRow = row;
        this.onRowDblClick.emit(row);
    };
    TreeGrid.prototype._reloadData = function (data) {
        this.isDataTreeConstructed = false;
        this.treeGridDef.data = data;
        this.refresh();
    };
    // I tried to push the decision to whether search or reload the data (two different Urls) to the last minute
    TreeGrid.prototype._searchOrReloadObservable = function (term, field) {
        if (term) {
            this._setIsLoaded = true;
            if (this.treeGridDef.search) {
                if (typeof this.treeGridDef.search === "object") {
                    var cfg = this.treeGridDef.search;
                    if (cfg && cfg.method && cfg.url)
                        return this.dataService.send(cfg.method, cfg.url + "?value=" + term + "&field=" + field);
                    else
                        throw new Error("Search config missing");
                }
                else {
                    var searchResult = this._searchInExistingData(term, field);
                    return Rx_1.Observable.from(searchResult).toArray();
                }
            }
        }
        else {
            if (this.treeGridDef.ajax) {
                this._setIsLoaded = false;
                var ajax = this.treeGridDef.ajax;
                if (ajax && ajax.url)
                    return this.dataService.send(ajax.method, ajax.url);
                else
                    throw new Error("Ajax config missing");
            }
            else {
                return Rx_1.Observable.from(this._dataBackup).toArray();
            }
        }
    };
    // handles the search column dropdown change
    TreeGrid.prototype._searchColumnChange = function (field, labelHTML) {
        var _this = this;
        this.searchField = field;
        this.searchLabel = labelHTML;
        if (this.term.value) {
            this._searchOrReloadObservable(this.term.value, this.searchField).subscribe(function (ret) {
                _this._reloadData(ret);
            }, function (err) { console.log(err); });
        }
    };
    TreeGrid.prototype._searchInExistingData = function (term, field) {
        var searchResult = new Set();
        if (field === this.ANY_SEARCH_COLUMN) {
            // user may choose search any fields
            var _loop_1 = function(dc) {
                if (dc.searchable)
                    // remember to search from the initial dataset; not withing the prev search result
                    this_1._dataBackup.filter(function (row) { return row[dc.dataField].toString().toLowerCase().includes(term); })
                        .forEach(function (x) { return searchResult.add(x); });
            };
            var this_1 = this;
            for (var _i = 0, _a = this.treeGridDef.columns; _i < _a.length; _i++) {
                var dc = _a[_i];
                _loop_1(dc);
            }
        }
        else {
            searchResult.add(this.treeGridDef.data.filter(function (row) { return row[field].toString().toLowerCase().includes(term); }));
        }
        return Array.from(searchResult);
    };
    TreeGrid.prototype._transformWithPipe = function (value, trans) {
        var v = value;
        trans.forEach(function (t) {
            v = t.pipe.transform(v, t.param);
        });
        return v;
    };
    TreeGrid.prototype.saveSelectedRowchanges = function (copyRow) {
        Object.assign(this.selectedRow, copyRow);
    };
    TreeGrid.prototype.reloadAjax = function (url) {
        var _this = this;
        var ajax = this.treeGridDef.ajax;
        if (ajax && (url || ajax.url)) {
            this.isLoading = true;
            this.dataService.send(ajax.method, url ? url : ajax.url).subscribe(function (ret) {
                _this._reloadData(ret);
            }, function (err) { console.log(err); });
        }
    };
    // the setIsLoaded flag is to be used by Searching - searching may return partial hierarhies. I would consider the node "isLoaded", therefore no more ajax call to reload the node.
    // otherwise the ajax call will create duplicate rows
    TreeGrid.prototype.refresh = function () {
        if (!this.isDataTreeConstructed) {
            if (this.treeGridDef.hierachy && this.treeGridDef.hierachy.primaryKeyField && this.treeGridDef.hierachy.foreignKeyField)
                this.dataTree = new datatree_1.DataTree(this.treeGridDef.data, this.treeGridDef.hierachy.primaryKeyField, this.treeGridDef.hierachy.foreignKeyField, this._setIsLoaded);
            else
                this.dataTree = new datatree_1.DataTree(this.treeGridDef.data);
            this.numVisibleRows = this.dataTree.recountDisplayCount();
            this.isDataTreeConstructed = true;
        }
        this._goPage(this.currentPage.num);
        if (this.treeGridDef.paging && this.pageNav)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', treedef_1.TreeGridDef)
    ], TreeGrid.prototype, "treeGridDef", void 0);
    __decorate([
        core_2.Output(), 
        __metadata('design:type', Object)
    ], TreeGrid.prototype, "onRowDblClick", void 0);
    __decorate([
        core_2.ViewChild(pagenav_component_1.PageNavigator), 
        __metadata('design:type', pagenav_component_1.PageNavigator)
    ], TreeGrid.prototype, "pageNav", void 0);
    TreeGrid = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'tg-treegrid',
            template: "\n        <form class=\"form-inline\" style=\"margin:5px\" *ngIf=\"treeGridDef.search\">\n            <div class=\"form-group\">\n                <div class=\"dropdown\" style=\"display:inline\">\n                      <button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">\n                        {{ searchLabel }}\n                        <span class=\"caret\"></span>\n                      </button>\n                      <ul class=\"dropdown-menu\" aria-labelledby=\"dropdownMenu1\">\n                        <li (click)=\"_searchColumnChange(ANY_SEARCH_COLUMN, 'Any column')\"><a >Any column</a></li>\n                        <li role=\"separator\" class=\"divider\"></li>\n                        <template ngFor let-dc [ngForOf]=\"treeGridDef.columns\" >\n                            <li *ngIf=\"dc.searchable\"><a (click)=\"_searchColumnChange(dc.dataField, dc.labelHtml)\" [innerHTML]=\"utils.stripHTML(dc.labelHtml)\"></a></li>\n                        </template>\n                      </ul>\n                </div>\n            </div>\n            <div class=\"form-group\">\n                <input type=\"text\" [formControl]=\"term\" class=\"form-control\" id=\"searchText\" placeholder=\"Type to search\">\n            </div>\n        </form>\n\n        <table [class]=\"treeGridDef.className\" data-resizable-columns-id=\"resizable-table\">\n            <colgroup>\n                    <!-- providing closing tags broke NG template parsing -->    \n                    <col *ngFor=\"let dc of treeGridDef.columns\" [class]=\"dc.className\"> \n            </colgroup>\n            <thead>\n                <tr>\n                    <th (onSort)=\"_sortColumnEvtHandler($event)\" *ngFor=\"let dc of treeGridDef.columns; let x = index\" data-resizable-column-id=\"#\" [style.width]=\"dc.width\" [class]=\"dc.className\"\n                        tg-sortable-header [column-index]=\"x\" [sortable]=\"dc.sortable\" [innerHTML]=\"dc.labelHtml\" \n                            [class.tg-sortable]=\"treeGridDef.sortable && dc.sortable && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC\"\n                            [class.tg-sort-asc]=\"treeGridDef.sortable && dc.sortable && dc.sortDirection == sortDirType.ASC\"\n                            [class.tg-sort-desc]=\"treeGridDef.sortable && dc.sortable && dc.sortDirection == sortDirType.DESC\" \n                            >\n                    </th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr *ngFor=\"let dr of dataView; let x = index\" (dblclick)=\"_dblClickRow(dr)\">\n                    <td *ngFor=\"let dc of treeGridDef.columns; let y = index\" [style.padding-left]=\"y == 0 ? _calcIndent(dr).toString() + 'px' : ''\" [class]=\"dc.className\">\n                        <span class=\"tg-opened\" *ngIf=\"y == 0 && _showCollapseIcon(dr)\" (click)=\"_toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                        <span class=\"tg-closed\" *ngIf=\"y == 0 && _showExpandIcon(dr)\" (click)=\"_toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                        <span *ngIf=\"!dc.render && !dc.transforms\">{{ dr[dc.dataField] }}</span>\n                        <span *ngIf=\"dc.render != null\" [innerHTML]=\"dc.render(dr[dc.dataField], dr, x)\"></span>\n                        <span *ngIf=\"dc.transforms\" [innerHTML]=\"_transformWithPipe(dr[dc.dataField], dc.transforms)\"></span>\n                    </td>\n\n                </tr>\n            </tbody>\n        </table>\n        <div class=\"row\">\n            <div class=\"loading-icon col-md-offset-4 col-md-4\" style=\"text-align:center\" [class.active]=\"isLoading\"><i style=\"color:#DDD\" class=\"fa fa-cog fa-spin fa-3x fa-fw\"></i></div>\n            <div class=\"col-md-4\"><tg-page-nav style=\"float: right\" [numRows]=\"numVisibleRows\" [pageSize]=\"treeGridDef.pageSize\" (onNavClick)=\"_goPage($event)\" *ngIf=\"treeGridDef.paging\" [currentPage]=\"currentPage\"></tg-page-nav></div>\n        </div>\n            ",
            styles: ["th {\n    color: brown;\n}\nth.tg-sortable:after { \n    font-family: \"FontAwesome\"; \n    opacity: .3;\n    float: right;\n    content: \"\\f0dc\";\n}\nth.tg-sort-asc:after { \n    font-family: \"FontAwesome\";\n    content: \"\\f0de\";\n    float: right;\n}\nth.tg-sort-desc:after { \n    font-family: \"FontAwesome\";\n    content: \"\\f0dd\";\n    float: right;\n}\nspan.tg-opened, span.tg-closed {\n    margin-right: 0px;\n    cursor: pointer;\n}\nspan.tg-opened:after {\n    font-family: \"FontAwesome\";\n    content: \"\\f078\";\n}\nspan.tg-closed:after {\n    font-family: \"FontAwesome\";\n    content: \"\\f054\";\n}\nth.tg-header-left { \n    text-align: left;\n}\nth.tg-header-right { \n    text-align: right;\n}\nth.tg-header-center { \n    text-align: center;\n}\ntd.tg-body-left { \n    text-align: left;\n}\ntd.tg-body-right { \n    text-align: right;\n}\ntd.tg-body-center { \n    text-align: center;\n}\n\ndiv.loading-icon  {\n    opacity: 0;\n    transition: opacity 2s;\n}\n\ndiv.loading-icon.active {\n    opacity: 100;\n    transition: opacity 0.1s;\n}\n\n.table-hover tbody tr:hover td, .table-hover tbody tr:hover th {\n  background-color: #E8F8F5;\n}\n"],
            directives: [SortableHeader, pagenav_component_1.PageNavigator],
            providers: [simpledata_service_1.SimpleDataService, utils_1.Utils, WikipediaService_1.WikipediaService]
        }), 
        __metadata('design:paramtypes', [simpledata_service_1.SimpleDataService, core_2.ElementRef, utils_1.Utils, WikipediaService_1.WikipediaService])
    ], TreeGrid);
    return TreeGrid;
}());
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.component.js.map