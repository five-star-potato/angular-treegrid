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
var TreeHierarchy = (function () {
    function TreeHierarchy() {
    }
    return TreeHierarchy;
}());
exports.TreeHierarchy = TreeHierarchy;
var TreeGridDef = (function () {
    function TreeGridDef() {
        this.columns = [];
        this.data = [];
        this.paging = true;
        this.sort = true;
        this.pageSize = 10; /* make it small for debugging */
        //currentPage: number = 0;
        this.defaultOrder = [];
        this.hierachy = new TreeHierarchy();
    }
    return TreeGridDef;
}());
exports.TreeGridDef = TreeGridDef;
/**
 * Page navigation control at the bottom
 */
var PageNavigator = (function () {
    function PageNavigator() {
        // fire the event when the user click, let the parent handle refreshing the page data
        this.onNavClick = new core_2.EventEmitter();
        this.onResetCurrent = new core_2.EventEmitter();
    }
    PageNavigator.prototype.refresh = function () {
        this.numPages = Math.ceil(this.numRows / this.pageSize);
        if (this.numPages > 0)
            if (this.currentPage.num >= this.numPages) {
                this.currentPage.num = this.numPages = -1;
            }
    };
    PageNavigator.prototype.ngOnChanges = function (changes) {
        this.refresh();
        var chng = changes["numRows"];
        var cur = JSON.stringify(chng.currentValue);
        var prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
    };
    PageNavigator.prototype.goPage = function (pn) {
        this.currentPage.num = pn;
        this.onNavClick.emit(pn);
    };
    PageNavigator.prototype.goPrev = function () {
        if (this.currentPage.num > 0)
            this.currentPage.num -= 1;
        this.onNavClick.emit(this.currentPage.num);
    };
    PageNavigator.prototype.goNext = function () {
        if (this.currentPage.num < (this.numPages - 1))
            this.currentPage.num += 1;
        this.onNavClick.emit(this.currentPage.num);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PageNavigator.prototype, "pageSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PageNavigator.prototype, "numRows", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "currentPage", void 0);
    __decorate([
        core_2.Output(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "onNavClick", void 0);
    __decorate([
        core_2.Output(), 
        __metadata('design:type', Object)
    ], PageNavigator.prototype, "onResetCurrent", void 0);
    PageNavigator = __decorate([
        core_1.Component({
            selector: 'tg-page-nav',
            template: "\n\t\t<ul class=\"pagination\">\n\t\t\t<li [class.disabled]=\"currentPage.num <= 0\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"goPage(0)\" aria-label=\"First\">\n\t\t\t\t<span aria-hidden=\"true\">&laquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage.num <= 0\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"goPrev()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&lsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li [class.disabled]=\"true\">\n\t\t\t\t<a href=\"javascript:void(0)\" aria-label=\"\">\n\t\t\t\t<span aria-hidden=\"true\">Page {{currentPage.num + 1}} of {{numPages}}</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li></li>\n\n\t\t\t<li [class.disabled]=\"currentPage.num >= numPages - 1\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"goNext()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&rsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage.num >= numPages - 1\">\n\t\t\t\t<a href=\"javascript:void(0)\" (click)=\"goPage(numPages - 1)\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&raquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t</ul>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], PageNavigator);
    return PageNavigator;
}());
exports.PageNavigator = PageNavigator;
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
    function TreeGrid(elementRef) {
        this.elementRef = elementRef;
        this.currentPage = { num: 0 };
        this.initalProcessed = false;
        this.sortDirType = datatree_1.SortDirection; // workaround to NG2 issues #2885
        this.currentPage.num = 0;
        console.log(this.elementRef);
    }
    TreeGrid.prototype.sortColumn = function (event) {
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
        this.treeGridDef.columns.forEach(function (item) {
            // can't find good ways to initialize interface
            if (item.sort == undefined)
                item.sort = true;
        });
        if (this.treeGridDef.data.length > 0)
            this.refresh();
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
    TreeGrid.prototype.toggleTree = function (node) {
        this.numVisibleRows = this.dataTree.toggleNode(node);
        this.goPage(this.currentPage.num);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', TreeGridDef)
    ], TreeGrid.prototype, "treeGridDef", void 0);
    __decorate([
        core_2.ViewChild(PageNavigator), 
        __metadata('design:type', PageNavigator)
    ], TreeGrid.prototype, "pageNav", void 0);
    TreeGrid = __decorate([
        core_1.Component({
            selector: 'tg-treegrid',
            template: "\n\t\t\t<table class=\"treegrid-table table table-striped table-hover table-bordered\" data-resizable-columns-id=\"resizable-table\">\n\t\t\t    <thead>\n\t\t\t\t    <tr>\n\t\t\t\t\t    <th (onSort)=\"sortColumn($event)\" *ngFor=\"let dc of treeGridDef.columns; let x = index\" data-resizable-column-id=\"#\" [style.width]=\"dc.width\" \n                            tg-sortable-header [colIndex]=\"x\" [sort]=\"dc.sort\" [innerHTML]=\"dc.labelHtml\" \n                                [class.tg-sortable]=\"treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC\"\n                                [class.tg-sort-asc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC\"\n                                [class.tg-sort-desc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC\" >\n                        </th>\n\t\t\t\t    </tr>\n\t\t\t    </thead>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr class='treegrid-tr' *ngFor=\"let dr of dataView; let x = index\">\n\t\t\t\t\t\t<td *ngFor=\"let dc of treeGridDef.columns; let y = index\" [style.padding-left]=\"y == 0 ? (dr.__node.level * 22).toString() + 'px' : ''\" [class]=\"dc.className\">\n                            <span class=\"tg-opened\" *ngIf=\"y == 0 &&  dr.__node.isOpen && dr.__node.childNodes.length > 0\" (click)=\"toggleTree(dr.__node)\">&nbsp;</span>\n                            <span class=\"tg-closed\" *ngIf=\"y == 0 && !dr.__node.isOpen && dr.__node.childNodes.length > 0\" (click)=\"toggleTree(dr.__node)\">&nbsp;</span>\n                            <span *ngIf=\"dc.render == null\">{{ dr[dc.dataField] }}</span>\n    \t\t\t\t\t\t<span *ngIf=\"dc.render != null\" [innerHTML]=\"dc.render(dr[dc.dataField], dr, x)\"></span>\n                        </td>\n\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n            <tg-page-nav style=\"float: right\" [numRows]=\"numVisibleRows\" [pageSize]=\"treeGridDef.pageSize\" (onNavClick)=\"goPage($event)\" *ngIf=\"treeGridDef.paging\" [currentPage]=\"currentPage\"></tg-page-nav>\n\t\t    ",
            styles: ["\n        th {\n            color: brown;\n        }\n        th.tg-sortable:after { \n            font-family: \"FontAwesome\"; \n            opacity: .3;\n            float: right;\n            content: \"\\f0dc\";\n        }\n        th.tg-sort-asc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0de\";\n            float: right;\n        }\n        th.tg-sort-desc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0dd\";\n            float: right;\n        }\n        span.tg-opened, span.tg-closed {\n            margin-right: 0px;\n            cursor: pointer;\n        }\n        span.tg-opened:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f078\";\n        }\n        span.tg-closed:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f054\";\n        }\n        .td-right { \n            text-align: right;\n        }\n    "],
            directives: [SortableHeader, PageNavigator]
        }), 
        __metadata('design:paramtypes', [core_2.ElementRef])
    ], TreeGrid);
    return TreeGrid;
}());
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.component.js.map