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
/* followed the instruction here to integrate with jQuery */
/* http://stackoverflow.com/questions/34762720/using-jquery-globaly-within-angular-2-application */
/// <reference path="../../../typings/jquery/jquery.d.ts" />
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var datatree_1 = require('./datatree');
var pagenav_component_1 = require('./pagenav.component');
var simpledata_service_1 = require('./simpledata.service');
var TreeGridDef = (function () {
    function TreeGridDef() {
        this.columns = [];
        this.data = [];
        this.paging = true;
        this.sort = true;
        this.pageSize = 10; /* make it small for debugging */
        //currentPage: number = 0;
        this.defaultOrder = [];
        this.hierachy = null;
        this.ajax = null;
    }
    return TreeGridDef;
}());
exports.TreeGridDef = TreeGridDef;
/**
* Controls the sorting by clicking the page header
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
        this.sortDir = (this.sortDir == null) ? datatree_1.SortDirection.ASC : (this.sortDir == datatree_1.SortDirection.ASC ? datatree_1.SortDirection.DESC : datatree_1.SortDirection.ASC);
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
        core_1.Input(), 
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
        this.currentPage = { num: 0 };
        this.initalProcessed = false;
        this.sortDirType = datatree_1.SortDirection; // workaround to NG2 issues #2885
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
    // test to see if the node should show an icon for opening the subtree
    TreeGrid.prototype.testNodeForExpandIcon = function (row) {
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
            this.dataTree = new datatree_1.DataTree(this.treeGridDef.data, this.treeGridDef.hierachy.primaryKeyField, this.treeGridDef.hierachy.foreignKeyField);
            this.numVisibleRows = this.dataTree.recountDisplayCount();
            this.initalProcessed = true;
        }
        this.goPage(this.currentPage.num);
        if (this.treeGridDef.paging)
            this.pageNav.refresh(); // the ngOnChanges on page nav component didn't capture changes to the data array (it seemes).
    };
    TreeGrid.prototype.ngAfterViewInit = function () {
        // Initialize resizable columns after everything is rendered
        var y;
        y = jQuery(this.elementRef.nativeElement).find('table');
        y.resizableColumns();
    };
    TreeGrid.prototype.ngOnInit = function () {
        var _this = this;
        this.treeGridDef.columns.forEach(function (item) {
            // can't find good ways to initialize interface
            if (item.sort == undefined)
                item.sort = true;
        });
        var ajax = this.treeGridDef.ajax;
        if (ajax != null) {
            if (ajax.method == "POST") {
                this.dataService.post(ajax.url).subscribe(function (ret) {
                    _this.treeGridDef.data = ret;
                    _this.refresh();
                }, function (err) { console.log(err); });
            }
            else {
                this.dataService.get(ajax.url).subscribe(function (ret) {
                    _this.treeGridDef.data = ret;
                    _this.refresh();
                }, function (err) { console.log(err); });
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
                this.dataService.post(ajax.url + "/" + node.row[this.treeGridDef.hierachy.primaryKeyField]).subscribe(function (ret) {
                    // the idea is to get the children rows from ajax (on demand), append the rows to the end of treeGridDef.data; and construct the tree branch based on these new data
                    var startIndex = _this.treeGridDef.data.length;
                    var endIndex = startIndex + ret.length - 1;
                    ret.forEach(function (r) { return _this.treeGridDef.data.push(r); });
                    node.isLoaded = true;
                    _this.dataTree.addRows(startIndex, endIndex, node);
                    _this.toggleTreeNode(node);
                }, function (err) { console.log(err); });
            }
            else
                this.toggleTreeNode(node);
        }
        else
            this.toggleTreeNode(node);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', TreeGridDef)
    ], TreeGrid.prototype, "treeGridDef", void 0);
    __decorate([
        core_2.ViewChild(pagenav_component_1.PageNavigator), 
        __metadata('design:type', pagenav_component_1.PageNavigator)
    ], TreeGrid.prototype, "pageNav", void 0);
    TreeGrid = __decorate([
        core_1.Component({
            selector: 'tg-treegrid',
            template: "\n\t\t\t<table class=\"treegrid-table table table-striped table-hover table-bordered\" data-resizable-columns-id=\"resizable-table\">\n                <colgroup>\n                </colgroup>\n\t\t\t    <thead>\n\t\t\t\t    <tr>\n\t\t\t\t\t    <th (onSort)=\"sortColumnEvtHandler($event)\" *ngFor=\"let dc of treeGridDef.columns; let x = index\" data-resizable-column-id=\"#\" [style.width]=\"dc.width\" [class]=\"dc.className\"\n                            tg-sortable-header [colIndex]=\"x\" [sort]=\"dc.sort\" [innerHTML]=\"dc.labelHtml\" \n                                [class.tg-sortable]=\"treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC\"\n                                [class.tg-sort-asc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC\"\n                                [class.tg-sort-desc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC\" >\n                        </th>\n\t\t\t\t    </tr>\n\t\t\t    </thead>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr class='treegrid-tr' *ngFor=\"let dr of dataView; let x = index\">\n\t\t\t\t\t\t<td *ngFor=\"let dc of treeGridDef.columns; let y = index\" [style.padding-left]=\"y == 0 ? (dr.__node.level * 20 + 8).toString() + 'px' : ''\" [class]=\"dc.className\">\n                            <span class=\"tg-opened\" *ngIf=\"y == 0 && dr.__node.isOpen && dr.__node.childNodes.length > 0\" (click)=\"toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                            <span class=\"tg-closed\" *ngIf=\"y == 0 && testNodeForExpandIcon(dr)\" (click)=\"toggleTreeEvtHandler(dr.__node)\">&nbsp;</span>\n                            <span *ngIf=\"dc.render == null\">{{ dr[dc.dataField] }}</span>\n    \t\t\t\t\t\t<span *ngIf=\"dc.render != null\" [innerHTML]=\"dc.render(dr[dc.dataField], dr, x)\"></span>\n                        </td>\n\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n            <tg-page-nav style=\"float: right\" [numRows]=\"numVisibleRows\" [pageSize]=\"treeGridDef.pageSize\" (onNavClick)=\"goPage($event)\" *ngIf=\"treeGridDef.paging\" [currentPage]=\"currentPage\"></tg-page-nav>\n\t\t    ",
            styles: ["\n        th {\n            color: brown;\n        }\n        th.tg-sortable:after { \n            font-family: \"FontAwesome\"; \n            opacity: .3;\n            float: right;\n            content: \"\\f0dc\";\n        }\n        th.tg-sort-asc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0de\";\n            float: right;\n        }\n        th.tg-sort-desc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0dd\";\n            float: right;\n        }\n        span.tg-opened, span.tg-closed {\n            margin-right: 0px;\n            cursor: pointer;\n        }\n        span.tg-opened:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f078\";\n        }\n        span.tg-closed:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f054\";\n        }\n        th.tg-header-left { \n            text-align: left;\n        }\n        th.tg-header-right { \n            text-align: right;\n        }\n        th.tg-header-center { \n            text-align: center;\n        }\n        td.tg-body-left { \n            text-align: left;\n        }\n        td.tg-body-right { \n            text-align: right;\n        }\n        td.tg-body-center { \n            text-align: center;\n        }\n    "],
            directives: [SortableHeader, pagenav_component_1.PageNavigator],
            providers: [simpledata_service_1.SimpleDataService]
        }), 
        __metadata('design:paramtypes', [simpledata_service_1.SimpleDataService, core_2.ElementRef])
    ], TreeGrid);
    return TreeGrid;
}());
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.component.js.map