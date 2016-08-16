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
var TreeNodeState = (function () {
    function TreeNodeState() {
        this.state = "CLOSED";
        this.visible = false;
        this.level = 0;
        this.children = null;
    }
    return TreeNodeState;
}());
(function (SortDirection) {
    SortDirection[SortDirection["ASC"] = 0] = "ASC";
    SortDirection[SortDirection["DESC"] = 1] = "DESC";
})(exports.SortDirection || (exports.SortDirection = {}));
var SortDirection = exports.SortDirection;
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
        this.currentPage = 0;
        // fire the event when the user click, let the parent handle refreshing the page data
        this.onNavClick = new core_2.EventEmitter();
        this.onResetCurrent = new core_2.EventEmitter();
    }
    PageNavigator.prototype.refresh = function () {
        var numEntries = this.entries.filter(function (r) { return r.__STATE__.visible; }).length;
        this.numPages = Math.ceil(numEntries / this.pageSize);
        if (this.numPages > 0)
            if (this.currentPage >= this.numPages) {
                this.currentPage = this.numPages = -1;
            }
    };
    PageNavigator.prototype.ngOnChanges = function (changes) {
        this.refresh();
        /*
        let chng = changes["numEntries"];
        let cur = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        if (cur !== prev) {
            this.refresh();
        }
        */
    };
    PageNavigator.prototype.goPage = function (pn) {
        this.currentPage = pn;
        this.onNavClick.emit(pn);
    };
    PageNavigator.prototype.goPrev = function () {
        if (this.currentPage > 0)
            this.currentPage -= 1;
        this.onNavClick.emit(this.currentPage);
    };
    PageNavigator.prototype.goNext = function () {
        if (this.currentPage < (this.numPages - 1))
            this.currentPage += 1;
        this.onNavClick.emit(this.currentPage);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PageNavigator.prototype, "pageSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], PageNavigator.prototype, "entries", void 0);
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
            template: "\n\t\t<ul class=\"pagination\">\n\t\t\t<li [class.disabled]=\"currentPage <= 0\">\n\t\t\t\t<a href=\"#\" (click)=\"goPage(0)\" aria-label=\"First\">\n\t\t\t\t<span aria-hidden=\"true\">&laquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage <= 0\">\n\t\t\t\t<a href=\"#\" (click)=\"goPrev()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&lsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li [class.disabled]=\"true\">\n\t\t\t\t<a href=\"#\" aria-label=\"\">\n\t\t\t\t<span aria-hidden=\"true\">Page {{currentPage + 1}} of {{numPages}}</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\n\t\t\t<li></li>\n\n\t\t\t<li [class.disabled]=\"currentPage >= numPages - 1\">\n\t\t\t\t<a href=\"#\" (click)=\"goNext()\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&rsaquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t\t<li [class.disabled]=\"currentPage >= numPages - 1\">\n\t\t\t\t<a href=\"#\" (click)=\"goPage(numPages - 1)\" aria-label=\"Previous\">\n\t\t\t\t<span aria-hidden=\"true\">&raquo;</span>\n\t\t\t\t</a>\n\t\t\t</li>\n\t\t</ul>\n    "
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
        this.sortDir = (this.sortDir == null) ? SortDirection.ASC : (this.sortDir == SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
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
        this.initalProcessed = false;
        this.sortDirType = SortDirection; // workaround to NG2 issues #2885
        console.log(this.elementRef);
    }
    TreeGrid.prototype.sortFunc = function (arr, columnName, dir) {
        arr.sort(function (a, b) {
            if (dir == SortDirection.ASC)
                return a[columnName] > b[columnName] ? 1 : (a[columnName] < b[columnName] ? -1 : 0);
            else
                return a[columnName] < b[columnName] ? 1 : (a[columnName] > b[columnName] ? -1 : 0);
        });
    };
    // reassign the elements back to the indexed position
    TreeGrid.prototype.rearrangeIndex = function (indices, arr) {
        var _this = this;
        indices.forEach(function (i) {
            _this.treeGridDef.data[i] = arr[i];
        });
    };
    TreeGrid.prototype.sortChildren = function (pk, fk, columnName, parentRow, dir) {
        var _this = this;
        var childrenKeys;
        var childrenRows = [];
        var indices = [];
        var cnt = this.treeGridDef.data.length;
        // if this is not first time calling (parentRow == null) and you have no children, then nothing to sort, just return;
        if (parentRow && parentRow.__STATE__.children.length == 0)
            return;
        if (parentRow != null)
            childrenKeys = parentRow.__STATE__.children;
        for (var i = 0; i < cnt; i++) {
            var r = this.treeGridDef.data[i];
            var toInclude = false;
            if (parentRow == null) {
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
        childrenRows.forEach(function (c) {
            _this.sortChildren(pk, fk, columnName, c, dir);
        });
    };
    TreeGrid.prototype.sortColumn = function (event) {
        // assuming that we can only sort one column at a time;
        // clear all the sortDirection flags across columns;
        var dir = event.sortDirection;
        this.treeGridDef.columns.forEach(function (item) {
            item.sortDirection = null;
        });
        this.treeGridDef.columns[event.columnIndex].sortDirection = event.sortDirection;
        var columnName = this.treeGridDef.columns[event.columnIndex].dataField;
        var pk = this.treeGridDef.hierachy.primaryKeyField;
        var fk = this.treeGridDef.hierachy.foreignKeyField;
        if (pk && fk) {
            this.sortChildren(pk, fk, columnName, null, dir);
        }
        else
            this.sortFunc(this.treeGridDef.data, columnName, dir);
        this.refresh();
    };
    TreeGrid.prototype.refresh = function () {
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
    };
    TreeGrid.prototype.groupItemsHierarchy = function () {
        var tmpDest = [];
        var tmpSrc = this.treeGridDef.data.slice();
        var fk = this.treeGridDef.hierachy.foreignKeyField;
        var pk = this.treeGridDef.hierachy.primaryKeyField;
        // Initial loop; move all the root nodes to tmpDest;
        var k = tmpSrc.length;
        var lvl = 0;
        while (k--) {
            if (tmpSrc[k][fk] == null) {
                var row = tmpSrc.splice(k, 1)[0];
                row.__STATE__ = new TreeNodeState();
                row.__STATE__.visible = true;
                tmpDest.unshift(row);
            }
        }
        var i = 0;
        while (i < tmpDest.length) {
            // continuously insert rows from src to dest until all the rows in dest are processed; at the end of the process ,src should become empty
            var parentRow = tmpDest[i];
            if (!parentRow.__STATE__.children) {
                parentRow.__STATE__.children = [];
                var pkVal = parentRow[pk];
                k = tmpSrc.length;
                while (k--) {
                    if (tmpSrc[k][fk] == pkVal) {
                        var childRow = tmpSrc.splice(k, 1)[0];
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
        var sz = this.treeGridDef.pageSize;
        var tmpSrc = this.treeGridDef.data.filter(function (r) { return r.__STATE__.visible; });
        if (this.treeGridDef.paging)
            this.dataView = tmpSrc.slice(pn * sz, (pn + 1) * sz);
        else
            this.dataView = tmpSrc.slice(0);
    };
    TreeGrid.prototype.openTree = function (pkVal) {
        var pkField = this.treeGridDef.hierachy.primaryKeyField;
        var row = this.treeGridDef.data.filter(function (r) { return r[pkField] == pkVal; })[0];
        row.__STATE__.state = "OPENED";
        this.toggleDescendantsDisplay(pkField, row, true);
        this.refresh();
    };
    TreeGrid.prototype.closeTree = function (pkVal) {
        var pkField = this.treeGridDef.hierachy.primaryKeyField;
        var row = this.treeGridDef.data.filter(function (r) { return r[pkField] == pkVal; })[0];
        row.__STATE__.state = "CLOSED";
        this.toggleDescendantsDisplay(pkField, row, false);
        this.refresh();
    };
    TreeGrid.prototype.toggleDescendantsDisplay = function (pkField, parentRow, show) {
        var _this = this;
        var childrenRows = parentRow.__STATE__.children;
        var parentIsOpen = (parentRow.__STATE__.state == "OPENED");
        if (childrenRows) {
            this.treeGridDef.data.filter(function (r) { return childrenRows.includes(r[pkField]); }).forEach(function (c) {
                if (show) {
                    if (parentIsOpen) {
                        c.__STATE__.visible = true;
                        _this.toggleDescendantsDisplay(pkField, c, show);
                    }
                }
                else {
                    // when closing, everything closes
                    c.__STATE__.visible = false;
                    _this.toggleDescendantsDisplay(pkField, c, show);
                }
            });
        }
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
            template: "\n\t\t\t<table class=\"treegrid-table table table-striped table-hover\" data-resizable-columns-id=\"resizable-table\">\n\t\t\t    <thead>\n\t\t\t\t    <tr>\n\t\t\t\t\t    <th (onSort)=\"sortColumn($event)\" *ngFor=\"let dc of treeGridDef.columns; let x = index\" data-resizable-column-id=\"#\" [style.width]=\"dc.width\" \n                            tg-sortable-header [colIndex]=\"x\" [sort]=\"dc.sort\" [innerHTML]=\"dc.labelHtml\" \n                                [class.tg-sortable]=\"treeGridDef.sort && dc.sort && dc.sortDirection != sortDirType.ASC && dc.sortDirection != sortDirType.DESC\"\n                                [class.tg-sort-asc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.ASC\"\n                                [class.tg-sort-desc]=\"treeGridDef.sort && dc.sort && dc.sortDirection == sortDirType.DESC\" >\n                        </th>\n\t\t\t\t    </tr>\n\t\t\t    </thead>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr class='treegrid-tr' *ngFor=\"let dr of dataView; let x = index\">\n\t\t\t\t\t\t<td class='treegrid-td' *ngFor=\"let dc of treeGridDef.columns; let y = index\" [style.padding-left]=\"y == 0 ? (dr.__STATE__.level * 15).toString() + 'px' : ''\" [class]=\"dc.className\">\n                            <span [class.tg-opened]=\"y == 0 && dr.__STATE__.state == 'OPENED' && dr.__STATE__.children.length > 0\" (click)=\"closeTree(dr[treeGridDef.hierachy.primaryKeyField])\">&nbsp;</span>\n                            <span [class.tg-closed]=\"y == 0 && dr.__STATE__.state == 'CLOSED' && dr.__STATE__.children.length > 0\" (click)=\"openTree(dr[treeGridDef.hierachy.primaryKeyField])\">&nbsp;</span>\n                            <span *ngIf=\"dc.render == null\">{{ dr[dc.dataField] }}</span>\n    \t\t\t\t\t\t<span *ngIf=\"dc.render != null\" [innerHTML]=\"dc.render(dr[dc.dataField], dr, x)\"></span>\n                        </td>\n\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n            <tg-page-nav [entries]=\"treeGridDef.data\" [pageSize]=\"treeGridDef.pageSize\" (onNavClick)=\"goPage($event)\" *ngIf=\"treeGridDef.paging\"></tg-page-nav>\n\t\t    ",
            styles: ["\n        th {\n            color: brown;\n        }\n        th.tg-sortable:after { \n            font-family: \"FontAwesome\"; \n            opacity: .3;\n            float: right;\n            content: \"\\f0dc\";\n        }\n        th.tg-sort-asc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0de\";\n            float: right;\n        }\n        th.tg-sort-desc:after { \n            font-family: \"FontAwesome\";\n            content: \"\\f0dd\";\n            float: right;\n        }\n        span.tg-opened, span.tg-closed {\n            margin-right: 0px;\n            cursor: printer; cursor: hand;\n        }\n        span.tg-opened:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f078\";\n        }\n        span.tg-closed:after {\n            font-family: \"FontAwesome\";\n            content: \"\\f054\";\n        }\n    "],
            directives: [SortableHeader, PageNavigator]
        }), 
        __metadata('design:paramtypes', [core_2.ElementRef])
    ], TreeGrid);
    return TreeGrid;
}());
exports.TreeGrid = TreeGrid;
//# sourceMappingURL=treegrid.component.js.map